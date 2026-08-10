<div align="center">

<img src="https://img.shields.io/badge/FitVision%20AI-AI%20Fitness%20Coach-6366f1?style=for-the-badge&logo=openai&logoColor=white" alt="FitVision AI" />

# 🏋️ FitVision AI

### *The AI-Powered Fitness & Nutrition Intelligence Platform*

[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com)

<br/>

> **FitVision AI** is not just another fitness app.  
> It is a full-stack, production-grade AI fitness intelligence platform that uses **Google Gemini AI**, **computer vision body analysis**, **RAG-powered coaching**, and a **complete admin governance suite** — all in one product.

<br/>

[🚀 Live Demo](https://fitness-coach-ai-six.vercel.app/) &nbsp;|&nbsp; [🔐 Admin Panel](#admin-panel) &nbsp;|&nbsp; [📖 Docs](#getting-started) &nbsp;|&nbsp; [🛠️ Tech Stack](#tech-stack)

</div>

---

## ✨ What Makes FitVision AI Different?

Most fitness apps give you static plans written by a nutritionist once. **FitVision AI** does this:

- 📸 **Scans your body** using 4-angle posture photo upload and computer vision
- 🤖 **Generates a fully personalized** diet + workout plan using **Google Gemini AI** — every plan is unique to your body metrics, allergies, goals, and workout preference
- 💬 **Coaches you in real-time** via an AI chat assistant that is RAG-grounded on *your actual plan* — not generic fitness advice
- 📊 **Tracks your progress** daily with streaks, fitness scores, water intake, sleep, and meal completion
- 👑 **Admin control center** — a full governance console with live analytics, user moderation, AI prompt tuning, and plan override
- 💳 **Subscription tiers** — Free, Pro ($14.99/mo), and Elite VIP ($29.99/mo) with real upgrade flow

---

## 🎯 Core Features

### 🧬 For Users

| Feature | Description |
|---|---|
| **AI Onboarding** | 4-angle posture photo upload (Front, Back, Left, Right) with live preview |
| **AI Plan Generation** | Google Gemini generates a personalized diet & workout plan based on your body, goals, and allergies |
| **RAG-Powered AI Coach** | Chat with an AI coach grounded in your real plan, macros, streak, and health history |
| **Daily Progress Tracker** | Log meals, water intake (ml), sleep hours, and workout completion |
| **Streak & Fitness Score** | Gamified streak system and dynamic fitness score (0–100) |
| **Subscription Model** | 3-tier membership — Starter Free, Pro Coach, Elite VIP — with monthly/annual billing |
| **Plan Regeneration** | Instantly regenerate AI plan if you want a fresh approach |
| **Responsive Design** | Fully responsive across desktop, tablet, and mobile |

### 🛡️ Admin Control Panel (`/admin`)

| Feature | Description |
|---|---|
| **Live Analytics Dashboard** | Real-time KPI cards: Total Users, Active Plans, Avg. Fitness Score, Monthly Revenue + Recharts graphs |
| **User Management** | Full searchable/filterable user directory — instant Ban/Unban, role badges, profile modals |
| **AI Output Monitor** | Inspect every AI-generated plan, flag low-quality outputs, and live-edit the Gemini System Prompt Template |
| **Plan Override Studio** | Manually override any user's plan: set custom calories, macros, workout split — push via Socket.IO |
| **Content Moderation** | Review flagged AI chat queries + approve/reject 4-angle body photos |
| **System Audit Log** | Timestamped log of every admin action |
| **Dedicated Admin Login** | Separate admin portal at `/admin/login` — role-enforced, blocks regular users |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI framework |
| **Vite 6** | Lightning-fast dev server and build tool |
| **TailwindCSS v4** | Utility-first CSS with glassmorphism design system |
| **Framer Motion** | Smooth page transitions and micro-animations |
| **Recharts** | Interactive analytics charts in the admin dashboard |
| **React Router v6** | Client-side routing with protected routes |
| **Axios** | HTTP client with interceptors for JWT auth |
| **Lucide React** | Icon library |
| **React Hot Toast** | Notification system |
| **Socket.IO Client** | Real-time plan push from admin to user |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Primary database with full schema validation |
| **Google Gemini AI** | AI plan generation and RAG chat responses |
| **JWT (jsonwebtoken)** | Stateless authentication with role claims |
| **bcryptjs** | Password hashing (Mongoose pre-save hook) |
| **Socket.IO** | Real-time bidirectional communication |
| **Zod** | Runtime schema validation on all inputs |
| **Helmet** | Security HTTP headers |
| **Express Rate Limit** | DDoS + brute-force protection on auth/chat/plan routes |
| **CORS** | Allowlist-based cross-origin policy |
| **Dotenv** | Environment configuration |

### Infrastructure
| Service | Role |
|---|---|
| **Vercel** | Frontend hosting (CDN-distributed, auto-deploy from GitHub) |
| **Render** | Backend hosting (persistent Node.js server) |
| **MongoDB Atlas** | Cloud-hosted MongoDB cluster |
| **GitHub** | Version control + CI/CD pipeline |

---

## 🔐 Security Architecture

- **Role-Based Access Control (RBAC)** — JWT tokens carry role claims; every admin route is gated behind `verifyJWT` + `checkRole('admin')` middleware
- **Password Security** — bcrypt hashing via Mongoose `pre('save')` hook; passwords never stored in plaintext
- **No Role Escalation** — Public registration API enforces `role: 'user'`; admin accounts are provisioned via seed script only
- **Input Validation** — Zod validates every registration, login, and plan-override request body; no mass-assignment of sensitive fields
- **Rate Limiting** — `express-rate-limit` applied on `/auth`, `/chat`, and `/plan/regenerate` routes
- **Helmet** — Strict HTTP security headers on all responses
- **CORS Allowlist** — Only whitelisted origins (Vercel domain) can make cross-origin requests

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/Muneeb1024/fitness-coach-ai.git
cd fitness-coach-ai
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGINS=http://localhost:3000
PORT=5000
```

```bash
npm install
npm run dev        # Starts on http://localhost:5000
```

> 💡 **Zero-infra mode:** MongoDB is optional. Without it, the API auto-falls back to a seeded in-memory store — the full app works with no database at all.

### 3. Seed Demo Accounts (Production / First-time Setup)

```bash
npm run seed
```

This creates `admin@fitvision.ai` and `user@fitvision.ai` in your MongoDB database with properly hashed passwords.

### 4. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev        # Starts on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| 👤 **User** | `user@fitvision.ai` | `password123` | `/dashboard` |
| 🛡️ **Admin** | `admin@fitvision.ai` | `password123` | `/admin` |

> Admin panel is accessed via **`/admin/login`** — it is intentionally separated from the regular login flow.

---

## 📁 Project Structure

```
fitness-coach-ai/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx          # Hero landing page
│       │   ├── Login.jsx            # User sign-in with quick demo fill
│       │   ├── Signup.jsx           # User registration
│       │   ├── Onboarding.jsx       # 4-angle photo upload + body metrics
│       │   ├── Dashboard.jsx        # Main user dashboard
│       │   ├── Plans.jsx            # AI-generated plan view
│       │   ├── Progress.jsx         # Daily progress tracker
│       │   ├── Subscription.jsx     # Pricing & tier upgrade
│       │   └── admin/
│       │       ├── AdminLogin.jsx   # Dedicated admin authentication
│       │       ├── AdminDashboard.jsx  # Live KPIs + Recharts analytics
│       │       ├── UserManagement.jsx  # User directory + ban/unban
│       │       ├── AIMonitor.jsx    # Plan inspector + prompt editor
│       │       ├── PlanOverride.jsx # Manual plan override + Socket push
│       │       └── Moderation.jsx   # Chat flags + photo review
│       └── components/
│           ├── Navbar.jsx           # Top nav with tier badge
│           ├── Sidebar.jsx          # Admin sidebar
│           └── ChatWidget.jsx       # Floating AI coach chat
│
└── backend/
    └── src/
        ├── controllers/
        │   ├── authController.js    # Register / Login / GetMe
        │   ├── userController.js    # Profile, onboarding, body metrics
        │   ├── planController.js    # AI plan generation + regeneration
        │   ├── progressController.js # Daily log CRUD
        │   ├── chatController.js    # RAG chat with Gemini
        │   ├── adminController.js   # Full admin CRUD
        │   └── subscriptionController.js # Tier status + upgrade
        ├── models/
        │   ├── User.js              # User schema with subscription
        │   ├── Plan.js              # AI-generated plan schema
        │   ├── Progress.js          # Daily progress log
        │   ├── ChatLog.js           # Chat history
        │   └── AdminLog.js          # Admin audit trail
        ├── services/
        │   ├── planGeneratorService.js # Gemini plan generation logic
        │   ├── ragChatService.js    # RAG + Gemini chat logic
        │   ├── visionService.js     # Body posture analysis
        │   └── store.js             # In-memory fallback store
        ├── middleware/
        │   ├── verifyJWT.js         # JWT auth + user re-fetch
        │   ├── checkRole.js         # RBAC role enforcement
        │   └── rateLimiter.js       # Rate limiting config
        └── seed.js                  # Production database seeder
```

---

## 🗺️ Roadmap — What's Coming Next

- [ ] **Real-time AI Vision Analysis** — Live webcam-based posture analysis using MediaPipe running in-browser
- [ ] **Push Notifications** — Daily reminders for water, meals, and workouts via web push
- [ ] **Wearable Integration** — Sync with Apple Health, Google Fit, and Fitbit APIs
- [ ] **Social Features** — Community leaderboards, challenge groups, progress sharing
- [ ] **Multi-language Support** — Urdu, Arabic, French localization
- [ ] **Mobile App (React Native)** — iOS + Android using shared API
- [ ] **Advanced Analytics** — Body composition tracking over time, trend analysis
- [ ] **Meal Photo Logging** — Snap a meal photo; AI identifies calories and macros automatically
- [ ] **Video Exercise Library** — Exercise demo videos with form tips per workout day
- [ ] **Email Automation** — Weekly progress reports, streak reminders, renewal notices

---

## 👨‍💻 Built By

<div align="center">

**FitVision AI** was built as part of the **SMIT Hackathon** — a showcase of production-ready full-stack AI development.

---

*If this project impressed you, give it a ⭐ on GitHub!*

</div>
