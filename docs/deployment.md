# Deploy the updated TypeForge frontend

## Included changes

- Compact typing toolbar inspired by the supplied Monkeytype reference, keeping TypeForge branding and navigation.
- English only with no language selector. Removed saved Programming/multilingual selections cannot restore those choices.
- Three curated themes: White, Black, Blue. API-compatible values remain `light`, `oled`, `dark`; a saved `highContrast` preference migrates to Black.
- Removed large settings cards, session utilities, difficulty/font/layout selectors and custom accent-color choices.
- Time modes: 15/30/60/120 seconds. Word modes: 10/25/50/100 words. Zen mode with an explicit finish button.
- Independent punctuation and number toggles, three-line text viewport, resize-aware caret and internal line scrolling.
- Fixed live-WPM startup spikes and stale values while idle. Escape restarts; Tab navigates controls.
- Improved results spacing and theme readability.

Backend application code and account-security mechanisms have not changed. The earlier scalability findings are recommendations, not implemented backend fixes.

## Vercel

Use the existing project linked to this repository and deploy the updated `main` branch. If Git auto-deployment is enabled, a push may already trigger it; inspect the new deployment before starting another.

Verify these settings:

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable | `VITE_API_URL=https://typeforge-backend.onrender.com/api` |

The API URL must include `/api`. It is a public frontend configuration value, not a secret. Retain any other existing project settings. After changing build-time environment variables, deploy again so the frontend includes them.

## Render

There are no backend source changes requiring redeployment for this UI update. If your service auto-deploys every main-branch commit, inspect its status. If you choose to deploy manually, use the existing service and the latest main-branch commit.

Existing backend configuration should remain:

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Health check path | `/api/health` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://typeforge-ai-frontend.vercel.app` |
| `GOOGLE_CALLBACK_URL` | `https://typeforge-backend.onrender.com/api/auth/google/callback` |

Keep the existing MongoDB URI, JWT secret, Google client ID/secret and other credentials in Render's environment settings. Never add them to Git. This update has not modified Render or Google Cloud settings.

## Local development

From `frontend/`:

```sh
npm ci
npm run dev
```

For a local backend, copy `.env.example` to `.env.local` and use `http://localhost:5000/api`. That backend separately needs MongoDB, JWT and OAuth configuration.

To use the current Render backend from localhost, create an ignored `frontend/.env.local` containing:

```dotenv
VITE_API_URL=https://typeforge-backend.onrender.com/api
```

Restart Vite. This API URL was configured in the working local checkout; the ignored file is not committed. Verified backend health, localhost CORS, and the Google sign-in redirect.

**Local OAuth limitation:** the Render backend returns OAuth completion to its configured `CLIENT_URL`, the live Vercel frontend. A cancellation-redirect check confirmed that destination. Google sign-in starting from localhost therefore does not establish a signed-in localhost session. For full localhost OAuth, use a separately configured development backend or implement an allowlisted return destination with appropriate OAuth state handling. Do not point the production service's frontend URL at localhost merely to test this.

## Validation and release checks

Completed locally:

- `npm run build` in `frontend/`: TypeScript and Vite passed.
- `git diff --check`: passed.
- Browser: 10-word test completed with 100% accuracy and results/chart.
- Browser: 15-second test completed automatically.
- Browser: restart, Escape, Tab navigation, backspace, zen selection, punctuation and number output.
- Browser: all three themes inspected.
- Built production frontend opened in a fresh browser tab with no captured console errors; typing/backspace worked.
- Existing Render `/api/health` returned 200; Google OAuth start returned a redirect to `accounts.google.com`; localhost CORS returned the matching allowed origin.

After Vercel deploys, verify `/typing`, themes, test presets, Google sign-in, a signed-in saved result, dashboard and leaderboard. Authenticated result saving and live deployment have not been verified in this local update. Real-device mobile keyboard behavior also needs a device check.

## Login-page refresh

The login view now uses a dedicated, responsive stylesheet with consistent label/input alignment, a TypeForge brand header, centered primary action, and subtle hover/focus feedback. Interactive additions include password visibility, inline email/password validation with focus on the first invalid field, Caps Lock feedback, pending-request feedback, duplicate-submit prevention, and readable sign-in failure messages. The optional Remember email checkbox saves only the email address locally after a successful email/password sign-in; it does not change session lifetime or store a password.

The Google OAuth link and existing authentication service remain in use. Registration and password-reset routes remain available. Local checks covered the production build, empty-field validation, valid-email feedback, password visibility, keyboard navigation and a narrow browser layout. Successful authentication was not tested with real credentials as part of this visual update.

## Performance work

See [the scalability review and testing guide](../performance/README.md) and [the k6 script](../performance/typeforge-load-test.js). No load test has been sent to the live service. Use a staging service and disposable test data for result-saving tests.
