# Google accounts on the public Worker

Plan 08a adds Google-only sign-in to `workers/public.mjs`, using the existing
`wrangler.public.jsonc` deployment. The separate Sites/ChatGPT backend is not
used to authenticate public Worker requests. Forged identity headers are ignored.

## Configuration

The following Worker secrets are required. No credentials or secret values belong
in this repository or in this document.

| Secret | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth client ID, type **Web application** |
| `GOOGLE_CLIENT_SECRET` | The same OAuth client's secret |

Install production credentials with Wrangler's interactive secret prompts:

```powershell
node node_modules/wrangler/bin/wrangler.js secret put GOOGLE_CLIENT_ID --config wrangler.public.jsonc
node node_modules/wrangler/bin/wrangler.js secret put GOOGLE_CLIENT_SECRET --config wrangler.public.jsonc
```

For local development, set those same keys in `.dev.vars` at the repository root.
Wrangler reads this file for local development; production secrets are not copied
into local development automatically. `.dev.vars*`, `.env*`, `.wrangler/`, `work/`
and `outputs/` are ignored. Do not include real values in screenshots or logs.
Keep the OAuth client secret out of CLI arguments, public assets and `vars` in
the production Wrangler configuration.

In Google Cloud, enable the consent screen and add your Google account as a test
user while the application is in testing. Request only `openid email profile`.
Register these **authorized redirect URIs**, matching the origin exactly:

- Local dev: `https://localhost:8787/auth/google/callback`.
- Production: the site's HTTPS origin followed by `/auth/google/callback`.

Use `https://localhost:8787` when testing, rather than swapping between localhost
and its IP address. OAuth state and sessions use host-bound cookies. A local TLS
certificate warning may need to be accepted in your browser. The server flow does
not need a browser-facing client secret, refresh tokens or access to Google APIs.

## D1 and migrations

Database `disc-atlas-accounts` was created with Wrangler. Its binding is `DB`;
the database ID is in `wrangler.public.jsonc`. These identifiers are not secrets.
The migration lives in `migrations/accounts/0001_google_accounts.sql`. Account
tables are separate from the earlier Sites bag/throwing-profile migrations in
`drizzle/`. Do not apply those migrations to this database for Plan 08a.

```powershell
node node_modules/wrangler/bin/wrangler.js d1 migrations apply disc-atlas-accounts --local --config wrangler.public.jsonc
node node_modules/wrangler/bin/wrangler.js d1 migrations apply disc-atlas-accounts --remote --config wrangler.public.jsonc
node node_modules/wrangler/bin/wrangler.js dev --config wrangler.public.jsonc --local-protocol https --port 8787
```

Local and remote D1 are distinct. Remote migrations must succeed before deploying
the auth-enabled Worker. Plan 08a does not deploy, commit, or push. There are no
paid auxiliary services or read replication; sessions use indexed D1 reads and
expired state/session rows are cleaned during sign-in attempts.

The browser fixture's `work/auth-qa/state` database is also distinct from the
normal dev Worker's `.wrangler/state` database. Passing the fixture test does not
migrate normal dev storage. Run the local migration command above from the repo
root, with `--config wrangler.public.jsonc`, before testing real Google sign-in.
If you add `--persist-to` to dev, use that exact same path for local migrations.
Confirm the schema without reading account data:

```powershell
node node_modules/wrangler/bin/wrangler.js d1 execute disc-atlas-accounts --local --config wrangler.public.jsonc --command "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'auth_%' ORDER BY name"
```

Expect `auth_oauth_states`, `auth_sessions` and `auth_users`. A missing table logs
`Account request failed` with `reason: missing-account-table` and the table name;
OAuth codes, tokens, credentials and SQL bindings are excluded from that log.

## Behavior and security

- `/signin` offers Google sign-in. `/profile` shows display name/email and sign-out.
  `/account-settings` edits the name and requires typing `DELETE` in a confirmation
  dialog before deleting the account.
- The menu includes Sign in when signed out, or Profile, Account settings and
  Sign out when signed in. Hidden items are skipped by keyboard navigation.
- Google authorization code flow uses PKCE S256, random state bound to a separate
  browser cookie, a ten-minute one-use D1 state record and an ID-token nonce.
  `jose` validates Google's RS256 signature, issuer, audience, authorized party,
  expiry and token age. Only verified email addresses are accepted. Users are
  identified by Google's immutable `sub`, not their email address.
- Sessions last 30 days. The cookie is `__Host-atlas-session`, with Secure,
  HttpOnly, SameSite=Lax, Path=/ and no Domain. D1 stores the SHA-256 digest of a
  random 256-bit session token. No passwords or Google access/refresh tokens are
  stored. A successful login rotates an existing browser session.
- Name changes, deletion and sign-out require the request's exact Origin, JSON
  content type, an authenticated session and its CSRF token. Account responses
  are `no-store`; auth redirects also suppress referrer information.
- Sign-out revokes the current session. Account deletion removes the account and
  cascades to every session. It does not delete the user's Google account. An
  account can be created again by signing in. Edited display names survive later
  Google sign-ins; current verified Google email is refreshed on sign-in.
- Saved bags remain unavailable on the public Worker. Plan 08b adds the
  login-gated [Atlas Coach](atlas-coach.md) on top of these Google sessions.

## Verification

```powershell
node --test tests/auth.mjs
node tests/workers.mjs
node tests/accounts-browser.mjs
```

The browser check starts a real local Wrangler dev Worker with local D1, in an
isolated `work/auth-qa/state` directory. `tests/auth.wrangler.jsonc` is strictly
a local fixture configuration, not a deployment configuration. Its synthetic
credentials are test values. A test transport signs an RS256 ID token; the actual
production handlers perform PKCE/state/token verification, create the D1 account
and issue the real secure session cookie. Production has no mock-login endpoint
or environment switch that bypasses Google verification. Because Playwright
[does not intercept later requests in a redirect chain](https://playwright.dev/docs/api/class-page#page-route),
the check obtains the start redirect using its shared browser cookie jar, then
opens the provider fixture as a fresh navigation. The start and callback handlers
and all D1/session operations still run on the dev Worker.

Screenshots are written to `outputs/plan-08a/`, covering signed-out/signed-in menus,
Profile and Account settings in Light, Midnight and Charcoal at 1440px and 360px.
Screenshot names include viewport and theme. The test also exercises reload,
name persistence, sign-out, cancellation of deletion, confirmed deletion and a
signed-out Profile redirect. It requires Playwright; `PLAYWRIGHT_MODULE` can point
at an existing installation if it is not installed in the repository.

The fixture verifies the application's OAuth flow, not Google's live consent
screen or client configuration. After adding the real credentials, run the dev
Worker command above, visit `/signin`, complete Google consent, inspect the menu,
edit the name, reload, sign out, then sign back in. Verify deletion using a test
account you are willing to delete. Live Google verification requires the owner's
OAuth client and is recorded separately from fixture verification.

References: [Google OpenID Connect server flow](https://developers.google.com/identity/openid-connect/openid-connect),
[jose verification](https://github.com/panva/jose),
[D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/),
[Workers HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).
