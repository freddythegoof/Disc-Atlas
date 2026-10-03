# Plan 08a review

Google-only accounts are implemented on the public Cloudflare Worker. The menu
shows Sign in when signed out, or Profile, Account settings and Sign out when
signed in. Profile shows display name/email and sign-out. Settings edits the
display name and confirms account deletion by requiring `DELETE` in a dialog.
All account UI uses the existing Light, Midnight and Charcoal theme tokens.

Created D1 database `disc-atlas-accounts`; applied
`migrations/accounts/0001_google_accounts.sql` locally and remotely. Added the
`DB` and `ASSETS` bindings to `wrangler.public.jsonc`. Session cookies are Secure,
HttpOnly and SameSite=Lax; account writes require Origin and CSRF validation.
No passwords or Google access/refresh tokens are stored. No real OAuth secrets
were added. Setup instructions are in [accounts-google.md](accounts-google.md).

## Verification

- Passed the actual local Wrangler dev Worker + D1 flow using a signed Google
  provider fixture, including callback, cookies, name edit/reload, sign-out,
  cancellation of deletion, confirmed deletion, and signed-out Profile redirect.
- Captured all four requested views in all three themes at 1440px and 360px;
  checked menu containment, horizontal overflow, arrow navigation and focus return.
- Passed 23 auth/grouping/layout unit tests, the public Worker checks, existing
  contextual-header/theme Playwright checks, and existing premium interaction checks.
- Passed targeted lint, JavaScript syntax checks and `git diff --check`.
- Passed production Wrangler dry-run build. Production Worker/public assets contain
  no test provider credentials or environment files.
- Live Google consent/client verification is **pending**, as the owner requested
  while creating the OAuth client. The screenshots use a synthetic test account.

No Worker deployment, commit or push. Earlier uncommitted work is preserved.

## Local live-verification storage fix

The normal dev Worker's default SQLite file under `.wrangler/state/v3/d1` had
no tables, while the isolated `work/auth-qa/state` database had the account
schema. The `DB` binding in `wrangler.public.jsonc` was correct. Re-running
the migration with `--local --config wrangler.public.jsonc` applied eight
commands to the default store. SQLite now contains `auth_oauth_states`,
`auth_sessions`, `auth_users` and the recorded migration.

The dev Worker was restarted on `https://localhost:8787`. Request logs confirm
`/signin` returns 200, `/api/account` returns 200 with OAuth configured, and
`/auth/google/start` returns 302 to Google with the secure HttpOnly OAuth cookie.
Google consent/callback was not completed in this check. Added safe missing-table
diagnostics and a regression test; all four auth tests and targeted lint pass.

## Screenshots

| Theme | Width | Signed out menu | Signed in menu | Profile | Settings |
| --- | --- | --- | --- | --- | --- |
| Light | 1440 | [View](../outputs/plan-08a/menu-signed-out-1440-light.png) | [View](../outputs/plan-08a/menu-signed-in-1440-light.png) | [View](../outputs/plan-08a/profile-1440-light.png) | [View](../outputs/plan-08a/account-settings-1440-light.png) |
| Midnight | 1440 | [View](../outputs/plan-08a/menu-signed-out-1440-midnight.png) | [View](../outputs/plan-08a/menu-signed-in-1440-midnight.png) | [View](../outputs/plan-08a/profile-1440-midnight.png) | [View](../outputs/plan-08a/account-settings-1440-midnight.png) |
| Charcoal | 1440 | [View](../outputs/plan-08a/menu-signed-out-1440-charcoal.png) | [View](../outputs/plan-08a/menu-signed-in-1440-charcoal.png) | [View](../outputs/plan-08a/profile-1440-charcoal.png) | [View](../outputs/plan-08a/account-settings-1440-charcoal.png) |
| Light | 360 | [View](../outputs/plan-08a/menu-signed-out-360-light.png) | [View](../outputs/plan-08a/menu-signed-in-360-light.png) | [View](../outputs/plan-08a/profile-360-light.png) | [View](../outputs/plan-08a/account-settings-360-light.png) |
| Midnight | 360 | [View](../outputs/plan-08a/menu-signed-out-360-midnight.png) | [View](../outputs/plan-08a/menu-signed-in-360-midnight.png) | [View](../outputs/plan-08a/profile-360-midnight.png) | [View](../outputs/plan-08a/account-settings-360-midnight.png) |
| Charcoal | 360 | [View](../outputs/plan-08a/menu-signed-out-360-charcoal.png) | [View](../outputs/plan-08a/menu-signed-in-360-charcoal.png) | [View](../outputs/plan-08a/profile-360-charcoal.png) | [View](../outputs/plan-08a/account-settings-360-charcoal.png) |
