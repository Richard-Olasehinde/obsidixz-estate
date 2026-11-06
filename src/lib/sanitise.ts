/**
 * Input normalisation applied before an enquiry is delivered.
 *
 * This is defence in depth, not the primary defence: the schema already caps
 * lengths and forbids line breaks in single-line fields. Normalisation here
 * removes the characters that are most commonly used to corrupt a downstream
 * consumer (CRM, inbox, spreadsheet formula, log line).
 *
 * We deliberately do NOT HTML-escape values. This data is never rendered back
 * as HTML by us; escaping on input corrupts legitimate names ("O'Brien") and
 * gives a false sense of safety. The correct place to escape is at output, and
 * the destinations are a JSON API and a plain-text email.
 */

/** Removes Unicode control characters except tab, and collapses whitespace. */
export function normaliseText(value: string): string {
  return value
    // Strip C0 controls (excluding tab/newline/carriage return handled below)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Strip zero-width and bidi-override characters used to disguise content
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim();
}

/** Single-line variant: collapses all whitespace runs to one space. */
export function normaliseLine(value: string): string {
  return normaliseText(value).replace(/\s+/g, ' ');
}

/**
 * Multi-line variant: preserves intentional paragraph breaks, removes excess
 * blank lines and trailing spaces.
 */
export function normaliseMultiline(value: string): string {
  return normaliseText(value)
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .filter((line, index, lines) => !(line === '' && lines[index - 1] === ''))
    .join('\n')
    .trim();
}

/**
 * Neutralises spreadsheet formula injection. A value beginning with = + - @ is
 * treated as a formula by Excel and Sheets; prefixing a tab keeps it as text.
 */
export function neutraliseFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `\t${value}` : value;
}
