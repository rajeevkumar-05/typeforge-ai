# TypeForge: repository findings and load-test guide

Reviewed the public main branch on 22 October 2026. This is a source review, not a measurement of the deployed service. No load test has been sent to your live website, no account has been created, and no remote code has been changed.

## What your architecture actually does

Browser (React/Vite, on Vercel) → Express/Node API (on Render) → MongoDB through Mongoose.

`frontend/src/hooks/useTypingEngine.ts` generates practice text and calculates typing metrics locally. `TestResults.tsx` submits a completed result to `POST /api/tests` for an authenticated user. Anonymous typing sessions do not save results. I found no AI-provider call in the backend source reviewed.

Consequently, 1,000 people typing do not produce 1,000 API calls per keystroke. If 1,000 signed-in users each complete one 30-second test continuously, that averages roughly 33 result saves/second, plus authentication lookups and any other activity. A synchronized finish can produce a much larger short burst. This is an estimate of workload, not a capacity claim.

## Likely bottlenecks to measure

1. **Leaderboard aggregation.** `backend/src/services/leaderboardService.ts` groups matching tests by user, computes best scores/averages/counts, sorts the groups, then limits results and joins user information. For all-time requests, the input is all stored tests. Returning only 50 rows does not limit aggregation input to 50 documents. Existing indexes do not eliminate that grouping work. No server-side result cache is implemented here. Measure first, then consider a short shared cache per period and limit, or maintained per-user leaderboard summaries as data grows. Prevent concurrent cache misses from triggering the same expensive computation repeatedly.
2. **Dashboard aggregation.** `getTestStats` in `backend/src/services/testService.ts` performs six sequential MongoDB operations, including multiple history aggregations. The `{ user: 1, createdAt: -1 }` index already exists, which helps user-history queries. Combining overlapping reads, parallelizing independent bounded work, and later maintaining summary statistics can reduce latency. Parallelizing everything can also increase database pressure; benchmark changes.
3. **Database work on authenticated requests.** `backend/src/middleware/auth.ts` calls `User.findById` for each protected request. A result save therefore includes a user lookup and a test insert. Include this in the test instead of measuring an unauthenticated dummy endpoint.
4. **Unbounded inputs.** History and leaderboard controllers parse a caller-supplied limit without enforcing a positive maximum. Add integer validation and a cap such as 100. Bound history-array size and validate its numeric elements and reasonable duration/metric ranges. The server uses Express's default JSON body limit, but that is not a substitute for field limits.
5. **No application rate limiter found.** Add appropriate limits for login/registration and expensive public reads. With multiple backend instances, use shared limiter storage. Treat expected 429 responses as a separate capacity/policy result rather than hiding them as successful requests.
6. **Liveness versus readiness.** `/api/health` returns a timestamp without querying MongoDB. A 200 proves the HTTP process answered, not that saving or reading data works. Add a bounded database-readiness check and application request/error/latency instrumentation.

An additional correctness issue matters before testing writes: `saveTest` builds `{ user: authenticatedId, ...req.body }`, allowing a submitted `user` field to override the authenticated owner. Allowlist result fields and assign the owner on the server after constructing the payload. Also, fetching a test by ID currently does not check its owner; enforce ownership if test histories are intended to be private. These are source findings; no exploitation was attempted.

## Render-specific interpretation

If your backend uses a Free instance, Render spins it down after 15 idle minutes and startup can take about a minute. Measure that first-visit delay separately from warm-service performance. It is not evidence of traffic overload. Free web services cannot scale to multiple instances. Paid services can support multiple instances; autoscaling has separate workspace-plan requirements. Check current eligibility before changing plans.

Watch Render CPU, RAM, request latency/volume where available, restarts, and service logs. Watch MongoDB's own monitoring for connections, slow operations, CPU/memory and disk activity; Render service metrics do not show the internals of an externally hosted MongoDB database. Confirm actual database hosting and limits in your database dashboard.

## Use the supplied k6 script

Install k6 using the official installation instructions. The script is JavaScript for k6, not a Node.js program.

Use a separate Render staging service pointing to a separate test database. Match production compute/database configuration when drawing capacity conclusions. Populate representative numbers of users and historical tests; an empty database will make the leaderboard and dashboard look unrealistically fast. Use synthetic records, not copies of private user information.

The script has three selectable flows:

| FLOW | Requests | Data changes |
| --- | --- | --- |
| leaderboard | GET /api/leaderboard, rotating four periods | None |
| dashboard | GET /api/tests/stats and GET /api/tests | None |
| session | Wait about 30 seconds, POST /api/tests | Creates synthetic test results |

The dashboard flow is a representative pair of reads, not a recording of every request made by the UI. The session flow isolates result-saving capacity. These tests omit frontend asset downloads, rendering, CORS/preflight behavior, login bursts, and browser responsiveness. Do separate browser checks and login testing. No OAuth or password-reset traffic is generated.

In PowerShell, from the folder containing the script:

```powershell
$env:BASE_URL = 'https://YOUR-STAGING-SERVICE.onrender.com'
$env:FLOW = 'leaderboard'
$env:PROFILE = 'smoke'
k6 run .\typeforge-load-test.js
```

`BASE_URL` is the backend origin without `/api`. Warm up the backend separately if a Free instance is asleep. The script's health preflight has a 10-second timeout and intentionally will not wait through a long cold start. A smoke test validates request/response behavior; one iteration is too small to estimate capacity or percentiles reliably.

Then run a small load test:

```powershell
$env:PROFILE = 'load'
$env:VUS = '10'
k6 run .\typeforge-load-test.js
```

This ramps to 10 virtual users over 30 seconds, holds for two minutes, then ramps down. Pauses make the request rate lower than the virtual-user count. Repeat at 25, 50, then 100 only while the previous run and server metrics remain healthy. Choose later levels from measured results and your budget; do not assume you need to reach 1,000 to learn something useful.

For dashboard and session flows, prepare one distinct staging user per virtual user. Sign in to those test accounts and save their returned JWT strings in a local JSON file, for example `tokens.local.json` containing `["JWT_FOR_TEST_USER_1", "JWT_FOR_TEST_USER_2"]`. The script expects at least as many entries as VUS for load runs. Never commit tokens, send them in chat, or use real-user accounts. Keep test-user histories varied and representative.

```powershell
$env:TOKENS_FILE = './tokens.local.json'
$env:FLOW = 'dashboard'
$env:PROFILE = 'smoke'
k6 run .\typeforge-load-test.js
```

Session writes require explicit staging flags. They are accidental-use guards, not proof that your chosen URL/database is staging. Verify those yourself before running:

```powershell
$env:FLOW = 'session'
$env:TARGET_ENV = 'staging'
$env:ALLOW_WRITES = 'yes'
$env:PROFILE = 'smoke'
k6 run .\typeforge-load-test.js
```

After smoke passes, set PROFILE to load and choose VUS. Session runs create records that affect leaderboard/stats results. Record the number of test-user documents before/after each run and remove only staging fixtures using your own reviewed cleanup procedure. There is no automatic retry on a failed save, because the current API has no idempotency mechanism.

## Read results and decide what to change

The supplied example targets are fewer than 1% HTTP failures, over 99% passing response checks, and endpoint p95 below 1 second. p95 means 95% of sampled requests completed within that time. These are initial targets, not promises or universal standards. The script aborts for excessive errors/check failures after a 15-second evaluation delay; latency thresholds fail the run without early abort. Stop manually with Ctrl+C if server metrics or costs become concerning. No script can guarantee zero effect on other users if pointed at production.

For every run record: flow, VUS, achieved requests/second, per-endpoint p95/p99, failures/status codes, CPU/RAM, MongoDB activity, dataset size, service plan, test origin/region and deployment version. Timing includes network effects, so compare runs from a consistent location. Check load-generator CPU/network too.

If errors/latency rise while Render CPU is saturated, profile expensive Node work and then consider more compute or instances. If MongoDB operations slow while API CPU remains low, inspect query plans, aggregation input size and connection pressure. If only the first idle request is slow, investigate cold start instead. If typing lags while API timings are healthy, profile frontend rendering locally.

After the initial separate flows, build a mixed test from observed traffic, a deliberate arrival-rate burst for synchronized finishes, and a longer soak test. The supplied closed-model VU test sends less traffic when responses slow; it is not a fixed-arrival-rate capacity test. A three-minute warm run cannot establish long-term stability or a universal maximum user count.

## Validation and next information needed

The supplied script was syntax checked locally. k6 is not installed in this workspace, so it has not been executed with k6 or validated against a running staging service. No capacity figure is claimed.

To execute a representative test next, provide the staging backend URL, Render instance type, and database hosting/tier (not the database connection string or credentials). Test-user JWTs stay in your local file.

## References

- Repository: https://github.com/rajeevkumar-05/typeforge-ai
- Render Free: https://render.com/docs/free
- Render scaling: https://render.com/docs/scaling
- Render metrics: https://render.com/docs/service-metrics
- k6 installation: https://grafana.com/docs/k6/latest/set-up/install-k6/
- k6 thresholds: https://grafana.com/docs/k6/latest/using-k6/thresholds/
- k6 API load testing: https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/
