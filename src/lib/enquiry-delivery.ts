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
 *   resend
 *     Send the enquiry as a transactional email through Resend's HTTP API
 *     (https://api.resend.com/emails). Requires RESEND_API_KEY,
 *     ENQUIRY_FROM_EMAIL and ENQUIRY_TO_EMAIL. Success is defined as a 2xx from
 *     Resend, which means Resend accepted the message for delivery — not that it
 *     reached a human inbox. That distinction is documented in DEPLOYMENT.md and
 *     is why a live enquiry must be confirmed by hand at the official inbox
 *     before delivery is described as working.
 *
 *   console
 *     Print to the server log. Development only. Refused in production so a
 *     live site can never swallow enquiries into a log nobody reads.
 *
 * To activate by webhook: set ENQUIRY_DELIVERY_MODE=webhook and
 * ENQUIRY_WEBHOOK_URL. To activate by Resend, see ENVIRONMENT_SETUP.md §5.
 */

export type DeliveryMode = 'unconfigured' | 'webhook' | 'resend' | 'console';

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
  if (raw === 'resend') return 'resend';
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

export const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/**
 * The endpoint actually used. In production this is always the constant above.
 * Outside production it can be overridden so the delivery path — status mapping,
 * timeout handling, payload shape — can be exercised against a local mock without
 * a live API key. The override is ignored in production, so a misconfigured or
 * malicious environment variable cannot redirect live enquiries to a third party.
 */
function resolveResendEndpoint(): string {
  if (process.env.NODE_ENV === 'production') return RESEND_ENDPOINT;
  const override = (process.env.RESEND_ENDPOINT_OVERRIDE ?? '').trim();
  return override.length > 0 ? override : RESEND_ENDPOINT;
}

/**
 * The Resend API key. Server-side only. Never given a `NEXT_PUBLIC_` prefix and
 * never included in a response, a log line or a client bundle.
 */
export function getResendApiKey(): string | null {
  const raw = (process.env.RESEND_API_KEY ?? '').trim();
  return raw.length > 0 ? raw : null;
}

/** Sender address, which must be on a domain verified in Resend. */
export function getResendFromEmail(): string | null {
  const raw = (process.env.ENQUIRY_FROM_EMAIL ?? '').trim();
  return raw.length > 0 ? raw : null;
}

/** Where the notification is delivered. The founder's monitored mailbox. */
export function getResendToEmail(): string | null {
  const raw = (process.env.ENQUIRY_TO_EMAIL ?? '').trim();
  return raw.length > 0 ? raw : null;
}

/**
 * Whether the form can genuinely accept a submission right now.
 *
 * Every Resend input is required. A missing sender or recipient is treated as
 * "not configured" rather than guessed, because guessing a recipient would send
 * a stranger's enquiry somewhere the business does not control.
 */
export function isDeliveryConfigured(): boolean {
  const mode = getDeliveryMode();
  if (mode === 'webhook') return getWebhookUrl() !== null;
  if (mode === 'resend') {
    return getResendApiKey() !== null && getResendFromEmail() !== null && getResendToEmail() !== null;
  }
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

/**
 * Escapes a value for interpolation into the transactional email HTML.
 *
 * This is the ONE place escaping is correct. Everything else in the pipeline
 * (`src/lib/sanitise.ts`) normalises rather than escapes, because values there
 * are destined for JSON and plain text. Here the value is placed inside an HTML
 * document, so `<`, `>`, `&`, `"` and `'` must be encoded or a message body
 * could inject markup into the notification email.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds the Resend API request body.
 *
 * `reply_to` is set to the enquirer's own address so the founder can reply
 * directly from the mailbox without copying the address by hand. That address
 * has already been validated as an email address and normalised; it is never
 * used as the `from` address, which stays on the verified sending domain.
 */
export function buildResendRequest(
  enquiry: EnquiryInput,
  context: DeliveryContext,
  from: string,
  to: string,
) {
  const typeLabel = enquiryTypeLabel(enquiry.enquiryType);

  const rows: Array<[string, string]> = [
    ['Reference', context.reference],
    ['Received', context.receivedAt],
    ['Enquiry type', typeLabel],
    ['Full name', enquiry.fullName],
    ['Business email', enquiry.businessEmail],
    ['Company', enquiry.companyName || '—'],
    ['Target US location', enquiry.targetLocation || '—'],
    ['Privacy acknowledged', enquiry.privacyAcknowledged ? 'Yes' : 'No'],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#5b6675;vertical-align:top;white-space:nowrap">${escapeHtml(
          label,
        )}</td><td style="padding:6px 0;color:#111111">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  const messageHtml = escapeHtml(enquiry.message).replace(/\r?\n/g, '<br />');

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111111;max-width:640px">
<h2 style="font-size:16px;margin:0 0 16px">New website enquiry — ${escapeHtml(typeLabel)}</h2>
<table style="border-collapse:collapse;margin-bottom:20px">${rowsHtml}</table>
<h3 style="font-size:14px;margin:0 0 8px">Requirements</h3>
<div style="border-left:3px solid #315C9B;padding:8px 0 8px 12px;line-height:1.6">${messageHtml}</div>
<p style="margin:20px 0 0;font-size:12px;color:#5b6675">Sent from the contact form at realestate.obsidixz.pp.ua. Reply to this email to answer the enquirer directly.</p>
</div>`;

  const text = [
    `New website enquiry — ${typeLabel}`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Requirements:',
    enquiry.message,
    '',
    'Sent from the contact form at realestate.obsidixz.pp.ua.',
  ].join('\n');

  return {
    from,
    to: [to],
    reply_to: enquiry.businessEmail,
    subject: `Website enquiry — ${typeLabel} — ${enquiry.fullName}`,
    html,
    text,
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

  if (mode === 'resend') {
    return deliverViaResend(enquiry, context);
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

/**
 * Delivers the enquiry as a transactional email through Resend.
 *
 * Success means Resend returned 2xx, i.e. it accepted the message for delivery.
 * Resend then hands the message to the receiving mail system; delivery to a human
 * inbox is a further step this code cannot observe. That is precisely why
 * DEPLOYMENT.md requires a real enquiry to be received and confirmed by hand
 * before the form is described as working.
 *
 * Failure handling mirrors the webhook adapter: nothing is reported as delivered
 * unless Resend accepted it, the API key is never logged, and Resend's response
 * body is never forwarded to the browser.
 */
async function deliverViaResend(
  enquiry: EnquiryInput,
  context: DeliveryContext,
): Promise<DeliveryOutcome> {
  const apiKey = getResendApiKey();
  const from = getResendFromEmail();
  const to = getResendToEmail();

  // A missing recipient must never be defaulted: sending a stranger's enquiry to
  // a guessed address would leak it to someone outside the business.
  if (!apiKey || !from || !to) {
    return { status: 'not_configured' };
  }

  const timeoutMs = Number.parseInt(process.env.ENQUIRY_WEBHOOK_TIMEOUT_MS ?? '10000', 10);
  const safeTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.min(timeoutMs, 30000) : 10000;

  try {
    const response = await fetch(resolveResendEndpoint(), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(buildResendRequest(enquiry, context, from, to)),
      signal: AbortSignal.timeout(safeTimeout),
      cache: 'no-store',
    });

    if (response.ok) {
      await response.text().catch(() => '');
      return { status: 'delivered', mode: 'resend', reference: context.reference };
    }

    // Resend's body is not forwarded anywhere. Only the status is logged, and the
    // key is never part of any message.
    console.error(`[enquiry:${context.reference}] Resend rejected the message with HTTP ${response.status}.`);
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
      `[enquiry:${context.reference}] Resend delivery ${aborted ? 'timed out' : 'failed'}:`,
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
