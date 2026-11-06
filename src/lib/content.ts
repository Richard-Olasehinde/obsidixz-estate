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
    title: 'Submit your requirements',
    summary: 'Send your target location and the criteria a property needs to meet.',
    detail:
      'You share the market you are looking at, the property type and size you want, and any signals that matter for your strategy. A short written brief or the website enquiry form is enough to start.',
    icon: 'document' as const,
  },
  {
    step: '02',
    title: 'Review and scope',
    summary: 'We confirm what is needed, what the sources can realistically support, and agree the scope.',
    detail:
      'Before research begins we check that your criteria are answerable from available records, agree the fields you want, the format of the deliverable and the geography being covered. If something you have asked for cannot be supported, we say so at this stage rather than after delivery.',
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

/** Primary audience: US residential real-estate investors. */
export const investorScenarios = [
  {
    title: 'Building a working list',
    body: 'You know the market and the property profile you want, and you need a list of relevant prospects to work through rather than a search that starts from nothing each week.',
  },
  {
    title: 'Testing a new market',
    body: 'You are considering a county or metro you have not worked in and want to understand what is actually there before committing time or budget to it.',
  },
  {
    title: 'Working criteria that are hard to filter for',
    body: 'Your criteria combine several conditions — property type, ownership pattern, age or recorded characteristics — that no single public search handles well.',
  },
  {
    title: 'Extending limited sourcing capacity',
    body: 'You are a small operator doing your own research and want the initial research done thoroughly so your time goes into evaluation and outreach.',
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

/** How the business approaches research quality. */
export const approachPrinciples = [
  {
    title: 'Manual research, deliberately',
    body: 'Prospects are researched by hand against your criteria. Automation is used to support internal workflow where it genuinely helps, but it is not presented as a product and it does not replace the review step.',
  },
  {
    title: 'Sources recorded against every field',
    body: 'Each detail can be traced back to the source it came from. If a source cannot be cited, the detail is not presented as confirmed.',
  },
  {
    title: 'Gaps stated, not smoothed over',
    body: 'Missing, inconsistent or unconfirmed information is recorded in verification notes. A shorter, accurate deliverable is more useful to you than a complete-looking one that is wrong.',
  },
  {
    title: 'Lawful and appropriate use of information',
    body: 'We work from public records and lawfully accessible sources, respect the terms of those sources, and do not scrape websites or handle personal information in ways that breach applicable law or data-use restrictions.',
  },
  {
    title: 'Criteria agreed before work starts',
    body: 'Scope is confirmed up front, including any part of your brief the available records cannot support. You know what you are getting before the research begins.',
  },
  {
    title: 'Clear, direct communication',
    body: 'One point of contact, plain language, and a direct answer if something cannot be done or is outside the scope of the service.',
  },
] as const;

/** The research challenge, framed as market reality — no claims about our scale. */
export const researchChallenges = [
  {
    title: 'Records are scattered by design',
    body: 'Ownership sits with the county, tax figures with the assessor, permits with the municipality and sale history somewhere else again. Each source has its own format, its own update cadence and its own gaps.',
  },
  {
    title: 'Search filters only answer easy questions',
    body: 'Listing portals are built to show what is listed, not what you are looking for. Criteria that combine ownership patterns, property age and recorded characteristics rarely fit a filter panel.',
  },
  {
    title: 'The checking is the slow part',
    body: 'Finding a possible prospect is quick. Confirming the parcel, the recorded owner, the size and whether the details agree across sources is what consumes the hours.',
  },
  {
    title: 'Unverified lists cost more than they save',
    body: 'A list that looks complete but contains stale ownership or mismatched parcels wastes outreach time and damages the credibility of the person making contact.',
  },
] as const;

/** Short statements used in the homepage introduction. */
export const homeIntroPoints = [
  {
    label: 'What we do',
    body: 'Criteria-based property prospect research and lead generation for US residential real estate.',
  },
  {
    label: 'Who it is for',
    body: 'Small residential investors and acquisition operators working their own sourcing.',
  },
  {
    label: 'How it is done',
    body: 'Manually researched against your brief, with sources recorded and gaps stated.',
  },
] as const;
