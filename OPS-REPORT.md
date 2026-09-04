# FitVision AI — Operations Report (Founder-Side)

**Repo:** `SoftnoveX-All-Projects/softnovex-ai-fitness-coach` (frontend `ai-fitness-coach/frontend`, backend `ai-fitness-coach/backend`)
**Live site (per task):** `https://fitvision.softnovex.com`
**Date:** 2026-09-04
**Status:** Code fixes below are **applied in the repo**. Nothing was deployed — every hosting action here requires founder credentials and is listed as founder-side.

---

## 1. Where things are hosted (founder to confirm/complete)

| Piece | Host | Founder action |
|---|---|---|
| Frontend (Vite SPA) | Vercel — `fitvision.softnovex.com` | Confirm the project is imported from this repo, root dir = `ai-fitness-coach/frontend`, framework preset = Vite. |
| Backend (Express + Socket.IO) | Not confirmed in repo | Founder chooses (Render/Railway/Fly.io/VPS). It MUST be a **persistent** Node host — Socket.IO needs long-lived connections; serverless would break real-time plan push. |
| Database | MongoDB Atlas | Existing cluster + `MONGO_URI` (rotate password — see `backend/SECURITY.md`). |
| AI | Google AI Studio | `GEMINI_API_KEY` (rotate — see `backend/SECURITY.md`); model constant `gemini-2.5-flash` lives in `backend/src/config/gemini.js`. |

### The SPA-rewrite fix (added to this repo)

`frontend/vercel.json` now rewrites every non-file, non-`/api` path to `/index.html`, so direct loads of `/login`, `/pricing`, `/plans`, `/onboarding`, `/admin/login` etc. return the app instead of 404.

**Assumption made (verify in Vercel dashboard):** the production API is reached at **same-origin `/api`** (axios default `baseURL = '/api'`). The rewrite deliberately **excludes `/api/*`** so a platform-level route (Vercel function, or a domain-level reverse proxy such as Vercel Rewrites → backend host, or a Cloudflare tunnel) can keep serving the API. If instead the founder calls the backend at a **separate origin**, set `VITE_API_URL=https://<backend-host>` in Vercel env (frontend axios then uses that base), and the `/api` exclusion in the rewrite simply becomes unused.

**Verify after deploy:** load `https://fitvision.softnovex.com/login` directly (hard refresh) → should render the login page (not 404). Then test a full login → API works.

---

## 2. Environment variables (Vercel frontend project)

Set in **Production + Preview**:

| Variable | Value / note |
|---|---|
| `VITE_API_URL` | **Leave empty** if `/api` is proxied same-origin; otherwise `https://<backend-host>` (no trailing `/api` — axios appends it). |
| _(optional)_ `VITE_SOCKET_URL` | Not used by code today: the client connects to the **same origin as the page** (dev: the Vite `/socket.io` proxy → `localhost:5000`). For production same-origin proxying of Socket.IO, configure your host/domain to forward `/socket.io` with `ws: true` to the backend. If the API moves to another origin, the socket URL logic in `frontend/src/pages/Plans.jsx` must be pointed at the backend origin too. |

Backend `.env` (on the backend host) — see `backend/.env.example` + `backend/SECURITY.md`: `PORT`, `NODE_ENV=production`, `MONGO_URI`, `GEMINI_API_KEY`, `JWT_SECRET` (strong, ≥32 chars), `CORS_ORIGINS`, `ADMIN_BOOTSTRAP`/`ADMIN_PASSWORD` (first boot only), `DEMO_USER_PASSWORD` (optional, dev), `RESET_TOKEN_DEBUG=false`.

## 3. CORS

Backend reads `CORS_ORIGINS` (comma-separated allow-list). For production set it to include:
- `https://fitvision.softnovex.com` (and `https://www.fitvision.softnovex.com` if used)
- your local dev origin `http://localhost:3000` for development

Socket.IO CORS uses the same allow-list (`backend/src/server.js`). If any origin is missing, browser requests/socket connections will be blocked — add it and restart the backend.

## 4. Verification checklist after the founder deploys

- [ ] Frontend deployed on Vercel with root dir `ai-fitness-coach/frontend`; `vercel.json` picked up (deploy log shows rewrites).
- [ ] Direct-load test: `/login`, `/pricing`, `/plans`, `/onboarding`, `/admin/login` all render (no 404).
- [ ] Login works end-to-end (frontend → API), so `/api` routing is correct.
- [ ] Create the real admin once with `ADMIN_BOOTSTRAP=true` (+`ADMIN_PASSWORD`) on the backend host; log in at `/admin/login`.
- [ ] Socket.IO live test across the deployed domain: open the member's Plans page, override the plan in Admin → Plan Override Studio → the member's page toasts + refreshes **without** reload. If it fails, the platform `/socket.io` proxy/`ws` forwarding is not configured (see §2).
- [ ] Chat widget answers (Gemini key enabled for `gemini-2.5-flash`).
- [ ] CORS check: no console "blocked by CORS" errors on the live domain.
- [ ] `COMING_SOON`-style gating: not used by FitVision; the SoftnoveX site flag is separate.

---

## 5. Honesty-status summary shipped in this wave (for marketing context)

- Landing/onboarding/admin copy now say "body snapshot + AI-estimated metrics"; no claims of landmark/MediaPipe processing, live biometric sync, or paid pricing remain.
- Subscription upgrade is explicitly simulated ($0, no payment processor) — visible in UI and README.
- **Real computer-vision landmark analysis is a DECISION for the founder (later):** implementing actual MediaPipe/vision landmark extraction would change onboarding metrics, Profile posture tab, and Progress photo comparison from estimates to measurements. Until then the product's claim is measurement-based estimates.
- Real-time Socket.IO is only claimed for **plan override push** (which works); habit logging is save-based, not live-pushed.

---

*Founder dashboard items above cannot be performed from the repo — no deployment is claimed as done.*
