# Plan 08b review

Atlas Coach is implemented on the public Google-authenticated Worker. Signed-out
users see a compact sign-in prompt; signed-in users get a catalog-backed chat.
The UI uses existing theme tokens, retains the compact launcher, supports 360px,
and handles Enter, Shift+Enter, Escape, focus containment and focus return.

`workers/coach.mjs` supplies `askCoach()`, with Workers AI as the default and
`COACH_PROVIDER=openai` selecting gpt-5-nano. D1 admits 20 attempts per user per
UTC day. OpenAI requests reserve a conservative maximum cost atomically against
the global $5/month ledger, reconcile known actual usage, and retain uncertain
reservations. A cap trip disables OpenAI for that calendar month and switches to
Workers AI with a notice. Invalid catalog IDs are rejected; names, flight numbers,
stability values and source links come from Atlas records.

Added the AI binding and `0002_atlas_coach.sql`; applied the migration to normal
local dev storage and isolated QA storage. The OpenAI production Wrangler secret
is present. Credentials remain in Wrangler secrets and the user's ignored local
`.dev.vars`; no real key was added to tracked source or public assets.

## Verification

| Check | Result |
| --- | --- |
| Google OAuth callback and real D1 session, using signed provider fixture | Passed on dev Worker |
| Signed-out gate and signed-in chat | Passed |
| 20 accepted messages and blocked 21st | Passed on actual local D1 with fixture AI |
| Default Workers AI, OpenAI selection, monthly fallback | Passed with provider fixtures |
| Real Workers AI reply | Passed |
| Real OpenAI error fallback | Passed: HTTP 401 `invalid_api_key` falls back cleanly |
| Real monthly-cap fallback to Workers AI | Passed, with isolated test budget seeded to $5 |
| Successful real gpt-5-nano reply and live A/B comparison | Passed: HTTP 200, completed response from `gpt-5-nano-2025-08-07`, with usage returned |
| Light, Midnight, Charcoal at 1440px and 360px | Passed, screenshots inspected |
| Keyboard controls, containment, focus return, no horizontal overflow | Passed |
| Auth, coach, grouping and layout unit tests | 34 passed |
| Targeted lint, syntax, TypeScript and whitespace checks | Passed |
| Production Worker dry-run build | Passed |

The live OpenAI check was rerun with the new key the user configured in ignored
`.dev.vars`. The test received that key in memory; its value was never displayed
or copied into another file. The strict live suite passed, including the real
OpenAI reply and forced monthly-cap fallback to real Workers AI. The updated
`outputs/plan-08b/live/ab-baseline.json` compares both providers on the same Buzzz
question. The earlier HTTP 401 blocker is resolved.

The original Workers AI Llama 3.1 endpoint was retired. The selected live-tested
baseline is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, which supports JSON Schema.
Workers AI has a daily free allocation, not unlimited free usage; paid plans
charge above it. Setup and budget details are in [atlas-coach.md](atlas-coach.md).

## Screenshots

All six theme/viewport combinations are under `outputs/plan-08b/`. Real
provider screenshots and the completed A/B baseline are under `outputs/plan-08b/live/`.

| View | Screenshot |
| --- | --- |
| Closed, desktop Midnight | [View](../outputs/plan-08b/closed-1440-midnight.png) |
| Open, desktop Light | [View](../outputs/plan-08b/open-1440-light.png) |
| Open, 360px Midnight | [View](../outputs/plan-08b/open-360-midnight.png) |
| Signed out, 360px Light | [View](../outputs/plan-08b/signed-out-360-light.png) |
| Daily cap | [View](../outputs/plan-08b/daily-cap.png) |
| Real monthly-cap fallback | [View](../outputs/plan-08b/live/monthly-cap-fallback.png) |

Before: the public coach was unconnected, signed-out users could see a disabled
chat, and disclosure text referenced a 30-message Sites limit and bag context.
After: the public coach uses Google sessions, hides chat until sign-in, displays
remaining usage and fallback notices, and shares only conversation/catalog data.

The legacy Sites backend is a separate deployment; this change targets the
public Worker from Plan 08a. Earlier uncommitted work is preserved. No commit,
push, deployment, remote migration, or production-budget mutation was performed.
Remote migration must run after review and before deployment.

The normal dev Worker is running at `https://localhost:8787` for review.
Its account endpoint reports signed out, Google sign-in ready, and coach ready.
