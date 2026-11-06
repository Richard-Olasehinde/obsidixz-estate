# Brevo support ticket — account validation

Draft for review before submission. Ticket raised via **Help Center → Requests → Contact your support
team**. `Support ID: 12696226`.

Three `[bracketed]` fields must be filled in by the founder. Nothing secret belongs in this ticket —
the API key is never needed by support.

---

## Subject

Account validation blocked — SMS verification code never arrives (Nigeria, +234)

## Message

Hello,

I cannot complete my account validation, and the API is rejecting my requests as a result.

**Account**
- Organization: Obsidixz Real Estate
- Support ID: 12696226
- Account email: [the email address you registered with]
- Plan: Free
- Sending domain: send.realestate.obsidixz.pp.ua — **already authenticated successfully**, all four
  DNS records verified

**The problem**

The account requires phone verification by SMS. I have requested the code several times over more
than ten minutes and no SMS has ever arrived. My number is a Nigerian (+234) mobile on [MTN / Airtel /
Glo / 9mobile].

I have already checked:

- Nigeria selected as the country, number entered **without** the leading zero
- DND status on the line (short code 2442) — not blocking
- Phone spam / blocked-message folders
- I have stopped resending to avoid triggering a lockout

I also tested the transactional API directly. The response was:

```
HTTP [status code] — [message]
```

**What I am asking for**

Manual validation of my account, or an alternative verification method — email, or a voice call
instead of SMS — so I can finish setup.

**Context**

I am not setting up bulk marketing email. This is a contact form on my own small business website. It
will send me my own enquiries, at very low volume, far inside the free plan's 300 emails/day. The DNS
and DKIM work is already complete on my side, so authentication is not the issue.

Thank you,
Richard Olasehinde

---

## Before you send

1. Replace all three `[bracketed]` fields.
2. Do **not** paste your API key. Support has no reason to ask for it, and if they do, generate a new
   one instead of sending the live one.
3. Screenshot the sent ticket and the ticket number.
