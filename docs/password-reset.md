# Password recovery: deployment and email setup

## Why the old screen could claim success without an email

The original mail helper logged the recipient and reset-email body to the server console when SMTP credentials were absent, then returned success. It returned false on delivery failure, but the caller ignored that result. No email service was configured on the deployed service when this issue was reported.

The new helper never logs reset links, tokens or email bodies. Missing email configuration returns a service-unavailable response before account lookup. Provider failures are no longer silently ignored, and the undelivered reset token is conditionally removed. The UI shows a delivery-service error instead of its confirmation screen when the request fails.

## Required Render setup

This update includes backend source changes. Deploy the latest main branch on the existing Render service. Keep its database, JWT and Google OAuth settings.

Real email delivery requires a provider configured privately in **Render → your service → Environment**. Never commit keys or paste them in chat.

### HTTPS email with Resend (compatible with Render Free networking)

1. Create/configure your Resend account and verify a sending domain/sender you control.
2. Create an API key authorized to send email from that sender.
3. Add these backend environment variables:

```dotenv
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your-private-provider-key>
EMAIL_FROM=TypeForge <reset@your-verified-domain>
CLIENT_URL=https://typeforge-ai-frontend.vercel.app
```

`EMAIL_FROM` must be accepted by your provider; the placeholder above is not a real sender. Resend's test sender is restricted and does not enable password resets for arbitrary real users. A Vercel website subdomain does not give you control of an email-sending domain. Complete the provider's sender/domain verification before testing other recipients. The API key is server-only, never a `VITE_` variable.

The backend uses the provider's HTTPS API directly; no new provider SDK or frontend secret is required. An accepted API request is not proof of inbox delivery: inspect the provider's delivery logs and spam folder during the final test.

### SMTP alternative

On hosting that permits SMTP, configure:

```dotenv
EMAIL_PROVIDER=smtp
SMTP_HOST=<your-provider-host>
SMTP_PORT=587
SMTP_USER=<your-provider-username>
SMTP_PASS=<your-provider-password-or-app-password>
EMAIL_FROM=TypeForge <your-approved-sender>
CLIENT_URL=https://typeforge-ai-frontend.vercel.app
```

Port 465 uses TLS immediately; other ports use required STARTTLS. Connection timeouts are bounded. Gmail requires an appropriate app password/account configuration, not a password committed in this repository.

Render Free blocks outbound SMTP ports 25, 465 and 587. Use the HTTPS option on that plan instead of repeatedly retrying SMTP. See [Render's limits](https://render.com/docs/free), [Resend's email API](https://resend.com/docs/api-reference/emails/send-email), and [Nodemailer's transport options](https://nodemailer.com/smtp).

## What the new recovery flow does

- Forgot-password and new-password views use the login design, aligned fields, readable status messages and one clear sign-in link per state.
- Google-only accounts do not have a TypeForge email/password login to recover; the page provides a direct Google sign-in link.
- Unknown and Google-only addresses receive the same generic successful request response when email service is configured. The page never identifies which addresses are registered.
- The confirmation records a request, not guaranteed inbox delivery. It includes spam-folder guidance, a resend countdown and a change-email action.
- Per-account requests within the initial cooldown do not generate another email. The countdown is a convenience; it is not a distributed IP abuse limiter.
- Reset tokens are random 32-byte values; the database stores only their hashes. Links expire in one hour and are consumed atomically so simultaneous submissions cannot both reuse the token.
- New passwords are bcrypt-hashed. The 72-byte maximum avoids silently truncated bcrypt inputs; the existing six-character minimum is retained.
- Invalid/expired/reused links have a clear route to request a fresh link. New passwords have independent visibility controls and matching feedback. Success has a deliberate sign-in action instead of a forced timer redirect.
- Production recovery links require an HTTPS `CLIENT_URL`. With comma-separated client origins, email links use the first configured origin.

## Validation

```sh
cd backend
npm ci
npm run test:password-reset
```

The test script builds the backend and runs Node's built-in test runner. Tests simulate the database and mail provider, while exercising the actual compiled service, token helpers and bcrypt hashing. They cover missing credentials, provider rejection, TLS options, generic unknown/Google-only handling, hashed tokens, link origin construction, failure cleanup, cooldown, expiry, token reuse, simultaneous resets and input bounds. They do not send email or change real accounts.

The frontend also passes `npm run build`. Final live acceptance still requires your own disposable email/password test account and the configured provider: request a link, confirm delivery and correct HTTPS frontend URL, reset the test password, sign in using the new password, then verify that reusing the link fails. Complete credential entry yourself. Do not reset a real user's password as a deployment test.

## Current completion boundary

Code and UI can be deployed without secrets. Actual delivery cannot work until the private provider settings above are added on Render and the backend is deployed. A missing provider now produces a clear failure rather than pretending an email was sent.
