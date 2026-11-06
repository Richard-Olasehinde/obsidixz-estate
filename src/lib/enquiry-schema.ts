import { z } from 'zod';

/**
 * The enquiry contract.
 *
 * Deliberately shared by the browser form and the server route handler so the
 * two can never disagree about what is valid. The server always re-validates,
 * because client-side checks are advisory only.
 */

export const ENQUIRY_TYPES = [
  { value: 'property-lead-research', label: 'Property Lead Research' },
  { value: 'general-business', label: 'General Business Enquiry' },
  { value: 'partnership', label: 'Partnership Enquiry' },
  { value: 'other', label: 'Other' },
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number]['value'];

export const enquiryTypeValues = ENQUIRY_TYPES.map((type) => type.value) as [
  EnquiryType,
  ...EnquiryType[],
];

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

/**
 * A single-line field. Newlines are rejected because they are the usual vector
 * for header-style injection once a value is forwarded by email or webhook.
 */
const singleLine = (max: number, message: string) =>
  z
    .string()
    .max(max, message)
    .refine((value) => !/[\r\n]/.test(value), 'This field cannot contain line breaks');

/** Reasonably strict but practical email check (max 254 chars per RFC 5321). */
const emailField = z
  .string()
  .trim()
  .min(1, 'Please enter your business email address')
  .max(LIMITS.businessEmail.max, 'That email address is too long')
  .regex(/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/, 'Enter a valid email address, for example name@company.com')
  .refine((value) => !/[\r\n]/.test(value), 'Enter a valid email address');

export const enquirySchema = z.object({
  fullName: singleLine(
    LIMITS.fullName.max,
    `Please keep your name under ${LIMITS.fullName.max} characters`,
  )
    .trim()
    .min(LIMITS.fullName.min, 'Please enter your full name'),

  businessEmail: emailField,

  companyName: singleLine(LIMITS.companyName.max, 'That company name is too long')
    .trim()
    .optional()
    .or(z.literal('')),

  enquiryType: z.enum(enquiryTypeValues, {
    message: 'Please select an enquiry type',
  }),

  targetLocation: singleLine(LIMITS.targetLocation.max, 'Please keep the location under 120 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  message: z
    .string()
    .trim()
    .min(LIMITS.message.min, 'Please give a little more detail — at least 20 characters')
    .max(LIMITS.message.max, `Please keep your message under ${LIMITS.message.max} characters`),

  privacyAcknowledged: z.literal(true, {
    message: 'Please confirm you have read the privacy policy',
  }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

/**
 * The full server payload: the validated enquiry plus transport metadata that
 * the browser supplies but the visitor never sees.
 */
export const enquiryRequestSchema = enquirySchema.extend({
  /** Honeypot. Must be empty; a bot that fills every field will trip this. */
  website: z.string().max(200).optional(),
  /** Epoch ms when the form was rendered, used for the submit-timing check. */
  formOpenedAt: z.number().int().nonnegative().optional(),
});

export type EnquiryRequest = z.infer<typeof enquiryRequestSchema>;

/** Flattens a Zod error into `{ field: message }` for accessible inline display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const output: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!output[key]) output[key] = issue.message;
  }
  return output;
}
