/**
 * Shared website content.
 *
 * Rules for editing this file:
 * - No invented achievements, client names, transaction counts, statistics,
 *   testimonials, awards, certifications, years of experience or coverage claims.
 * - No guaranteed outcomes of any kind.
 * - No pricing, delivery times or minimum order quantities.
 * - Nothing that implies brokerage, agency, property management, financing,
 *   wholesaling or a proprietary analytics platform.
 *
 * If a fact is not known, write around it or use "Discuss your requirements".
 */

export type DeliverableField = {
  label: string;
  description: string;
  /** Shown as a caveat where availability genuinely varies. */
  caveat?: string;
};

/** What a Property Lead Research deliverable may contain. */
export const deliverableFields: DeliverableField[] = [
  {
    label: 'Property address',
    description: 'The street address of the prospect, as recorded in the sources reviewed.',
    caveat: 'Where an address is only partially published, it is marked as partial rather than completed by guesswork.',
  },
  {
    label: 'City and state',
    description: 'Location detail so every prospect can be checked against your target area.',
  },
  {
    label: 'Property type',
    description:
      'The classification recorded for the property, for example single-family detached or a small multi-unit building.',
    caveat: 'Source classifications occasionally disagree; where they do, the difference is noted.',
  },
  {
    label: 'Available property characteristics',
    description:
      'Bedroom and bathroom counts, approximate living area, lot size, year built and similar details where they are published.',
    caveat: 'Public records vary in completeness by county and state.',
  },
  {
    label: 'Relevant public property information',
    description:
      'Assessment or tax figures, recorded sale history, zoning or land-use notes, and other details that bear on your criteria.',
  },
  {
    label: 'Owner information, where lawfully available',
    description:
      'Ownership recorded in public records, only where that information is lawfully accessible and appropriate to include.',
    caveat: 'Ownership data is not available or not permissible for every property; it is omitted where that is the case.',
  },
  {
    label: 'Contact information, where lawfully obtained and verified',
    description:
      'Contact details only where they are lawfully obtainable and can be appropriately verified.',
    caveat: 'No contact detail is presented as confirmed unless it has been checked against a source.',
  },
  {
    label: 'Research-source references',
    description:
      'The sources reviewed for each prospect, so you can see where a detail came from and assess it yourself.',
  },
  {
    label: 'Qualification notes',
    description:
      'A short explanation of why a prospect matches the criteria you set, written in plain language.',
  },
  {
    label: 'Research date',
    description:
      'The date the research was carried out, so you know how current the information is.',
  },
  {
    label: 'Verification notes',
    description:
      'Details that were missing, uncertain, inconsistent between sources or could not be confirmed.',
    caveat: 'This is a normal part of research, not a defect. It tells you what to check before acting.',
  },
];

/** Sections that appear on the Services page, reused in summary form elsewhere. */
export const serviceScope = [
  {
    title: 'Requirements you set',
    body: 'You give us the target location and the property requirements that matter to you — property type, size range, ownership signal, condition indicators or anything else material to your strategy.',
  },
  {
    title: 'Research against those criteria',
    body: 'We research potential property prospects against your criteria, working through public records, county and municipal sources and other lawfully accessible material.',
  },
  {
    title: 'A structured deliverable',
    body: 'The result is organised into a spreadsheet or report, in the format agreed with you, with the source for each detail and a note explaining the match.',
  },
  {
    title: 'An honest account of the gaps',
    body: 'Where information is unavailable, inconsistent or unconfirmed, the deliverable says so. You receive the state of the evidence, not a cleaned-up impression of it.',
  },
] as const;

/** The five-step workflow. Used on Home, How It Works and Contact. */
export const processSteps = [
  {
    step: '01',
    title: 'Discuss the brief by email',
    summary: 'Share a target US area, property profile and the conditions you are exploring.',
    detail:
      'A short email can describe an agreed city or county, property type, size range and other conditions you would like researched. These are examples of possible brief details, not a client request or a promise every condition can be supported.',
    icon: 'document' as const,
  },
  {
    step: '02',
    title: 'Review and scope',
    summary: 'We agree the scope and what the available records can support.',
    detail:
      'Before research begins we confirm the geography, fields, output format and volume. We also identify any condition the available records cannot reliably support and agree timing and any fee in writing.',
    icon: 'scope' as const,
  },
  {
    step: '03',
    title: 'Research prospects',
    summary: 'Potential prospects are identified and researched against your criteria, manually.',
    detail:
      'Prospects are identified and researched one by one against the agreed criteria, using public records and other lawfully accessible sources. This is careful manual research; it is not an automated scrape and not the output of a software platform.',
    icon: 'search' as const,
  },
  {
    step: '04',
    title: 'Review and organise',
    summary: 'Findings are cross-checked, organised and annotated with sources and qualification notes.',
    detail:
      'Each prospect is checked for internal consistency, missing details are identified, and the information is organised into the agreed structure with the source recorded against each field and a note explaining why the prospect matches.',
    icon: 'verify' as const,
  },
  {
    step: '05',
    title: 'Receive your research',
    summary: 'You receive the structured deliverable and can review it against your own criteria.',
    detail:
      'The research is delivered in the agreed format — typically a spreadsheet or a report. You review it, decide which prospects are worth pursuing and can come back with a revised brief as your criteria change.',
    icon: 'handover' as const,
  },
];

/** Secondary audience: property acquisition operators. */
export const operatorScenarios = [
  {
    label: 'Consistent intake',
    body: 'A repeatable brief that can be re-run as your sourcing focus shifts, so new prospects arrive in the same structure each time.',
  },
  {
    label: 'Documented research',
    body: 'Sources and verification notes recorded against each prospect, so a colleague can pick up the list and understand what was checked.',
  },
  {
    label: 'Scoped to your process',
    body: 'The deliverable fields and format are agreed with you, so the output fits the way your team already reviews opportunities.',
  },
];

/** Distinct market problems the service addresses; kept brief on the homepage. */
export const researchChallenges = [
  {
    title: 'Records sit in different places',
    body: 'Parcel, assessment, permit and sale information may be held by separate county or municipal sources, each with its own format and update cycle.',
  },
  {
    title: 'A brief can combine several conditions',
    body: 'Property type, size range and other recorded characteristics do not always fit one search filter. The brief determines which sources to review.',
  },
  {
    title: 'Details need to line up',
    body: 'A possible match still needs its parcel and recorded details checked across the sources available for that area.',
  },
] as const;

/** Illustrative information a customer may include in a brief. */
export const homeBriefInputs = [
  {
    label: 'Target area',
    body: 'An agreed US city or county; coverage is selected for each brief.',
  },
  {
    label: 'Property type',
    body: 'For example, single-family or small multi-unit residential property.',
  },
  {
    label: 'Property profile',
    body: 'A size range or other recorded characteristics relevant to your search.',
  },
  {
    label: 'Other conditions',
    body: 'Customer-defined requirements that available records may be able to support.',
  },
  {
    label: 'Your output',
    body: 'The information you need and whether a spreadsheet or report would suit you.',
  },
] as const;

/** Homepage summary of the existing service deliverable, not an example property row. */
export const homeDeliverableGroups = [
  {
    label: 'Property identity and characteristics',
    description: 'Location, property type and relevant recorded characteristics where available.',
  },
  {
    label: 'Relevant recorded information',
    description: 'Public property details that bear on the agreed criteria and can be sourced.',
  },
  {
    label: 'Sources and research date',
    description: 'References for information reviewed and the date the research was carried out.',
  },
  {
    label: 'Why it matches',
    description: 'A short note connecting the recorded details to the conditions in your brief.',
  },
  {
    label: 'Missing or conflicting details',
    description: 'Unconfirmed, inconsistent or unavailable information is identified, not guessed.',
  },
  {
    label: 'Owner or contact details, if appropriate',
    description: 'Included only when appropriate and lawfully available or obtained—not assumed for every property.',
  },
] as const;
