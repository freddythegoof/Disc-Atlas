# Atlas Coach (Plan 08b)

The public Worker serves `/api/coach` using the Plan 08a Google session.
Signed-out users see a compact sign-in prompt, and Google returns them to
`/?coach=1`. The modal uses Light, Midnight and Charcoal tokens. Enter sends,
Shift+Enter adds a line, Escape closes, and focus stays inside and returns to
the opener. The launcher remains compact.

## Configuration

`wrangler.public.jsonc` has the Workers AI `AI` binding and defaults
`COACH_PROVIDER` to `workers-ai`. Only the exact value `openai` enables the
alternate provider. Unset or unrecognized values use Workers AI.

| Provider | Model | Behavior |
| --- | --- | --- |
| `workers-ai` | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Default and comparison baseline; supports JSON Schema |
| `openai` | `gpt-5-nano` | Responses API, minimal reasoning, low verbosity, 768 output tokens, storage disabled |

The OpenAI credential is a Wrangler secret, never an asset, config value, source
file or CLI argument. The existing secret is configured. To rotate it, use the
interactive prompt:

```powershell
node node_modules/wrangler/bin/wrangler.js secret put OPENAI_API_KEY --config wrangler.public.jsonc
```

Change the non-secret `COACH_PROVIDER` variable to switch providers. Production
changes require publishing the reviewed Worker/configuration; local verification
does not publish. Production Wrangler secrets are not copied into local dev.
The live QA runner passes the environment's `OPENAI_API_KEY` to Wrangler in
memory, without writing it into the checkout.
When the key is in the user's ignored `.dev.vars`, pass its value to the QA
process in memory; normal Wrangler dev reads that file automatically. The
`--skip-build` QA option reuses prepared assets when a running dev worker locks
the build directory on Windows.
The AI binding has `remote:true`: inference always runs on Cloudflare. Use
`wrangler dev` without `--local` for live AI; that flag disables remote bindings.
D1 and assets remain local during the QA run.

Cloudflare's free Workers AI allocation is 10,000 neurons/day. Paid Workers plans
charge above it; this is not unlimited free inference.
See [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
GPT-5 nano's documented standard rates are $0.05/million input and $0.40/million
output tokens; reply cost varies with history and response length.
See [OpenAI model documentation](https://developers.openai.com/api/docs/models/gpt-5-nano).

## D1 limits and deployment prerequisites

Apply `migrations/accounts/0002_atlas_coach.sql` to the accounts D1 binding.
It adds `atlas_coach_usage` and `atlas_coach_budget`. It does not alter the earlier
Sites bag database or migrations. The normal local database has been migrated.
Remote migration and deployment remain pending review.

```powershell
node node_modules/wrangler/bin/wrangler.js d1 migrations apply disc-atlas-accounts --local --config wrangler.public.jsonc
# After review, before deploying:
node node_modules/wrangler/bin/wrangler.js d1 migrations apply disc-atlas-accounts --remote --config wrangler.public.jsonc
```

- Authenticated GET reports remaining messages and reset time. POST additionally
  requires exact Origin and session CSRF validation.
- An atomic D1 UPSERT admits 20 valid attempts per user per UTC day. Concurrent
  sends cannot exceed 20. Provider failures count; invalid input and unauthorized
  requests do not. Clearing chat does not reset usage.
- Counts reset at midnight UTC. Account deletion cascades to its daily counts.
  Chat content is never stored in D1.
- The global monthly OpenAI ledger uses integer millionths of a US dollar.
  A D1 UPSERT reserves a conservative maximum charge before each request: UTF-8
  request size plus framing/schema overhead bounds input tokens; the output limit
  includes reasoning. Successful responses reconcile actual usage, charging input
  at full rate even when cached. Missing usage, network failures, timeouts and
  interrupted requests retain reservations because a charge cannot be ruled out.
  There are no automatic paid retries.
- The $5 cap includes in-flight and uncertain reservations. If another request
  cannot fit, the month's row latches `disabled=1`; Workers AI handles that same
  message with a notice and the same daily attempt. Reconciliation never clears
  the latch. A new UTC calendar month starts a new ledger. Reservations can trip
  the cap slightly early to prevent concurrent overspending.
- Missing credentials, OpenAI errors or an invalid alternate-provider answer also
  fall back to Workers AI with a notice. Default-provider failures produce a
  friendly retry message. Raw provider errors and credentials are not exposed.

The $5 ledger covers this coach's calls, not other apps sharing the key/project.
Review pricing constants if OpenAI changes this model's rates.

## Catalog grounding and privacy

Both providers receive the same bounded selection of Atlas records: published
ratings, exact mold IDs, source URLs and the existing provisional
`clamp(50 + 10 × (turn + fade), 0, 100)` index. Turn and fade remain separate.
Advice is instructed to be concise, limited to disc golf, acknowledge missing
facts, and account for release, power, plastic, wear and wind. Missing ratings
remain null; a user's bag/profile is not assumed.

Providers return structured advice and at most three catalog IDs. Unknown IDs
and placeholders are rejected. The server inserts exact catalog names and
ratings and returns source links. The browser uses `textContent` for provider
text and accepts only HTTPS source links. Model advice is still probabilistic.

Only conversation history and catalog context are sent. Names/emails, saved bag,
profile and photos are excluded. Chat stays in page memory and clears when
identity/session changes or the player signs out. Provider retention can apply
despite OpenAI's `store:false`. The privacy notice reflects this flow.

## Verification

```powershell
node --test --test-isolation=none tests/coach.mjs tests/auth.mjs
node tests/coach-browser.mjs
node tests/coach-browser.mjs --live
```

Browser checks use a real local Wrangler Worker at `https://localhost:8798` and
isolated D1 in `work/coach-qa/state`. A signed Google provider fixture runs the
real OAuth callback, session-cookie and CSRF handlers. It does not retest Google's
live consent screen, already verified in Plan 08a. Production has no fixture
login route or test provider switches.

Set `PLAYWRIGHT_MODULE` to an available Playwright installation and, if needed,
`PLAYWRIGHT_EXECUTABLE_PATH` to an installed Chromium binary. Fixture mode uses
deterministic AI replies to exercise 20 accepted sends and the rejected 21st.
Live mode makes three real provider requests: the same Buzzz question for each
provider, then a forced-budget Workers AI fallback. Only the isolated local
ledger is seeded, never the user's production budget or daily counts.

Screenshots are in `outputs/plan-08b/`, with live captures under `live/`. Names
include theme and viewport width. The runner writes `ab-baseline.json` with
synthetic questions, provider replies and elapsed times.
