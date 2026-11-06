import { normaliseLine, normaliseMultiline, neutraliseFormula } from '@/lib/sanitise';
import { enquiryTypeLabel, type EnquiryInput } from '@/lib/enquiry-schema';

/**
 * ENQUIRY DELIVERY ADAPTER
 * ========================
 *
 * The website must never claim an enquiry was received when it was not. This
 * module is the single place that decides whether a submission can actually be
 * delivered, and it reports the truth back to the route handler.
 *
 * Modes, from `ENQUIRY_DELIVERY_MODE`:
 *
 *   unconfigured (default)
 *     No destination has been supplied. Nothing is sent. The route returns 503
 *     with code `delivery_not_configured`, the form tells the visitor plainly
 *     that submission is unavailable and shows how to reach the business by
 *     other means. No enquiry is silently discarded — the visitor still has
 *     their text on screen.
 *
 *   webhook
 *     POST the enquiry as JSON to ENQUIRY_WEBHOOK_URL. Success is defined
 *     strictly as a 2xx response from that endpoint. Anything else — 4xx, 5xx,
 *     timeout, DNS failure — is a failure and is reported as one.
 *
 *   console
 *     Print to the server log. Development only. Refused in production so a
 *     live site can never swallow enquiries into a log nobody reads.
 *
 * To activate: set ENQUIRY_DELIVERY_MODE=webhook and ENQUIRY_WEBHOOK_URL to a
 * destination that accepts a JSON POST. See ENVIRONMENT_SETUP.md.
 */

export type DeliveryMode = 'unconfigured' | 'webhook' | 'console';

export type DeliveryOutcome =
  | { status: 'delivered'; mode: DeliveryMode; reference: string }
  | { status: 'not_configured' }
  | { status: 'failed'; reason: string; retryable: boolean };

export type DeliveryContext = {
  /** Correlates the visitor's on-screen message with the server record. */
  reference: string;
  receivedAt: string;
  ip: string | null;
  userAgent: string | null;
};

export function getDeliveryMode(): DeliveryMode {
  const raw = (process.env.ENQUIRY_DELIVERY_MODE ?? '').trim().toLowerCase();

  if (raw === 'webhook') return 'webhook';
  if (raw === 'console') {
    // Never allow a production deployment to send enquiries to a log file.
    return process.env.NODE_ENV === 'production' ? 'unconfigured' : 'console';
  }
  return 'unconfigured';
}

export function getWebhookUrl(): string | null {
  const raw = (process.env.ENQUIRY_WEBHOOK_URL ?? '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Whether the form can genuinely accept a submission right now. */
export function isDeliveryConfigured(): boolean {
  const mode = getDeliveryMode();
  if (mode === 'webhook') return getWebhookUrl() !== null;
  return mode === 'console';
}

/**
 * Builds the JSON body sent to the destination.
 *
 * Field names are stable and documented in ENVIRONMENT_SETUP.md so a
 * destination can be mapped without reading this file.
 */
export function buildDeliveryPayload(enquiry: EnquiryInput, context: DeliveryContext) {
  return {
    source: 'website-contact-form',
    reference: context.reference,
    submittedAt: context.receivedAt,
    enquiryType: enquiry.enquiryType,
    enquiryTypeLabel: enquiryTypeLabel(enquiry.enquiryType),
    fullName: neutraliseFormula(normaliseLine(enquiry.fullName)),
    businessEmail: normaliseLine(enquiry.businessEmail),
    companyName: enquiry.companyName ? neutraliseFormula(normaliseLine(enquiry.companyName)) : null,
    targetLocation: enquiry.targetLocation
      ? neutraliseFormula(normaliseLine(enquiry.targetLocation))
      : null,
    message: normaliseMultiline(enquiry.message),
    privacyAcknowledged: enquiry.privacyAcknowledged,
    // Technical metadata for triage and abuse handling. No tracking identifiers.
    meta: {
      ip: context.ip,
      userAgent: context.userAgent ? normaliseLine(context.userAgent).slice(0, 300) : null,
    },
  };
}

export async function deliverEnquiry(
  enquiry: EnquiryInput,
  context: DeliveryContext,
): Promise<DeliveryOutcome> {
  const mode = getDeliveryMode();

  if (mode === 'console') {
    console.info(
      `[enquiry:${context.reference}] received ${context.receivedAt} — delivery mode is "console" (development only).`,
      {
        enquiryType: enquiry.enquiryType,
        fullName: enquiry.fullName,
        businessEmail: enquiry.businessEmail,
        companyName: enquiry.companyName || null,
        targetLocation: enquiry.targetLocation || null,
        messageLength: enquiry.message.length,
      },
    );
    return { status: 'delivered', mode, reference: context.reference };
  }

  if (mode !== 'webhook') {
    // Nothing was sent. Say so; do not pretend.
    return { status: 'not_configured' };
  }

  const endpoint = getWebhookUrl();
  if (!endpoint) {
    return { status: 'not_configured' };
  }

  const timeoutMs = Number.parseInt(process.env.ENQUIRY_WEBHOOK_TIMEOUT_MS ?? '10000', 10);
  const safeTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.min(timeoutMs, 30000) : 10000;

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json',
  };
  const token = (process.env.ENQUIRY_WEBHOOK_TOKEN ?? '').trim();
  if (token) headers.authorization = `Bearer ${token}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(buildDeliveryPayload(enquiry, context)),
      signal: AbortSignal.timeout(safeTimeout),
      cache: 'no-store',
    });

    if (response.ok) {
      // Drain the body so the connection can be reused; content is irrelevant.
      await response.text().catch(() => '');
      return { status: 'delivered', mode, reference: context.reference };
    }

    // Never surface the destination or its response body to the browser.
    console.error(
      `[enquiry:${context.reference}] destination rejected the submission with HTTP ${response.status}.`,
    );
    const retryable = response.status >= 500 || response.status === 429;
    return {
      status: 'failed',
      reason: retryable
        ? 'The enquiry service is temporarily unavailable.'
        : 'The enquiry service rejected the submission.',
      retryable,
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'TimeoutError';
    console.error(
      `[enquiry:${context.reference}] delivery ${aborted ? 'timed out' : 'failed'}:`,
      error instanceof Error ? error.message : error,
    );
    return {
      status: 'failed',
      reason: aborted
        ? 'The enquiry service did not respond in time.'
        : 'The enquiry could not be delivered.',
      retryable: true,
    };
  }
}
