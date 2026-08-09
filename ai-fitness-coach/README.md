# FitVision AI · AI Fitness Coach

An AI-powered fitness & nutrition platform. Users complete a 4-angle body
photo analysis (MediaPipe pose estimation), receive a personalized Gemini-driven
diet + workout plan, and track daily habits — with a full admin governance
console for moderation, user & plan management.

> Light, gradient-free ocean-blue UI · React 19 + Vite + Tailwind v4 frontend ·
> Express + Mongoose backend (in-memory fallback when MongoDB is offline).

---

## Quick Start

### 1. Backend (`/backend`)

```bash
cd backend
cp .env.example .env      # then fill in MONGO_URI / GEMINI_API_KEY / JWT_SECRET
npm install
npm run dev               # http://localhost:5000 · health: /api/health
```

MongoDB is **optional**. Without it the API auto-falls back to an in-memory
store seeded with two demo accounts, so the whole app works with zero infra.

### 2. Frontend (`/frontend`)

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000 (proxies /api → :5000)
```

---

## Demo Accounts

| Role  | Email              | Password     |
|-------|--------------------|--------------|
| User  | `user@fitvision.ai`| `password123` |
| Admin | `admin@fitvision.ai`| `password123` |

Admins land at the **Admin Control Panel** (`/admin`). Member area at `/dashboard`.

---

## Tech Highlights

- **AI Plans & Coach** — Gemini 1.5 generates diet/workout plans; the chat coach
  is RAG-based and references the user's real plan, allergies, macros & streak
  (system prompt is editable from the admin **AI Output & Prompt Monitor**).
- **Vision Analysis** — 4-angle body-posture analysis via MediaPipe-style pipeline.
- **RBAC** — JWT auth, `verifyJWT` re-fetches the user per request & blocks banned
  accounts; every admin route gated by `checkRole('admin')`. Public registration
  can never self-assign admin.
- **Moderation** — AI chat query flagging + body-image review console.
- **Live admin analytics** — user growth, plan generation, audit logs.

## Security Notes

- Passwords hashed with bcrypt (Mongoose `pre('save')`).
- Inputs validated with **zod** on register/login/plan-override; body whitelisted
  (no mass-assignment of `role`).
- `helmet` + allow-list CORS + express-rate-limit on auth/chat/plan routes.

## Project Structure

```
frontend/src/pages        Landing, Login, Signup, Onboarding, Dashboard, Plans,
                          Progress + admin/* (6 admin panels)
frontend/src/components   Navbar, Sidebar, ChatWidget
backend/src/routes        auth · user · plan · progress · chat · admin
backend/src/controllers   one per route module
backend/src/services      planGenerator, ragChat, vision, store (in-memory fallback)
backend/src/models        User, Plan, Progress, ChatLog, AdminLog, Settings
```