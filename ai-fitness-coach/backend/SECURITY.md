# FitVision Backend — Security Checklist (Founder Actions)

Status: Wave-A hardening (secrets, admin bootstrap, password reset) is done in
code. The items below **require your login to each service dashboard** — they
cannot be verified or performed from the repository. Do each one before the
product is featured/shown publicly.

---

## 1. MongoDB Atlas — rotate the database password (HIGH PRIORITY)

The local, untracked `backend/.env` contains a real Atlas connection string with
a known username/password pattern. Anyone who has seen the repo or its history
could try it.

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. **Database Access → the database user (`admin`)** → Edit → Generate a new
   strong password (or create a dedicated user with least-privilege access to
   only the `ai-fitness-coach` database).
3. **Network Access** — restrict to your deployment IP range (do not leave
   `0.0.0.0/0` open).
4. Update `MONGO_URI` in `backend/.env` with the new credentials.
5. If the URI was ever committed to git history, consider rotating regardless
   — the old password should be treated as compromised.

## 2. Google AI Studio — rotate the Gemini API key (HIGH PRIORITY)

The `GEMINI_API_KEY` value in the local `.env` may have been exposed with the
same repo history.

1. Go to [Google AI Studio → API keys](https://aistudio.google.com/apikey).
2. **Delete** the current key and **create a new one**.
3. Update `GEMINI_API_KEY` in `backend/.env`.
4. Confirm the new key is enabled for the model(s) the backend uses (Gemini
   Flash family) before testing the AI plan/chat features.

## 3. JWT secret — set a strong value (REQUIRED before production)

`backend/.env` currently holds a weak JWT signing secret. Anyone who can guess
or recover it can forge admin tokens.

1. Generate a strong secret, e.g.:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
   ```
2. Set it as `JWT_SECRET` in `backend/.env` (and in the hosting provider's
   environment variables for production).
3. After rotating, all existing sessions/tokens are invalidated — users sign in
   again. (Expected.)

## 4. Create the initial admin + first password reset (email required)

**Admin creation (code is ready):**
- With MongoDB reachable, start the backend **once** with:
  `ADMIN_BOOTSTRAP=true` and optionally `ADMIN_PASSWORD=<your strong password>`.
- The console prints the initial password once (only when generated). The admin
  account is **never** reset on later boots — that backdoor was removed.

**Password reset for end users (founder decision pending):**
- There is currently **no email transport** in the stack, so self-service
  password reset is disabled in production (the endpoint returns a clear 503).
- Decision: add a mailer (recommended: Resend, or Nodemailer + your SMTP) and
  wire the token email. Until then:
  - Dev mode prints the single-use reset token to the backend console (or
    returns it in the response when `RESET_TOKEN_DEBUG=true`).
  - Flow: `POST /api/auth/forgot-password { email }` → token (30 min, single-use,
    stored hashed) → `POST /api/auth/reset-password { email, token, newPassword }`.

## 5. Password-reset email delivery (once a mailer is added)

1. Verify the sending domain in Resend (or configure SMTP env vars).
2. Set the transport env vars and flip `RESET_EMAIL_CONFIGURED` (see
   `src/controllers/adminController.js`) to `true`.
3. Test the full forgot → email → reset loop on a staging deploy before
   production.

## 6. General production hygiene

- `NODE_ENV=production` on the host.
- Do not commit `.env` — it is git-ignored; only `.env.example` (placeholders)
  is tracked. Copy it to `.env` and fill real values.
- Env vars used by the backend (see `.env.example`):
  `PORT`, `NODE_ENV`, `MONGO_URI`, `GEMINI_API_KEY`, `JWT_SECRET`,
  `CORS_ORIGINS`, `ADMIN_BOOTSTRAP`, `ADMIN_PASSWORD`, `DEMO_USER_PASSWORD`,
  `RESET_TOKEN_DEBUG`.

---

*Companion doc: `../../README.md` (dev demo-access instructions). Hardening
changelog: db.js bootstrap, seed.js, services/store.js, controllers/adminController.js
(forgot/reset), routes/authRoutes.js, server.js env guard, Login.jsx demo-fill.*
