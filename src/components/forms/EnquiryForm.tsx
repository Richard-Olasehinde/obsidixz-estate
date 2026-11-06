'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ENQUIRY_TYPES,
  LIMITS,
  enquirySchema,
  fieldErrors,
  type EnquiryType,
} from '@/lib/enquiry-schema';
import { FieldWrapper, fieldClasses } from '@/components/forms/fields';
import { Button } from '@/components/ui/Button';

/**
 * Enquiry form.
 *
 * Behavioural contract, all of which is verified by scripts/smoke-test.mjs and
 * can be reproduced by hand:
 *
 *  - Client-side validation mirrors the server schema, because it is the *same*
 *    schema. Errors appear inline and are linked to their control.
 *  - The submit button shows a loading state and is disabled while in flight,
 *    so a double-click cannot send twice.
 *  - Success is shown ONLY when the server returns 2xx, which itself only
 *    happens when a configured destination accepted the submission.
 *  - When delivery is not configured the form says so plainly and points to an
 *    alternative route. It never shows a success message.
 *  - On failure, the visitor's text is preserved so nothing is lost.
 *  - A hidden honeypot field and a render timestamp are sent for spam checks.
 */

type Status = 'idle' | 'submitting' | 'success' | 'error';

type ServerError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
  retryAfterSeconds?: number;
  reference?: string;
};

type FormValues = {
  fullName: string;
  businessEmail: string;
  companyName: string;
  enquiryType: EnquiryType | '';
  targetLocation: string;
  message: string;
  privacyAcknowledged: boolean;
};

const EMPTY: FormValues = {
  fullName: '',
  businessEmail: '',
  companyName: '',
  enquiryType: '',
  targetLocation: '',
  message: '',
  privacyAcknowledged: false,
};

/** Window in which an identical payload is treated as a double submission. */
const DUPLICATE_WINDOW_MS = 60_000;

export function EnquiryForm() {
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  // Stamped in an effect rather than during render: `Date.now()` in a render
  // body is impure and React's lint rules (correctly) reject it.
  const formOpenedAt = useRef<number>(0);
  const lastSubmission = useRef<{ hash: string; at: number } | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);

  // Record when the form became interactive. Used only for the server's
  // submit-timing spam check — never for analytics.
  useEffect(() => {
    formOpenedAt.current = Date.now();
  }, [status]);

  const setValue = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  // Validate against the shared schema. Returns a field → message map.
  const validate = useCallback((input: FormValues) => {
    const result = enquirySchema.safeParse({
      ...input,
      companyName: input.companyName || undefined,
      targetLocation: input.targetLocation || undefined,
      enquiryType: input.enquiryType || undefined,
    });
    return result.success ? {} : fieldErrors(result.error);
  }, []);

  /**
   * Errors shown to the visitor.
   *
   * Derived during render from the current values rather than pushed into state
   * from an effect. The visitor sees nothing until their first submit attempt
   * (`attempted`), after which every keystroke re-evaluates against the same
   * shared schema — so a corrected field clears as soon as it is valid.
   */
  const errors = useMemo<Record<string, string>>(() => {
    if (!attempted) return submitErrors;
    return { ...submitErrors, ...validate(values) };
  }, [attempted, values, submitErrors, validate]);

  const payloadHash = useMemo(
    () =>
      JSON.stringify([
        values.fullName.trim(),
        values.businessEmail.trim().toLowerCase(),
        values.message.trim(),
      ]),
    [values.fullName, values.businessEmail, values.message],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    setAttempted(true);
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setSubmitErrors(validationErrors);
      setStatus('idle');
      setServerError(null);
      // Move focus to the first problem so keyboard and screen-reader users are
      // taken to it rather than left at the submit button.
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(fieldId(firstKey));
      if (el) {
        el.focus();
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }

    // Duplicate-submission guard: an identical payload within the window is
    // blocked client-side. The server limit is the real backstop.
    const now = Date.now();
    if (
      lastSubmission.current &&
      lastSubmission.current.hash === payloadHash &&
      now - lastSubmission.current.at < DUPLICATE_WINDOW_MS
    ) {
      setStatus('error');
      setServerError({
        code: 'duplicate',
        message:
          'This enquiry has already been sent. If you need to add something, please wait a moment or include it in a new message.',
      });
      return;
    }

    setStatus('submitting');
    setServerError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName,
          businessEmail: values.businessEmail,
          companyName: values.companyName,
          enquiryType: values.enquiryType,
          targetLocation: values.targetLocation,
          message: values.message,
          privacyAcknowledged: values.privacyAcknowledged,
          formOpenedAt: formOpenedAt.current,
          website: '',
        }),
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => null)) as
        | { ok: true; reference: string }
        | { ok: false; error: ServerError }
        | null;

      if (response.ok && data && 'ok' in data && data.ok === true) {
        lastSubmission.current = { hash: payloadHash, at: Date.now() };
        setReference(data.reference ?? null);
        setStatus('success');
        setValues(EMPTY);
        setSubmitErrors({});
        setAttempted(false);
        // Announce the success region to assistive tech.
        requestAnimationFrame(() => successRef.current?.focus());
        return;
      }

      const error: ServerError =
        data && 'error' in data && data.error
          ? data.error
          : {
              code: 'unexpected',
              message: 'Your enquiry could not be sent. Please try again.',
            };

      if (error.fields) {
        setSubmitErrors(error.fields);
        setAttempted(true);
      }
      setServerError(error);
      setStatus('error');
      requestAnimationFrame(() => summaryRef.current?.focus());
    } catch (error) {
      const aborted = error instanceof Error && error.name === 'AbortError';
      setServerError({
        code: aborted ? 'timeout' : 'network',
        message: aborted
          ? 'The request took too long. Please check your connection and try again — nothing has been sent.'
          : 'Your enquiry could not reach the server. Please check your connection and try again — nothing has been sent.',
      });
      setStatus('error');
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      clearTimeout(timeout);
    }
  }

  /* ----------------------------- success ----------------------------- */
  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="border border-royal/25 bg-white p-7 sm:p-9"
      >
        <span
          aria-hidden="true"
          className="grid h-12 w-12 place-items-center border border-royal/30 text-royal"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M5 12.5 9.5 17 19 7" />
          </svg>
        </span>
        <h2 className="mt-5 text-[1.4rem] font-bold text-ink">Your enquiry has been received</h2>
        <p className="mt-3 text-[0.97rem] leading-relaxed text-charcoal/80">
          The submission was accepted by our enquiry system. You will receive a considered reply at
          the business email address you provided. If your enquiry concerns a specific market,
          including the target location helps us respond usefully.
        </p>
        {reference ? (
          <p className="mt-4 inline-block border border-charcoal/15 bg-mist px-3 py-1.5 font-mono text-[0.78rem] text-charcoal/70">
            Reference: {reference.slice(0, 8)}
          </p>
        ) : null}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setReference(null);
              formOpenedAt.current = Date.now();
            }}
            className="inline-flex items-center justify-center border border-charcoal/25 px-6 py-3 text-[0.95rem] font-semibold text-ink transition-colors hover:border-royal hover:text-royal"
          >
            Send another enquiry
          </button>
          <Link
            href="/services"
            className="inline-flex items-center justify-center bg-royal px-6 py-3 text-[0.95rem] font-semibold text-white transition-colors hover:bg-royal-deep"
          >
            Read about the service
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------ form ------------------------------- */
  const isSubmitting = status === 'submitting';
  const messageLength = values.message.length;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={`${uid}-form-heading`}
      className="border border-charcoal/12 bg-white p-5 sm:p-7 lg:p-8"
    >
      <h2 id={`${uid}-form-heading`} className="text-[1.3rem] font-bold text-ink">
        Send an enquiry
      </h2>
      <p className="mt-2 text-[0.9rem] leading-relaxed text-charcoal/70">
        Fields marked <span className="font-semibold text-ink">*</span> are required. Everything you
        send is used only to respond to your enquiry.
      </p>

      {/* Server-error summary. Focusable so it can be announced and read. */}
      <div
        ref={summaryRef}
        tabIndex={-1}
        aria-live="assertive"
        className={
          status === 'error' && serverError
            ? 'mt-5 border-l-4 border-[#B3261E] bg-[#FDF3F2] px-4 py-3'
            : 'hidden'
        }
      >
        {serverError ? (
          <>
            <p className="text-[0.9rem] font-semibold text-[#8C1D18]">
              {serverError.code === 'delivery_not_configured'
                ? 'Online enquiries are not currently being accepted'
                : serverError.code === 'rate_limited'
                  ? 'Too many enquiries from this connection'
                  : serverError.code === 'duplicate'
                    ? 'This enquiry has already been sent'
                    : 'Your enquiry was not sent'}
            </p>
            <p className="mt-1 text-[0.88rem] leading-relaxed text-[#6B1B16]">
              {serverError.message}
            </p>
            {serverError.code === 'delivery_not_configured' ? (
              <p className="mt-2 text-[0.88rem] leading-relaxed text-[#6B1B16]">
                Your message has not been lost — it is still in the form. You can try again later,
                or reach the business another way:{' '}
                <Link href="/contact#other-routes" className="underline underline-offset-2">
                  see contact options
                </Link>
                .
              </p>
            ) : null}
            {serverError.reference ? (
              <p className="mt-2 font-mono text-[0.74rem] text-[#6B1B16]/80">
                Reference: {serverError.reference.slice(0, 8)}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {/* Full name */}
        <div className="sm:col-span-1">
          <FieldWrapper
            id={fieldId('fullName')}
            label="Full name"
            required
            error={errors.fullName}
          >
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="fullName"
                type="text"
                autoComplete="name"
                required
                minLength={LIMITS.fullName.min}
                maxLength={LIMITS.fullName.max}
                className={fieldClasses(invalid)}
                value={values.fullName}
                onChange={(event) => setValue('fullName', event.target.value)}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                disabled={isSubmitting}
              />
            )}
          </FieldWrapper>
        </div>

        {/* Business email */}
        <div className="sm:col-span-1">
          <FieldWrapper
            id={fieldId('businessEmail')}
            label="Business email"
            required
            error={errors.businessEmail}
          >
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="businessEmail"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                maxLength={LIMITS.businessEmail.max}
                className={fieldClasses(invalid)}
                value={values.businessEmail}
                onChange={(event) => setValue('businessEmail', event.target.value)}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                disabled={isSubmitting}
                placeholder="name@company.com"
              />
            )}
          </FieldWrapper>
        </div>

        {/* Company name */}
        <div className="sm:col-span-1">
          <FieldWrapper
            id={fieldId('companyName')}
            label="Company name"
            optional
            error={errors.companyName}
          >
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="companyName"
                type="text"
                autoComplete="organization"
                maxLength={LIMITS.companyName.max}
                className={fieldClasses(invalid)}
                value={values.companyName}
                onChange={(event) => setValue('companyName', event.target.value)}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                disabled={isSubmitting}
              />
            )}
          </FieldWrapper>
        </div>

        {/* Enquiry type */}
        <div className="sm:col-span-1">
          <FieldWrapper
            id={fieldId('enquiryType')}
            label="Enquiry type"
            required
            error={errors.enquiryType}
          >
            {({ id, describedBy, invalid }) => (
              <select
                id={id}
                name="enquiryType"
                required
                className={fieldClasses(invalid)}
                value={values.enquiryType}
                onChange={(event) => setValue('enquiryType', event.target.value as EnquiryType)}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                disabled={isSubmitting}
              >
                <option value="">Select an enquiry type</option>
                {ENQUIRY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            )}
          </FieldWrapper>
        </div>

        {/* Target location */}
        <div className="sm:col-span-2">
          <FieldWrapper
            id={fieldId('targetLocation')}
            label="Target US location"
            optional
            hint="A state, metro, county or city. Helps us judge whether the area can be researched for you."
            error={errors.targetLocation}
          >
            {({ id, describedBy, invalid }) => (
              <input
                id={id}
                name="targetLocation"
                type="text"
                maxLength={LIMITS.targetLocation.max}
                className={fieldClasses(invalid)}
                value={values.targetLocation}
                onChange={(event) => setValue('targetLocation', event.target.value)}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                disabled={isSubmitting}
                placeholder="e.g. Franklin County, Ohio"
              />
            )}
          </FieldWrapper>
        </div>

        {/* Message */}
        <div className="sm:col-span-2">
          <FieldWrapper
            id={fieldId('message')}
            label="Requirements and message"
            required
            hint="Your criteria, property type, size range and anything else that matters. Please do not include sensitive personal information."
            error={errors.message}
          >
            {({ id, describedBy, invalid }) => (
              <>
                <textarea
                  id={id}
                  name="message"
                  required
                  rows={6}
                  minLength={LIMITS.message.min}
                  maxLength={LIMITS.message.max}
                  className={`${fieldClasses(invalid)} resize-y leading-relaxed`}
                  value={values.message}
                  onChange={(event) => setValue('message', event.target.value)}
                  aria-invalid={invalid || undefined}
                  aria-describedby={describedBy}
                  disabled={isSubmitting}
                />
                <p
                  aria-hidden="true"
                  className={[
                    'mt-1 text-right font-sans text-[0.75rem]',
                    messageLength > LIMITS.message.max * 0.9 ? 'text-gold-deep' : 'text-charcoal/45',
                  ].join(' ')}
                >
                  {messageLength} / {LIMITS.message.max}
                </p>
              </>
            )}
          </FieldWrapper>
        </div>

        {/* Privacy acknowledgement */}
        <div className="sm:col-span-2">
          <div
            className={[
              'flex gap-3 border px-4 py-3.5',
              errors.privacyAcknowledged ? 'border-[#B3261E] bg-[#FDF3F2]' : 'border-charcoal/15 bg-mist/60',
            ].join(' ')}
          >
            <input
              id={fieldId('privacyAcknowledged')}
              name="privacyAcknowledged"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#315C9B]"
              checked={values.privacyAcknowledged}
              onChange={(event) => setValue('privacyAcknowledged', event.target.checked)}
              aria-invalid={Boolean(errors.privacyAcknowledged) || undefined}
              aria-describedby={
                errors.privacyAcknowledged ? fieldId('privacyAcknowledged-error') : undefined
              }
              disabled={isSubmitting}
            />
            <div>
              <label
                htmlFor={fieldId('privacyAcknowledged')}
                className="text-[0.88rem] leading-relaxed text-charcoal/85"
              >
                I have read the{' '}
                <Link
                  href="/privacy-policy"
                  className="font-semibold text-royal underline underline-offset-2"
                >
                  Privacy Policy
                </Link>{' '}
                and understand my information will be used to respond to this enquiry.
                <span className="ml-0.5 text-[#B3261E]" aria-hidden="true">
                  *
                </span>
              </label>
              {errors.privacyAcknowledged ? (
                <p
                  id={fieldId('privacyAcknowledged-error')}
                  role="alert"
                  className="mt-1 text-[0.82rem] font-medium text-[#B3261E]"
                >
                  {errors.privacyAcknowledged}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Honeypot. Hidden from people and assistive technology; tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={fieldId('website')}>Website</label>
        <input
          id={fieldId('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="mt-7 flex flex-col gap-3 border-t border-charcoal/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="order-2 max-w-sm text-[0.8rem] leading-relaxed text-charcoal/55 sm:order-1">
          Your enquiry is sent over an encrypted connection when this site is served over HTTPS.
        </p>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="order-1 w-full sm:order-2 sm:w-auto"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2.5">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 animate-spin"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
              </svg>
              Sending enquiry…
            </span>
          ) : (
            'Send enquiry'
          )}
        </Button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {isSubmitting ? 'Sending your enquiry' : ''}
      </span>
    </form>
  );
}
