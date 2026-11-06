/**
 * The enquiry contract.
 *
 * WHY THERE IS NO VALIDATION LIBRARY HERE
 * Zod was the initial choice, but a single seven-field form is not worth the
 * ~120 KB it added to the browser bundle (measured in the production build;
 * the contact page carried it entirely). A hand-written validator expressed
 * once in this module serves both the browser form and the API route, so there
 * is still exactly one source of truth, with no runtime dependency and no
 * shipped bytes.
 *
 * The two consumers are:
 *   - src/components/forms/EnquiryForm.tsx  (client-side validation)
 *   - src/app/api/enquiry/route.ts          (server-side re-validation)
 *
 * `scripts/smoke-test.mjs` verifies the server rejects every invalid shape this
 * module describes, and `npm run a11y` verifies the form exposes them.
 */

export const ENQUIRY_TYPES = [
  { value: 'property-lead-research', label: 'Property Lead Research' },
  { value: 'general-business', label: 'General Business Enquiry' },
  { value: 'partnership', label: 'Partnership Enquiry' },
  { value: 'other', label: 'Other' },
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number]['value'];

const allowedTypes = new Set<string>(ENQUIRY_TYPES.map((type) => type.value));

export function isEnquiryType(value: unknown): value is EnquiryType {
  return typeof value === 'string' && allowedTypes.has(value);
}

export function enquiryTypeLabel(value: string): string {
  return ENQUIRY_TYPES.find((type) => type.value === value)?.label ?? value;
}

/** Field limits, referenced by both the form UI and the server. */
export const LIMITS = {
  fullName: { min: 2, max: 100 },
  businessEmail: { max: 254 },
  companyName: { max: 120 },
  targetLocation: { max: 120 },
  message: { min: 20, max: 4000 },
} as const;

/** Practical email shape check. Not RFC-complete, deliberately: see note below. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export type EnquiryFieldErrors = Record<string, string>;

export type EnquiryInput = {
  fullName: string;
  businessEmail: string;
  companyName?: string;
  enquiryType: EnquiryType;
  targetLocation?: string;
  message: string;
  privacyAcknowledged: true;
};

export type EnquiryRequest = EnquiryInput & {
  /** Epoch ms when the form was rendered, for the submit-timing check. */
  formOpenedAt?: number;
  /** Honeypot: must be empty. */
  website?: string;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: EnquiryFieldErrors };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Single-line text: no line breaks, trimmed, within limits. */
function singleLine(
  value: unknown,
  errors: EnquiryFieldErrors,
  field: string,
  label: string,
  { min, max, required }: { min: number; max: number; required: boolean },
): string {
  if (value === undefined || value === null || value === '') {
    if (required) errors[field] = `Please enter your ${label}`;
    return '';
  }
  if (typeof value !== 'string') {
    errors[field] = `Please enter your ${label} as text`;
    return '';
  }
  if (/[\r\n]/.test(value)) {
    errors[field] = 'This field cannot contain line breaks';
    return '';
  }
  const trimmed = value.trim();
  if (required && trimmed.length < min) {
    errors[field] =
      min === 1
        ? `Please enter your ${label}`
        : `${label[0].toUpperCase()}${label.slice(1)} must be at least ${min} characters`;
    return trimmed;
  }
  if (trimmed.length > max) {
    errors[field] = `Please keep this under ${max} characters`;
    return trimmed;
  }
  return trimmed;
}

/**
 * Validates a complete enquiry.
 *
 * The email check is intentionally pragmatic rather than RFC-complete: an
 * overly strict pattern rejects valid business addresses, and an overly loose
 * one lets typos through. The only reliable confirmation that an address works
 * is a reply, which is the business's own responsibility after delivery.
 */
export function validateEnquiry(input: unknown): ValidationResult<EnquiryInput> {
  const errors: EnquiryFieldErrors = {};

  if (!isRecord(input)) {
    return { ok: false, errors: { form: 'The submission could not be read.' } };
  }

  const fullName = singleLine(input.fullName, errors, 'fullName', 'full name', {
    min: LIMITS.fullName.min,
    max: LIMITS.fullName.max,
    required: true,
  });

  // Email needs its own handling so the message can be specific.
  let businessEmail = '';
  const rawEmail = input.businessEmail;
  if (rawEmail === undefined || rawEmail === null || rawEmail === '') {
    errors.businessEmail = 'Please enter your business email address';
  } else if (typeof rawEmail !== 'string') {
    errors.businessEmail = 'Enter a valid email address';
  } else {
    const trimmed = rawEmail.trim();
    businessEmail = trimmed;
    if (trimmed.length > LIMITS.businessEmail.max) {
      errors.businessEmail = 'That email address is too long';
    } else if (/[\r\n]/.test(trimmed)) {
      errors.businessEmail = 'Enter a valid email address';
    } else if (!EMAIL_PATTERN.test(trimmed)) {
      errors.businessEmail =
        'Enter a valid email address, for example name@company.com';
    }
  }

  const companyName = singleLine(input.companyName, errors, 'companyName', 'company name', {
    min: 0,
    max: LIMITS.companyName.max,
    required: false,
  });

  let enquiryType: EnquiryType | undefined;
  if (!isEnquiryType(input.enquiryType)) {
    errors.enquiryType =
      input.enquiryType === undefined || input.enquiryType === ''
        ? 'Please select an enquiry type'
        : 'Please choose one of the listed enquiry types';
  } else {
    enquiryType = input.enquiryType;
  }

  const targetLocation = singleLine(
    input.targetLocation,
    errors,
    'targetLocation',
    'target location',
    { min: 0, max: LIMITS.targetLocation.max, required: false },
  );

  // Message is multi-line, so it is validated separately.
  let message = '';
  if (input.message === undefined || input.message === null || input.message === '') {
    errors.message = 'Please tell us what you need researched';
  } else if (typeof input.message !== 'string') {
    errors.message = 'Please enter your message as text';
  } else {
    message = input.message.trim();
    if (message.length < LIMITS.message.min) {
      errors.message = `Please give a little more detail — at least ${LIMITS.message.min} characters`;
    } else if (message.length > LIMITS.message.max) {
      errors.message = `Please keep your message under ${LIMITS.message.max} characters`;
    }
  }

  if (input.privacyAcknowledged !== true) {
    errors.privacyAcknowledged = 'Please confirm you have read the privacy policy';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      fullName,
      businessEmail,
      companyName: companyName || undefined,
      enquiryType: enquiryType as EnquiryType,
      targetLocation: targetLocation || undefined,
      message,
      privacyAcknowledged: true,
    },
  };
}

/**
 * Validates the transport envelope the browser sends: the enquiry plus the
 * anti-spam metadata. Kept separate from `validateEnquiry` so the form never
 * needs to know about honeypot fields.
 */
export function validateEnquiryRequest(input: unknown): ValidationResult<EnquiryRequest> {
  const base = validateEnquiry(input);
  if (!base.ok) return base;

  const record = input as Record<string, unknown>;
  const errors: EnquiryFieldErrors = {};

  let formOpenedAt: number | undefined;
  if (record.formOpenedAt !== undefined) {
    if (
      typeof record.formOpenedAt !== 'number' ||
      !Number.isInteger(record.formOpenedAt) ||
      record.formOpenedAt < 0
    ) {
      errors.formOpenedAt = 'Invalid timing value';
    } else {
      formOpenedAt = record.formOpenedAt;
    }
  }

  let website: string | undefined;
  if (record.website !== undefined && record.website !== null) {
    if (typeof record.website !== 'string') {
      errors.website = 'Invalid value';
    } else if (record.website.length > 200) {
      errors.website = 'Invalid value';
    } else {
      website = record.website;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, data: { ...base.data, formOpenedAt, website } };
}
