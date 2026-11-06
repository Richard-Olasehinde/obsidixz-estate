import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { validateEnquiry, validateEnquiryRequest } from '@/lib/enquiry-schema';
import { deliverEnquiry, getDeliveryMode, getWebhookUrl } from '@/lib/enquiry-delivery';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/enquiry
 *
 * Order of checks — the cheapest and most security-relevant first:
 *   1. Method (POST only)
 *   2. Content type
 *   3. Body size cap (before parsing)
 *   4. Rate limit per IP
 *   5. Honeypot
 *   6. Submit-timing (reject implausibly fast completions)
 *   7. Schema validation (the same schema the browser uses)
 *   8. Delivery, with the result reported honestly
 *
 * Every response is JSON with a stable shape so the client can distinguish
 * "you made a mistake", "we are being abused", "we cannot accept enquiries",
 * and "it worked".
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16 * 1024;
const MIN_FILL_MS = 3000;

type ErrorCode =
  | 'method_not_allowed'
  | 'unsupported_media_type'
  | 'payload_too_large'
  | 'invalid_json'
  | 'rate_limited'
  | 'rejected'
  | 'validation_failed'
  | 'delivery_not_configured'
  | 'delivery_failed'
  | 'server_error';

function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...extra } },
    {
      status,
      headers: { 'cache-control': 'no-store' },
    },
  );
}

function clientIp(request: Request): string | null {
  // `x-forwarded-for` is set by the hosting proxy; the left-most entry is the
  // original client. Only used for rate limiting, never for tracking.
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || null;
}

export async function POST(request: Request) {
  try {
    /* 1 — method is guaranteed by the export, but be explicit for clarity */
    /* 2 — content type */
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return errorResponse(
        415,
        'unsupported_media_type',
        'Submissions must be sent as JSON.',
      );
    }

    /* 3 — body size, checked from the header before reading */
    const declaredLength = Number(request.headers.get('content-length') ?? '0');
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      return errorResponse(413, 'payload_too_large', 'That submission is too large.');
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return errorResponse(413, 'payload_too_large', 'That submission is too large.');
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(raw);
    } catch {
      return errorResponse(400, 'invalid_json', 'The submission could not be read.');
    }

    /* 4 — rate limit */
    const ip = clientIp(request);
    const max = Number.parseInt(process.env.ENQUIRY_RATE_LIMIT_MAX ?? '5', 10);
    const windowMinutes = Number.parseInt(process.env.ENQUIRY_RATE_LIMIT_WINDOW_MINUTES ?? '60', 10);
    const limit = checkRateLimit(`enquiry:${ip ?? 'unknown'}`, {
      max: Number.isFinite(max) && max > 0 ? max : 5,
      windowMs: (Number.isFinite(windowMinutes) && windowMinutes > 0 ? windowMinutes : 60) * 60_000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'rate_limited' satisfies ErrorCode,
            message: 'Too many enquiries have been sent from this connection. Please try again later.',
            retryAfterSeconds: limit.retryAfter,
          },
        },
        {
          status: 429,
          headers: {
            'cache-control': 'no-store',
            'retry-after': String(limit.retryAfter),
          },
        },
      );
    }

    /* 5 & 6 — honeypot and submit timing */
    const candidate = parsedBody as Record<string, unknown>;
    if (typeof candidate?.website === 'string' && candidate.website.trim() !== '') {
      // A human cannot see this field, so only automated clients trip it.
      // Nothing is delivered and no success is reported: `ok` is false and no
      // delivery reference is issued, so a real visitor can never reach this
      // branch and no caller can mistake the response for acceptance.
      console.warn(`[enquiry] honeypot triggered from ${ip ?? 'unknown IP'}; submission discarded.`);
      return NextResponse.json(
        { ok: false, discarded: true, reason: 'unusable_submission' },
        { status: 400, headers: { 'cache-control': 'no-store' } },
      );
    }

    if (typeof candidate?.formOpenedAt === 'number') {
      const elapsed = Date.now() - candidate.formOpenedAt;
      if (elapsed >= 0 && elapsed < MIN_FILL_MS) {
        // Too fast to be a person reading the form. Discarded, never reported
        // as accepted. A genuine visitor takes far longer than this to type a
        // message, so this branch cannot affect real enquiries.
        console.warn(`[enquiry] submit-timing check failed (${elapsed}ms) from ${ip ?? 'unknown IP'}.`);
        return NextResponse.json(
          { ok: false, discarded: true, reason: 'unusable_submission' },
          { status: 400, headers: { 'cache-control': 'no-store' } },
        );
      }
    }

    /* 7 — validation, using the shared validator */
    const requestParse = validateEnquiryRequest(candidate);
    if (!requestParse.ok) {
      return errorResponse(
        400,
        'validation_failed',
        'Please check the highlighted fields and try again.',
        { fields: requestParse.errors },
      );
    }

    const enquiryParse = validateEnquiry(requestParse.data);
    if (!enquiryParse.ok) {
      // Should be unreachable — the request validator calls this one. Kept as a
      // guard so a future divergence fails closed rather than open.
      return errorResponse(400, 'validation_failed', 'Please check the highlighted fields.', {
        fields: enquiryParse.errors,
      });
    }

    /* 8 — delivery */
    const reference = randomUUID();
    const outcome = await deliverEnquiry(enquiryParse.data, {
      reference,
      receivedAt: new Date().toISOString(),
      ip,
      userAgent: request.headers.get('user-agent'),
    });

    if (outcome.status === 'delivered') {
      return NextResponse.json(
        { ok: true, reference },
        { status: 200, headers: { 'cache-control': 'no-store' } },
      );
    }

    if (outcome.status === 'not_configured') {
      console.error(
        `[enquiry:${reference}] NOT DELIVERED — no submission destination is configured. ` +
          `Set ENQUIRY_DELIVERY_MODE=webhook with ENQUIRY_WEBHOOK_URL, or =resend with ` +
          `RESEND_API_KEY, ENQUIRY_FROM_EMAIL and ENQUIRY_TO_EMAIL. See ENVIRONMENT_SETUP.md.`,
      );
      return errorResponse(
        503,
        'delivery_not_configured',
        'Online enquiries are not being accepted at the moment. Please contact the business by another route.',
        { reference },
      );
    }

    return errorResponse(
      outcome.retryable ? 502 : 500,
      'delivery_failed',
      outcome.retryable
        ? 'Your enquiry could not be delivered just now. Please try again in a moment.'
        : 'Your enquiry could not be delivered. Please contact the business by another route.',
      { reference, retryable: outcome.retryable },
    );
  } catch (error) {
    console.error('[enquiry] unhandled error:', error);
    return errorResponse(500, 'server_error', 'Something went wrong. Please try again.');
  }
}

/** Explicit handlers so the method restrictions are self-documenting. */
export function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'method_not_allowed' satisfies ErrorCode,
        message: 'This endpoint accepts POST requests only.',
      },
      // Diagnostic, non-sensitive: tells an operator whether delivery is live
      // without revealing the destination or any credential.
      deliveryConfigured: getDeliveryMode() === 'webhook' && getWebhookUrl() !== null,
    },
    { status: 405, headers: { allow: 'POST', 'cache-control': 'no-store' } },
  );
}

export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
