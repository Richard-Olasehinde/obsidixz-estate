'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * DIRECT EMAIL CONTACT
 * ====================
 *
 * The visitor's own email application composes the message. The site does not
 * send anything, does not receive anything, and cannot know whether a message
 * was written or delivered.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 *  - It never shows "Enquiry sent", "Received", "Thank you" or any delivery
 *    confirmation after the mailto link is activated. Clicking a mailto link
 *    proves only that a handler was invoked — nothing about whether a draft
 *    opened, whether the visitor typed anything, or whether it was sent.
 *  - It does not try to detect whether an email application is configured.
 *    That is not reliably detectable from a web page. Instead the address is
 *    always visible, always selectable, and the copy button is always present,
 *    so the fallback exists before it is needed.
 *  - It does not generate a draft itself. No form-to-email generator, no
 *    backend, no third-party form service.
 *
 * COPY FEEDBACK
 * Two distinct states, each announced:
 *  - success → "Email address copied"
 *  - failure → "Couldn't copy. Please select and copy the email address above."
 * Failure covers a denied clipboard permission, an insecure context, and the
 * legacy `execCommand` fallback returning false. Success is only ever reported
 * after the clipboard write actually resolved.
 */

type CopyState = 'idle' | 'copied' | 'failed';

const SUBJECT = 'Obsidixz Real Estate — Website enquiry';

export function ContactEmailActions({ email }: { email: string }) {
  const uid = useId();
  const statusId = `${uid}-copy-status`;
  const addressId = `${uid}-address`;

  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(SUBJECT)}`;

  const copy = useCallback(async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    /**
     * Legacy path. Used only when the async Clipboard API is unavailable —
     * on an insecure origin, for example. It reports its own success, and a
     * failure is surfaced rather than swallowed.
     */
    const legacyCopy = (): boolean => {
      try {
        const area = document.createElement('textarea');
        area.value = email;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '-1000px';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(area);
        return ok;
      } catch {
        return false;
      }
    };

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
        setCopyState('copied');
      } else {
        setCopyState(legacyCopy() ? 'copied' : 'failed');
      }
    } catch {
      setCopyState('failed');
    }

    resetTimer.current = setTimeout(() => setCopyState('idle'), 6000);
  }, [email]);

  /**
   * Focus the address once a copy has failed, so a keyboard or screen-reader
   * user lands directly on the text they have been told to select. It is not
   * done on success — the visitor's focus stays where they left it.
   */
  useEffect(() => {
    if (copyState === 'failed') addressRef.current?.focus();
  }, [copyState]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <a
          href={mailtoHref}
          className="group inline-flex items-center justify-center gap-2.5 bg-royal px-7 py-3.5 text-[1rem] font-semibold tracking-[0.01em] text-white transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-royal-deep focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-royal active:translate-y-px"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-[1.15rem] w-[1.15rem] shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="square"
          >
            <path d="M3 6.5h18v11H3z" />
            <path d="m3.5 7 8.5 6.5L20.5 7" />
          </svg>
          <span>Email your enquiry</span>
        </a>
      </div>

      {/*
        The address is real, selectable text in the document — not an image and
        not a JS-only value. It can be selected with a mouse, copied with the
        keyboard, or read aloud, whether or not any script runs.
      */}
      <div className="border border-charcoal/12 bg-mist/70 px-5 py-4">
        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-charcoal/65">
          Business email address
        </p>
        {/*
          Set at 0.86rem below `sm`: the address is one unbreakable token of 31
          characters, and at 320px it exceeds the panel's inner width at the
          larger size. `break-all` is kept as a safety net, but it should not be
          the thing doing the work.
        */}
        <p
          ref={addressRef}
          id={addressId}
          tabIndex={-1}
          className="mt-1.5 select-all break-all font-display text-[0.86rem] font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal sm:text-[1.05rem]"
        >
          {email}
        </p>

        <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 border border-charcoal/25 bg-white px-5 py-2.5 text-[0.9rem] font-semibold text-ink transition-colors duration-150 hover:border-royal hover:text-royal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal active:translate-y-px"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="square"
            >
              <rect x="7" y="7" width="9" height="9" />
              <path d="M13 4H4v9" />
            </svg>
            <span>Copy email address</span>
          </button>

          {/*
            Polite live region. It is present from first render so a screen
            reader has the node registered before any text arrives in it.
          */}
          <p
            id={statusId}
            role="status"
            aria-live="polite"
            className={[
              'text-[0.85rem] font-medium leading-snug',
              copyState === 'copied' ? 'text-royal' : 'text-[#B3261E]',
            ].join(' ')}
          >
            {copyState === 'copied' ? 'Email address copied' : null}
            {copyState === 'failed'
              ? 'Couldn’t copy. Please select and copy the email address above.'
              : null}
          </p>
        </div>
      </div>

      <p className="text-[0.92rem] leading-relaxed text-charcoal/78">
        This opens your email application. Complete your message and send it to us there. If it
        doesn’t open, copy the address into your preferred email service.
      </p>
    </div>
  );
}
