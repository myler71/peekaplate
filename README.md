# PeekaPlate

AI-powered restaurant menu intelligence, with a longer-term ambition to help diners explore dishes through 3D and AR.

## Current implementation

This repository imports the existing PeekaPlate Netlify website: the landing page, three-step restaurant pilot onboarding at `/join/`, Netlify Forms submission handling, and an event-driven confirmation email function. AI analysis, CRM, 3D generation, and AR viewing are planned capabilities, not implemented features in this codebase.

## Local development

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run check
npx netlify dev
```

Netlify Forms acceptance and email delivery require a deployed Netlify environment. Local preview does not prove either works in production.

## Structure

- `site/`: existing website and onboarding pages, styles, and scripts.
- `netlify/functions/`: form event confirmation handler.
- `netlify.toml`: publishing, function bundling, and security headers.
- `docs/`: product direction and operational notes.
- `.env.example`: environment variable names only.

## Existing deployment

Website: https://peekaplate.io

Netlify project: `peekaplate` (site ID `2a45397f-0ef5-4263-abf6-7c398df669fb`). Publish directory: `site`. Functions directory: `netlify/functions`. There is no frontend build step.

To link this checkout to the existing Netlify project:

```sh
npx netlify link --id 2a45397f-0ef5-4263-abf6-7c398df669fb
npx netlify deploy --no-build --dir site --functions netlify/functions
```

Review the preview before deploying with `--prod`. Connecting GitHub for continuous deployment is a separate Netlify setting.

## Email configuration

Set `PORKBUN_SMTP_PASSWORD` in Netlify's protected environment settings, available to Functions. It is the password for the hosted `hello@peekaplate.io` mailbox. Never commit credentials. The handler uses Porkbun SMTP over TLS and runs for eligible Netlify form events. Email delivery must be verified with a real recipient; storing a form submission does not confirm inbox delivery. Retries may send duplicate emails.

## Source provenance

Imported from the connected workspace's `peekaplate-netlify` project. Reference files, screenshots, dependencies, and synced `sources/` files are excluded.
