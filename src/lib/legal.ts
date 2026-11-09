/**
 * LEGAL PAGE CONTENT — DRAFT, PENDING FOUNDER AND PROFESSIONAL REVIEW
 * ==================================================================
 *
 * Every statement here is derived from what the website and business actually
 * do as implemented in this repository. Nothing is assumed.
 *
 * A `pending` entry renders as a visibly marked placeholder reading
 * "to be confirmed before publication". These are the exact items that must be
 * supplied or reviewed. They are also listed in DEVELOPMENT_STATUS.md under
 * "Legal review register".
 *
 * DO NOT replace a pending marker with a plausible-looking guess.
 */

export type LegalBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'pending'; label: string; note: string };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

export const LEGAL_LAST_UPDATED = '6 November 2026';

const pending = (label: string, note: string): LegalBlock => ({ kind: 'pending', label, note });

/* ================================================================== */
/* PRIVACY POLICY                                                      */
/* ================================================================== */

export const privacySections: LegalSection[] = [
  {
    id: 'who-we-are',
    heading: '1. Who this policy covers',
    blocks: [
      {
        kind: 'paragraph',
        text: 'This policy explains how Obsidixz Real Estate handles personal information collected through this website at realestate.obsidixz.pp.ua. Obsidixz Real Estate is a research and lead-generation business and part of the Obsidixz organisation.',
      },
      {
        kind: 'paragraph',
        text: 'This website is operated by Richard Olasehinde, trading under the Obsidixz Real Estate brand. Obsidixz Real Estate is not a registered company; the brand name identifies the business but is not a separate legal entity.',
      },
      {
        kind: 'paragraph',
        text: 'Contact address: No. 4 Adeoye Street, Alarere, Ibadan, 200109, Nigeria. This is a correspondence address. It is not a registered office, and no office or other establishment is maintained in the United States.',
      },
      {
        kind: 'paragraph',
        text: 'The business operates remotely and serves clients in the United States.',
      },
    ],
  },
  {
    id: 'information-you-give-us',
    heading: '2. Information you send us by email',
    blocks: [
      {
        kind: 'paragraph',
        text: 'This website does not have an enquiry form and does not collect personal information itself. It publishes an email address and a link that opens your own email application. The message is composed and sent by you, from your own email account, to obsidixz.realestate@outlook.com — a Microsoft Outlook mailbox operated by the business.',
      },
      {
        kind: 'paragraph',
        text: 'Because you write and send the email yourself, what it contains is up to you. In practice an enquiry usually includes your name, your email address, and what you choose to say about the location and property criteria you are interested in. Your email provider will also transmit ordinary message metadata such as the sending time and routing information, as with any email.',
      },
      {
        kind: 'paragraph',
        text: 'The website does not receive, record, copy or store the contents of that email. It is held only in your mailbox and in the business mailbox it was sent to.',
      },
      {
        kind: 'paragraph',
        text: 'Please do not send sensitive personal information such as identity documents, financial account details or government identifiers. Property research enquiries do not require it, and ordinary email is not a suitable channel for it.',
      },
    ],
  },
  {
    id: 'how-we-use-it',
    heading: '3. How enquiry information is used',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Information you send by email is used only to read, consider and respond to your enquiry, and to correspond with you about the research service. We do not use it to send marketing unrelated to your enquiry, and we do not sell it.',
      },
      {
        kind: 'paragraph',
        text: 'If we agree to carry out research for you, the information you provide about your requirements is used to scope and deliver that research.',
      },
    ],
  },
  {
    id: 'technical-information',
    heading: '4. Information collected through ordinary website operation',
    blocks: [
      {
        kind: 'paragraph',
        text: 'This website does not set advertising or analytics cookies. It does not run third-party tracking scripts, advertising pixels or session recording.',
      },
      {
        kind: 'paragraph',
        text: 'This website has no enquiry form and no submission endpoint, so it does not receive a message you write here and it does not rate-limit or record submissions. There is no server-side record of an enquiry on this site to retain.',
      },
      {
        kind: 'paragraph',
        text: 'Web fonts are served from this website itself rather than from a third-party font service, so no request is made to a third party in order to display text.',
      },
      {
        kind: 'paragraph',
        text: 'The hosting provider for the website will process standard server request data, including IP addresses, as part of serving any website.',
      },
      pending(
        'Hosting provider and its data-processing terms',
        'This website has not yet been published to a hosting provider. No hosting provider is named here because none has been selected, and naming one that is not in use would be false. This must be completed before the site goes live.',
      ),
    ],
  },
  {
    id: 'service-providers',
    heading: '5. Third-party services',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Enquiries are received in a Microsoft Outlook mailbox. Microsoft provides that mailbox and processes the messages in it as the email provider for the business, under its own terms and data-protection commitments. Replies are sent from the same mailbox.',
      },
      {
        kind: 'paragraph',
        text: 'This is ordinary email. It is not a special or provider-free channel: your own email provider, the business mailbox provider and the networks in between all handle the message in the usual way, and normal spam and security filtering applies to it.',
      },
      {
        kind: 'paragraph',
        text: 'We do not disclose enquiry information to any other third party except where required by law, or where necessary to protect the security of the website.',
      },
    ],
  },
  {
    id: 'security',
    heading: '6. Security',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Reasonable care is taken to protect the business mailbox. Access is restricted to the business, and the mailbox provider applies its own security controls. This website holds no enquiry information to protect.',
      },
      {
        kind: 'paragraph',
        text: 'No service can guarantee absolute security, and ordinary email carries inherent risks in transit and at rest. Email is not end-to-end encrypted by default, and it can be filtered, delayed or misdelivered. Please do not send sensitive information such as identity documents, financial account details or government identifiers by email.',
      },
    ],
  },
  {
    id: 'retention',
    heading: '7. How long information is kept',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Enquiry correspondence is kept for 24 months after the enquiry is closed. Where an enquiry has been inactive for 12 months, it is reviewed to decide whether it should be closed, at which point the 24-month period begins.',
      },
      {
        kind: 'paragraph',
        text: 'This is a record-keeping policy applied to the mailbox. It is not an automatic deletion feature: enforcement is by review of the mailbox, not by the email provider. No claim is made here about copies the email provider may retain in its own backups, because those arrangements are the provider\'s and have not been verified by the business.',
      },
      {
        kind: 'paragraph',
        text: 'Enquiry correspondence exists as email in the business Outlook mailbox and in the sender\'s own mailbox. This website holds no copy, and retention in the sender\'s mailbox is a matter for the sender.',
      },
    ],
  },
  {
    id: 'your-rights',
    heading: '8. Your choices and rights',
    blocks: [
      {
        kind: 'paragraph',
        text: 'You may ask what information we hold about you, ask for it to be corrected, or ask for it to be deleted. You may also withdraw a request you have made or ask us to stop corresponding with you. Requests are handled subject to any legal obligation to retain a record.',
      },
      {
        kind: 'paragraph',
        text: 'Depending on where you live, you may have additional rights under applicable data-protection law. We will consider any such request in line with the law that applies to the business.',
      },
      {
        kind: 'paragraph',
        text: 'Privacy requests can be sent by email to obsidixz.realestate@outlook.com. Please state clearly that your message is a privacy request so it is handled as one.',
      },
      pending(
        'Applicable data-protection framework',
        'The business must confirm which data-protection law governs it, so that the rights described here are accurate rather than generic.',
      ),
    ],
  },
  {
    id: 'children',
    heading: '9. Children',
    blocks: [
      {
        kind: 'paragraph',
        text: 'This website and the research service are intended for business use by adults. They are not directed at children, and enquiries from children are not knowingly accepted.',
      },
    ],
  },
  {
    id: 'changes',
    heading: '10. Changes to this policy',
    blocks: [
      {
        kind: 'paragraph',
        text: `This policy may be updated as the business develops, for example when a hosting provider is selected. The "last updated" date at the top of this page shows when it last changed. Material changes will be reflected on this page.`,
      },
    ],
  },
  {
    id: 'contact',
    heading: '11. Contacting us about this policy',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Questions about this policy, or requests relating to your information, can be sent by email to obsidixz.realestate@outlook.com. Please state that your message concerns privacy.',
      },
      {
        kind: 'paragraph',
        text: 'That mailbox is the official business address and is monitored. It is the contact route for both general and privacy correspondence.',
      },
      pending(
        'Data-protection framework and any additional statutory rights',
        'Which data-protection regime governs the business, and the specific statutory response period and escalation route that follow from it, have not been decided. This is a legal review item, not a contact-details gap — the mailbox above is confirmed.',
      ),
    ],
  },
];

/* ================================================================== */
/* TERMS OF SERVICE                                                    */
/* ================================================================== */

export const termsSections: LegalSection[] = [
  {
    id: 'agreement',
    heading: '1. These terms',
    blocks: [
      {
        kind: 'paragraph',
        text: 'These terms govern your use of this website at realestate.obsidixz.pp.ua, operated by Obsidixz Real Estate. By using the website you accept these terms. If you do not accept them, please do not use the website.',
      },
      {
        kind: 'paragraph',
        text: 'These terms cover the website itself. They are not a customer service agreement. Any research engagement is governed by a separate written agreement with its own scope, deliverable and terms.',
      },
      {
        kind: 'paragraph',
        text: 'This website is operated by Richard Olasehinde, trading under the Obsidixz Real Estate brand. Obsidixz Real Estate is not a registered company; the brand name identifies the business but is not a separate legal entity. Correspondence address: No. 4 Adeoye Street, Alarere, Ibadan, 200109, Nigeria — a correspondence address, not a registered office.',
      },
    ],
  },
  {
    id: 'website-information',
    heading: '2. Information on this website',
    blocks: [
      {
        kind: 'paragraph',
        text: 'This website describes a research service. It is intended to give an accurate general picture of what the business does. It is not a property listing service and does not advertise any specific property for sale.',
      },
      {
        kind: 'paragraph',
        text: 'The website is provided as it stands. Content may be incomplete, out of date or changed without notice. No warranty is given that the website will be available without interruption or free of errors.',
      },
      {
        kind: 'paragraph',
        text: 'Illustrative images on the website are not representations of any property, client or transaction. They are used to convey the nature of the service only.',
      },
    ],
  },
  {
    id: 'the-service',
    heading: '3. The nature of the research service',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Obsidixz Real Estate provides criteria-based research and lead generation: it identifies property prospects that match criteria supplied by the client, gathers available public information about those prospects, and delivers the findings in an agreed structured format.',
      },
      {
        kind: 'paragraph',
        text: 'The service is research and information organisation. It is not brokerage, agency, property management, property sales representation, financing, legal advice, tax advice or investment advice. Contacting a prospect, negotiating, acquiring or disposing of property are matters for the client alone.',
      },
      {
        kind: 'paragraph',
        text: 'The availability, completeness and accuracy of property information varies between sources, counties and states. Research findings are presented with their sources, and information that is unavailable, inconsistent or unconfirmed is identified as such.',
      },
      {
        kind: 'paragraph',
        text: 'The scope, volume, format, timing and any fee for a research engagement are agreed in writing before work begins. Nothing on this website constitutes an offer of a particular scope or price.',
      },
    ],
  },
  {
    id: 'no-guarantees',
    heading: '4. Matters that are not promised',
    blocks: [
      {
        kind: 'paragraph',
        text: 'To be explicit, the service does not promise any of the following:',
      },
      {
        kind: 'list',
        items: [
          'that any prospect identified is a motivated seller, or is willing to sell at all;',
          'that any property remains available after the research date;',
          'that contact details are complete, current or accurate;',
          'that any prospect will result in a purchase, a contract or profit;',
          'any particular financial outcome, return on investment or valuation;',
          'exclusive or preferential access to any property or information source;',
          'any specific number of prospects, delivery date or turnaround time, unless separately agreed in writing for a specific engagement.',
        ],
      },
      {
        kind: 'paragraph',
        text: 'Property decisions carry financial risk. Independent verification and professional advice should be obtained before acting on any research deliverable.',
      },
    ],
  },
  {
    id: 'your-responsibilities',
    heading: '5. Your responsibilities',
    blocks: [
      {
        kind: 'paragraph',
        text: 'You are responsible for reviewing research before relying on it, for independently verifying any detail that matters to your decision, and for complying with the law that applies to you, including laws on unsolicited contact, marketing and property solicitation in the jurisdictions where you operate.',
      },
      {
        kind: 'paragraph',
        text: 'Information provided in a research deliverable is for your own use in evaluating opportunities. It must not be resold, published or redistributed as a lead list, and must not be used for unlawful contact or harassment.',
      },
      {
        kind: 'paragraph',
        text: 'You are responsible for the accuracy of the requirements you supply, including the location and criteria you ask us to research against.',
      },
    ],
  },
  {
    id: 'enquiries',
    heading: '6. Enquiries sent through this website',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Sending an enquiry does not create a client relationship or a contract. A relationship begins only when both parties have agreed a scope in writing. We may decline an enquiry, for example where the request falls outside the service or where the area or requirement cannot be researched responsibly.',
      },
      {
        kind: 'paragraph',
        text: 'The website tells you honestly whether your enquiry was accepted by the system that receives it. If it was not, please use another route to contact us rather than assuming the message arrived.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    heading: '7. Intellectual property',
    blocks: [
      {
        kind: 'paragraph',
        text: 'The design, text, graphics, layout and code of this website belong to Obsidixz or are used with permission. You may read, print and download pages for your own non-commercial reference, and may quote short extracts with a clear acknowledgement of the source.',
      },
      {
        kind: 'paragraph',
        text: 'You may not copy, republish, resell or systematically extract the website or its content, nor use automated means to harvest it, without written permission.',
      },
      {
        kind: 'paragraph',
        text: 'Obsidixz and Obsidixz Real Estate are names of the business and its parent organisation. Nothing on this website grants a licence to use them.',
      },
      {
        kind: 'paragraph',
        text: 'Research deliverables prepared for a client are provided for that client\u2019s use, on the terms set out in the engagement agreement and subject to the restrictions in section 5.',
      },
    ],
  },
  {
    id: 'liability',
    heading: '8. Limits of responsibility',
    blocks: [
      {
        kind: 'paragraph',
        text: 'To the extent permitted by applicable law, Obsidixz Real Estate is not responsible for loss arising from reliance on general website content, from a decision taken on the basis of research without independent verification, or from the acts or omissions of third parties including public records offices and information sources.',
      },
      {
        kind: 'paragraph',
        text: 'Nothing in these terms excludes or limits responsibility that cannot lawfully be excluded or limited, including for fraud or fraudulent misrepresentation.',
      },
      pending(
        'Liability position for professional review',
        'The wording above is a plain-language baseline for an emerging business. A qualified adviser should confirm it is appropriate and enforceable in the relevant jurisdiction, and whether any cap or insurance requirement should apply.',
      ),
    ],
  },
  {
    id: 'availability',
    heading: '9. Availability and changes',
    blocks: [
      {
        kind: 'paragraph',
        text: 'The website may be changed, suspended or withdrawn at any time, including changes to the services described. These terms may be updated; the date at the top of this page shows the most recent change. Continued use of the website after a change means the updated terms apply.',
      },
    ],
  },
  {
    id: 'law',
    heading: '10. Governing law and jurisdiction',
    blocks: [
      pending(
        'Governing law',
        'The law that governs these terms has not been decided and must not be assumed. This is a decision for the business with legal advice.',
      ),
      pending(
        'Jurisdiction for disputes',
        'The courts or dispute-resolution forum with authority over any dispute have not been decided.',
      ),
      {
        kind: 'paragraph',
        text: 'Until these are confirmed, nothing on this page should be read as stating a governing law or jurisdiction.',
      },
    ],
  },
  {
    id: 'contact-terms',
    heading: '11. Contact',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Questions about these terms can be sent by email to obsidixz.realestate@outlook.com.',
      },
    ],
  },
];
