# EMAIL PROVIDER EVALUATION

**Question:** which transactional email provider can actually send from a name under the free
public suffix `pp.ua` to `obsidixz.realestate@outlook.com`?

**Date:** 2026-11-06
**Status:** closed. This investigation answered a question that no longer needs answering.

> **Outcome, recorded so this document is not mistaken for current architecture.** The enquiry form
> and its entire delivery path have been **removed** from the website. Contact is now direct email:
> the visitor's own email application sends to `obsidixz.realestate@outlook.com`, and replies come
> from that mailbox. No transactional provider is used, none is needed, and none is being pursued.
>
> This document is kept because it records two findings worth not rediscovering: Resend refuses any
> `pp.ua` hostname, and Brevo *did* authenticate one but gated API access behind phone verification.
> Neither provider is required by the site as it now stands. See `DECISION_LOG.md` D59–D63.

The investigation itself changed no code and no DNS records at the time it was written.

Every claim below is tagged:

- **[DOC]** — stated in the provider's own published documentation or help centre, linked.
- **[MEASURED]** — I tested it directly from this environment on 2026-11-06.
- **[UNKNOWN]** — not established. Where this appears, the exact support question is given.

No provider has been assumed to accept `pp.ua` because it verifies by DNS. That inference is the
specific thing this document exists to check.

---

## 0. The two constraints that decide everything

### 0.1 Resend is out, confirmed twice

**[MEASURED]** `realestate.obsidixz.pp.ua` and `obsidixz.pp.ua` were both entered into Resend's
Add Domain dialog. Both were rejected. The second returned an explicit tooltip:
**"We don't allow free public domains. Please use a domain you own instead."**

Every name under `pp.ua` fails the same check, because the block is on the public suffix, not the
specific host. `send.obsidixz.pp.ua` and `send.realestate.obsidixz.pp.ua` are equally ineligible.
Adding DNS records first would not have helped.

Resend's other relevant limit **[DOC]** ([403 on resend.dev](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)):
the shared `onboarding@resend.dev` domain only delivers to the account owner's own address.

### 0.2 The sending domain is not your website domain

These are separate concerns and are treated separately throughout:

| Purpose | Name | Configured by | Status |
| --- | --- | --- | --- |
| **Apex mail** | `obsidixz.pp.ua` | Zoho MX records are published | ⚠️ **DNS only** — no Zoho mailbox has been confirmed to exist or be usable. Do not rely on this as a second address |
| **Website address** | `realestate.obsidixz.pp.ua` | Node host (TBD) | ⬜ No DNS record yet |
| **Enquiry notifications** | `send.obsidixz.pp.ua` or similar | The provider chosen here | ⬜ **The open question** |

A provider rejecting `pp.ua` for *sending* only affects the third row. It does not affect the site
or its existing Zoho mail.

---

## 1. What I measured about `pp.ua` itself

### 1.1 It is not on the canonical disposable blocklist

**[MEASURED]** I downloaded `disposable-email-domains` (121,570 entries — the list most tools
consume) and checked directly:

| Candidate | On the list? |
| --- | --- |
| `pp.ua` (the suffix itself) | ❌ No |
| `obsidixz.pp.ua` | ❌ No |
| `realestate.obsidixz.pp.ua` | ❌ No |
| `send.obsidixz.pp.ua` | ❌ No |

**20 specific subdomains** under `pp.ua` are listed, all abusive throwaway services:
`fake-email.pp.ua`, `tempmail.pp.ua`, `temp-mail.pp.ua`, `throwawaymail.pp.ua`, `yopmail.pp.ua`,
`web-mail.pp.ua`, `jetable.pp.ua`, `stop-my-spam.pp.ua` and similar.

### 1.2 But the namespace has a bad reputation, and that is a real risk

**[DOC]** IP Quality Score scores individual `pp.ua` tenants as *"Disposable Email Domain — High
Risk"* with *"high confidence this domain is used for conducting abusive behavior"*
([example](https://www.ipqualityscore.com/domain-reputation/fake-email.pp.ua)).

**Honest reading:** our exact domain is not blocklisted, so delivery is not *guaranteed* to fail.
But it sits in a free suffix that is disproportionately used for abuse, which is precisely the
signal Microsoft's filters weigh. This is a **risk, not a verdict** — and it can only be settled by
sending a real message to the real Outlook inbox.

That is why acceptance by a provider and delivery to the inbox are two separate tests in the plan
at §5.

---

## 1a. RESULT — Brevo accepted the domain (2026-11-06)

The question §4 said only a real attempt could answer has now been answered.

**Brevo accepted `send.realestate.obsidixz.pp.ua` into the account.** The Add Domain wizard passed
step 1 ("Domain") with a checkmark, on the free plan, with no payment details and no support
contact. The `.pp.ua` free public suffix did not block it.

**Precise scope of this result**, because the distinction matters:

| | Status |
| --- | --- |
| Domain accepted into the Brevo account | ✅ **Confirmed** |
| Free plan sufficient to reach this step | ✅ **Confirmed** — no paid feature was required |
| DNS records generated | ✅ **Confirmed** — 4 records, no SPF requested |
| Domain authenticated (records live and verified) | ✅ **Confirmed** — Brevo reported "Your domain has been authenticated" |
| A message delivered to the Outlook inbox | ⬜ **Pending** — the only test that settles §1.2 |

### The records Brevo issued, and what they showed

| Type | Name (relative to `obsidixz.pp.ua`) | Purpose |
| --- | --- | --- |
| `TXT` | `send.realestate` | `brevo-code:` domain-ownership proof |
| `CNAME` | `brevo1._domainkey.send.realestate` | DKIM selector 1 |
| `CNAME` | `brevo2._domainkey.send.realestate` | DKIM selector 2 |
| `TXT` | `_dmarc.send.realestate` | DMARC reporting for the sending subdomain |

**No SPF record was requested**, confirming Brevo's documentation that "SPF and MX records are not
required to authenticate a domain". The apex `v=spf1 include:zohomail.com ~all` therefore stays
exactly as it was, and the Zoho mailbox is unaffected. Every record landed on a **new** name under
`send.realestate`, so there was no collision surface at all.

DKIM is issued as two CNAMEs pointing at `b1`/`b2.send-realestate-obsidixz-pp-ua.dkim.brevo.com`,
which themselves CNAME on to `brevo13`/`brevo14.dkim.brevo.com`, where the 400-character public keys
live. That two-hop chain matters for troubleshooting: a shallow TXT lookup of the intermediate name
returns NXDOMAIN even when the record is correct.

### Two configuration faults found and corrected during setup

Both were caught by querying DNS directly **before** asking Brevo to verify, which is why
authentication succeeded on the first attempt rather than failing with a generic "records don't
match".

1. **CNAME target treated as relative.** uadns appended the zone to a target that lacked a trailing
   dot, producing `b1.send-realestate-obsidixz-pp-ua.dkim.brevo.com.obsidixz.pp.ua` — a hostname that
   does not exist. Fixed by terminating the target with a dot.
2. **`brevo2` was absent entirely.** Added, then verified.

**Lesson recorded:** on uadns, a CNAME target must end with a trailing dot or the zone name is
appended. This is general to relative-name DNS panels and will recur for any future CNAME.

So: Brevo's *account-level* policy allows a free public suffix. Whether a message from that suffix
reaches Outlook is still open, and §5 remains the plan.

**Consequence for §2.1:** row 1 moves from **[UNKNOWN]** to **[MEASURED] — accepted**. Row 2
(requires a conventional paid domain) is answered **No**. Rows 3–6 stand.

**Consequence for the fallback:** Zoho ZeptoMail is no longer needed as the immediate next step,
and its unresolved credit-validity conflict no longer blocks anything.

### Also confirmed in the wizard

Brevo's step 2 offers a **"branded subdomain"**, which it describes as making "your emails use your
own domain for **links** instead of Brevo's". That is click/open **tracking**, not sending. This
project does not use tracking, and the notification email contains no links, so the step is
skipped. Accepting it would add CNAME records for no benefit, and the resulting host would have
been `send.send.realestate.obsidixz.pp.ua`.

The **sending** domain is the one added in step 1 — `send.realestate.obsidixz.pp.ua` — which means
the From address will read `enquiries@send.realestate.obsidixz.pp.ua`, exactly as planned.

---

## 2. Provider-by-provider findings

### 2.1 Brevo

| # | Question | Finding |
| --- | --- | --- |
| 1 | Accepts our domain? | **✅ [MEASURED] ACCEPTED.** `send.realestate.obsidixz.pp.ua` was added on the free plan with no payment and no support contact — see §1a. Their "free domain" language **[DOC]** refers to *free email services* (Gmail, Yahoo), not free public suffixes ([help article](https://help.brevo.com/hc/en-us/articles/17286219877778-FAQs-About-domain-authentication-Brevo-code-DKIM-DMARC)). Notably `pp.ua` is not a webmail provider — it is a registrable domain you control. **Ambiguous, therefore must be asked.** |
| 2 | Requires a conventional paid domain? | **[DOC]** "You can only authenticate a domain that you or your business owns and controls." `obsidixz.pp.ua` is owned and controlled, with a live Zoho MX on record. No purchase implied. |
| 3 | Free tier sufficient? | **[DOC]** 300 emails/day, no card. Far above need. **Free-plan emails carry a small Brevo footer** — for an internal notification that is cosmetic, not functional. |
| 4 | API fits our adapter? | **[DOC]** REST API v3 on every plan. One `POST`, JSON body, `api-key` header. Fits `deliverEnquiry()` with a new mode; no architectural change. |
| 5 | Manual activation? | **[DOC]** **Yes** — "Sending starts after Brevo approves the account." Approval is not instant and the wait is unbounded. This is a real scheduling risk. |
| 6 | Limitations / privacy | Shared IP pool (reputation shared with other senders). Brevo substitutes a compliant sender address if the domain is unauthenticated — so authentication must be complete before any test is trusted. SPF and MX are **not** required for domain authentication **[DOC]**, which reduces DNS risk. |

**Decisive supporting evidence:** two independent integration write-ups exist specifically because
Brevo works where Resend does not. One states Resend "only verifies domains you own outright, so
free public domains… can't be used", and proposes Brevo instead
([GitHub issue](https://github.com/charleswei118/aliasflare/issues/3)). Another states Brevo "verifies
by DNS records only" ([freeCodeCamp](https://www.freecodecamp.org/news/how-to-bypass-cloud-smtp-restrictions-using-brevo-and-http-apis/)).
Neither names `pp.ua` specifically.

### 2.2 Zoho ZeptoMail

| # | Question | Finding |
| --- | --- | --- |
| 1 | Accepts our domain? | **[UNKNOWN]** but the **strongest circumstantial case**. **[MEASURED]** `obsidixz.pp.ua` already carries `zoho-verification=zb47588454.zmverify.zoho.com` and live Zoho Mail MX records. The domain is already verified inside Zoho's own systems, and ZeptoMail is the same vendor. Still not a published policy — must be asked. |
| 2 | Requires a conventional paid domain? | **[DOC]** Requires the sender domain to be verified via DKIM; no ownership-type restriction published. |
| 3 | Free tier sufficient? | **[DOC]** First credit free = **10,000 emails**. **Conflict in sources on validity**: one review says the credit is valid **6 months**, another says **1 month**. Unverified accounts are capped at **100/day** until reviewed. After the free credit: **$2.50 per 10,000 emails**. So it is *effectively a trial*, not a permanent free tier. |
| 4 | API fits our adapter? | **[DOC]** `POST https://api.zeptomail.com/v1.1/email`, header `Authorization: Zoho-enczapikey <token>`, JSON body. Fits with a new mode. Slightly more payload reshaping than Brevo (nested `from`/`to` objects). |
| 5 | Manual activation? | **[DOC] Yes, and explicitly.** Every new account goes through a **customer validation form reviewed by Zoho staff**; credits cannot be bought until review passes. Adds an unbounded wait. |
| 6 | Limitations / privacy | Transactional only by policy. Terms allow max **5% bounce / 0.1% complaint** rates and permit closure without notice above them — irrelevant at this volume. Note **ZeptoMail became "Zoho CPaaS" in Sept 2026**; `api.zeptomail.com` still answers. |

### 2.3 Maileroo

| # | Question | Finding |
| --- | --- | --- |
| 1 | Accepts our domain? | **[UNKNOWN]** No published TLD blocklist or ownership restriction found in any Maileroo documentation reviewed. |
| 2 | Requires a conventional paid domain? | **[UNKNOWN]** — no restriction published; absence of a rule is not permission. |
| 3 | Free tier sufficient? | **[DOC]** 3,000 emails/month, **2 domains**, API + SMTP. Comfortably sufficient. |
| 4 | API fits our adapter? | **[DOC]** HTTP API with bearer-style key. Fits with a new mode. |
| 5 | Manual activation? | **[UNKNOWN]** No published review step found, but no statement that accounts send immediately either. |
| 6 | Limitations / privacy | Adds 1,000 inbound/month, click/open tracking (we would disable). No published retention or branding terms found for the free tier. Smaller, newer vendor — less independent track record to rely on. |

### 2.4 AhaSend

| # | Question | Finding |
| --- | --- | --- |
| 1 | Accepts our domain? | **[UNKNOWN]** No TLD restriction published. |
| 2 | Requires a conventional paid domain? | **[UNKNOWN]** — API keys are scoped "by domain", which implies only that keys bind to a domain, not that paid TLDs are required. |
| 3 | Free tier sufficient? | **[DOC]** 1,000 emails/month, **unlimited domains**, no card. Sufficient for enquiry volume. |
| 4 | API fits our adapter? | **[DOC]** `POST` JSON with `Authorization: Bearer`, plus SMTP and Node SDK. Fits cleanly. Also has a **sandbox mode** that simulates sends, webhooks and failures — genuinely useful for testing the adapter without sending. |
| 5 | Manual activation? | **[UNKNOWN]** Email-verify then add domain; no review step documented. |
| 6 | Limitations / privacy | **EU-hosted, 100% European infrastructure** — a data-residency consideration to state in the privacy policy. Smaller vendor, less track record. Scoped API keys and IP allow-listing are a genuine security plus. |

### 2.5 Formspark — a different kind of thing

This is **not a transactional email provider**. It is a hosted form backend that receives a
submission and emails you. It is included because it sidesteps the whole problem.

| # | Question | Finding |
| --- | --- | --- |
| 1 | Accepts our domain? | **N/A — and this is the point.** Formspark never authenticates a sending domain of ours. Mail is sent from Formspark's own infrastructure to our inbox. The `pp.ua` policy question does not arise. |
| 2 | Requires a conventional paid domain? | **No.** No domain ownership involved. |
| 3 | Free tier sufficient? | **[DOC]** 250 submissions. **Conflict in sources**: some describe it as 250/**month**, others as a 250 **one-time pool**. Must be confirmed. For a low-volume site either is ample to start. Email notifications are included on free. |
| 4 | API fits our adapter? | **Yes — zero code change.** This is the notable part. Our adapter already has a `webhook` mode that `POST`s JSON to a URL and treats 2xx as success. Point `ENQUIRY_WEBHOOK_URL` at the Formspark endpoint and it works *today*, with validation, sanitisation, rate limiting and the no-false-success guarantee intact. |
| 5 | Manual activation? | **[UNKNOWN]** — appears not to require it, but not stated. |
| 6 | Limitations / privacy | **Weaker on two counts.** (a) The notification email arrives from Formspark's domain, not ours, so the `From:` no longer reads as the business — precisely the honesty concern that ruled out `onboarding@resend.dev`. (b) Submissions are stored on a third party for an archive period (30–90 days depending on tier), which is a **new sub-processor** to disclose in the privacy policy. (c) Webhooks and the REST API are **paid-upgrade features**, so we could not read submissions back programmatically on free. |

---

## 3. Transactional integration vs hosted form notification

| | Transactional email (Brevo / ZeptoMail / Maileroo / AhaSend) | Formspark hosted form |
| --- | --- | --- |
| Domain policy risk | **Yes** — the open question | **None** — no domain of ours involved |
| `From:` the visitor sees in your inbox | `enquiries@send.obsidixz.pp.ua` — yours | `notifications@formspark.io` — theirs |
| Reply-to the enquirer | ✅ Set by our adapter | ✅ Formspark sets reply-to to the submitter |
| Code change needed | New mode in `src/lib/enquiry-delivery.ts` (~60 lines) | **None** — existing `webhook` mode |
| Our validation / rate limiting / sanitisation | Unchanged | Unchanged |
| "Never a false success" guarantee | Preserved | Preserved — our route still requires 2xx |
| Third-party data storage | Provider logs message content (retention varies) | Provider stores the full submission (archive period) |
| Privacy policy impact | New sub-processor to name | New sub-processor to name |
| Free-tier ceiling | 1,000–10,000/month | 250 total or /month — **conflicting** |
| Failure visibility | Provider dashboard + our server log | Formspark dashboard + our server log |
| Reversibility | Swap env var + provider | Swap one env var |

**Judgement:** Formspark is the lowest-risk way to get a *working* enquiry path, but it is the
weakest on presentation — a business notification arriving from Formspark's domain undercuts the
credibility this site is built to establish. It is best held as a fallback that costs nothing to
activate, not as the first choice.

---

## 4. Acceptance cannot be established from documentation

No provider above publishes a rule for **free public suffixes** specifically, in either direction.
The only way to settle it is to try, or to ask.

### The exact support question to send each provider

> Hello — I run a small business site at `realestate.obsidixz.pp.ua` and want to send
> transactional email (contact-form notifications to our own inbox, a handful per day).
>
> Our domain is under the free public suffix `.pp.ua`. We own and control `obsidixz.pp.ua`, its
> DNS is on uadns.com, and it already has working SPF, DKIM via Zoho, and a DMARC record at
> `p=none`.
>
> **Question: will you allow us to add and verify `obsidixz.pp.ua` (or a sending subdomain such as
> `send.obsidixz.pp.ua`) as a sending domain, given the `.pp.ua` suffix?**
>
> Some providers (for example Resend) refuse free public domains with the message "We don't allow
> free public domains. Please use a domain you own instead." We want to confirm your policy before
> we configure DNS.
>
> If you do accept it, please also confirm: (a) whether you require any record on the apex of
> `obsidixz.pp.ua`, since we cannot disturb the existing Zoho MX and SPF records there, and (b)
> whether any manual approval applies to a new account.

Ask (a) explicitly of every provider — see §6.1, the SPF collision, which is the single easiest way
to break the existing mail setup.

---

## 5. Recommendation

### Primary: **Brevo**, with ZeptoMail as the immediately available backup

**Why Brevo first**

- Costs nothing and the free limit (300/day) is far beyond need.
- Its published "free domain" rule demonstrably means *webmail addresses*, not free suffixes — and
  two independent projects adopt Brevo explicitly because Resend rejects free domains.
- Domain authentication needs only TXT records; **SPF and MX on the apex are not required**, which
  minimises the risk to the live Zoho mail.
- A REST API that fits the existing adapter in ~60 lines.
- The only real cost is waiting for account approval, which can run in parallel with everything
  else.

**Why ZeptoMail second, despite the cost**

- `obsidixz.pp.ua` is **already verified inside Zoho's own systems** (verification TXT + live MX),
  so acceptance is the most likely of any option.
- Fastest DNS: DKIM + SPF only, on our own subdomain.
- Against it: effectively a trial rather than a permanent free tier (~$2.50/10k after the first
  credit), an unbounded staff review, and a **disputed** credit validity of 1 vs 6 months.

### Not recommended as the first choice

- **Maileroo / AhaSend** — both plausible and both cheaper than ZeptoMail, but they carry the same
  unanswered `.pp.ua` question with none of ZeptoMail's circumstantial advantage. Keep as third and
  fourth options. AhaSend's sandbox mode is worth remembering for adapter testing.
- **Formspark** — hold as the zero-change fallback. Do not lead with it, because the `From:` line
  would misrepresent who is writing.

### What I will not do

I will not claim any provider works until a real enquiry from the live site lands in
`obsidixz.realestate@outlook.com`. Provider acceptance (§2) and inbox delivery (§1.2) are separate
gates, and the second one is the one that matters.

---

## 6. DNS risks to avoid, whichever provider is chosen

### 6.1 The SPF collision — the most likely way to break existing mail

**[MEASURED]** The apex currently publishes exactly one SPF record:
`obsidixz.pp.ua TXT "v=spf1 include:zohomail.com ~all"`.

A domain may have **only one** SPF record. If a provider instructs you to add
`v=spf1 include:<provider> ~all` **at the apex**, publishing it as a second TXT record makes both
records invalid by RFC 7208 and can break the existing Zoho mail.

**Rule:** if a provider requires apex SPF, the new include must be **appended into the existing
record**, never added beside it. If a provider only wants records on `send.obsidixz.pp.ua`, there is
no collision at all — which is another argument for keeping sending on a subdomain.

### 6.2 Do not touch these

| Record | Why |
| --- | --- |
| `MX obsidixz.pp.ua` → Zoho | Live mailbox. A second MX could steal inbound mail. |
| `_dmarc.obsidixz.pp.ua` → `p=none` | Already published and in use. Do not edit. A separate `_dmarc` for the sending subdomain may be added. |
| `A obsidixz.pp.ua` → GitHub Pages | Serves the parent site. |
| `CNAME www` → `richard-olasehinde.github.io` | Same. |
| `TXT zoho-verification`, `google-site-verification` | Ownership proofs. Removing them can de-verify the domain. |

### 6.3 The record every provider will want, and where it goes

| Type | Name | Note |
| --- | --- | --- |
| `TXT` | `send` (or the provider's DKIM selector under `send`) | Safe — a new name, currently NXDOMAIN |
| `CNAME` | provider's DKIM target under `send` | Safe, same reason |
| `TXT` | `_dmarc.send` | Safe, new name |

All of these live at **uadns.com**, the zone's authoritative nameservers — not Cloudflare, so the
grey-cloud advice in the earlier plan is irrelevant here.

---

## 7. Open questions that must be answered before implementation

| # | Question | Who answers it |
| --- | --- | --- |
| 1 | Will the provider accept a sending domain under `.pp.ua`? | Provider support — use the text in §4 |
| 2 | Does it require anything on the apex, given Zoho owns the apex MX and SPF? | Provider support — part (a) of §4 |
| 3 | Is manual account approval required, and how long? | Provider support — part (b) of §4 |
| 4 | Is the free tier permanent, or a time-limited credit? | Provider docs — conflicts exist for ZeptoMail and Formspark |
| 5 | Does the free tier add provider branding to the email? | Provider docs — known for Brevo, unconfirmed for others |
| 6 | Does a real message from this domain actually reach Outlook? | **nobody but a live test** — §1.2 |

---

## 8. Proposed sequence, once a provider is chosen

1. Ask the §4 question. Wait for a written answer.
2. Sign up with the free plan. Complete any approval step.
3. Add the sending subdomain. Read the records it generates.
4. Enter **only** the new `send.` records in uadns. Change nothing on the apex.
5. Verify in the provider dashboard.
6. Add the delivery mode to the adapter, reusing the existing envelope, escaping and status mapping.
7. Run the offline suite against a mock endpoint, as was done for Resend.
8. **Send one real enquiry from the live site and find it in the Outlook inbox.**
9. Only then close BLK-01.
