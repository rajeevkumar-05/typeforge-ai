# TypeForge AI ⌨️

A modern, production-ready typing practice web application built with React 19, TypeScript, TailwindCSS, Node.js, Express, and MongoDB.

![TypeForge AI](https://img.shields.io/badge/TypeForge-AI-gold?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-8-green?style=flat-square)

## Features

- ⚡ **Real-time typing engine** — Character-by-character tracking, live WPM, accuracy, cursor
- 🎮 **9 test modes** — Time (15/30/60/120s), words, custom, zen, quote, code
- 📊 **Dashboard** — Performance graphs, heatmaps, streak tracking, stats
- 🏆 **Leaderboard** — Daily, weekly, monthly, all-time rankings
- 🔒 **Authentication** — Email/password, Google OAuth, GitHub OAuth
- 🎨 **Themes** — Dark, light, high contrast + 10 accent colors
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 💾 **Cloud save** — All test results stored in MongoDB

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, TailwindCSS v4, Framer Motion |
| State | Zustand, React Query |
| Routing | React Router v7 |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, Passport.js (Google, GitHub) |

## Quick Start

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **MongoDB** running locally or [MongoDB Atlas](https://www.mongodb.com/atlas) URI

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install
cp .env.example .env

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/typeforge
JWT_SECRET=your-secret-key-change-this
CLIENT_URL=http://localhost:5173
```

### 3. Start Development

```bash
# Terminal 1 — Start backend
cd backend
npm run dev

# Terminal 2 — Start frontend
cd frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

## Project Structure

```
typing_test/
├── frontend/                    # React 19 + TypeScript + TailwindCSS
│   └── src/
│       ├── components/          # Reusable UI components
│       │   ├── auth/            # ProtectedRoute
│       │   ├── layout/          # Navbar, Footer, Layout
│       │   ├── typing/          # TypingEngine, Display, Stats, Results
│       │   └── ui/              # Button, Input, Modal, Toast, Card
│       ├── data/                # Words, quotes, code snippets
│       ├── hooks/               # useTypingEngine, useAuth, useTimer, etc.
│       ├── lib/                 # Axios, utils, constants
│       ├── pages/               # 10 pages
│       ├── services/            # API service modules
│       ├── store/               # Zustand stores
│       └── types/               # TypeScript interfaces
├── backend/                     # Express + TypeScript + MongoDB
│   └── src/
│       ├── config/              # DB, Passport
│       ├── controllers/         # Request handlers
│       ├── middleware/           # Auth, error handler, validation
│       ├── models/              # Mongoose schemas
│       ├── routes/              # Express routes
│       ├── services/            # Business logic
│       ├── utils/               # JWT, email, helpers
│       └── validators/          # Input validation
└── README.md
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email |
| POST | `/api/auth/login` | Login with email |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/github` | GitHub OAuth |

### Tests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tests` | Save test result |
| GET | `/api/tests` | Get user's tests (paginated) |
| GET | `/api/tests/stats` | Get dashboard stats |
| GET | `/api/tests/:id` | Get test by ID |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/preferences` | Update preferences |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard?period=alltime` | Get leaderboard |

## OAuth Setup (Optional)

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Set redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:5000/api/auth/github/callback`
4. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Restart test |
| `Ctrl + Backspace` | Delete previous word |

## License

MIT
