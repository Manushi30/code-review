# CodeReview AI — Automated Student Programming Assistant

AI-powered code review platform for students. Submit Python, Java, or C++ code and receive structured feedback from **Google Gemini**, with scores, issue breakdowns, improved code, progress tracking, and a leaderboard.

## Features

- **JWT authentication** — sign up, login, profile, change password, delete account
- **Monaco code editor** — syntax highlighting, dark theme, file upload (.py, .java, .cpp)
- **Gemini AI review** — logic, syntax, quality, performance, best practices, beginner explanations
- **Dashboard** — stats, recent reviews, learning insights
- **Review history** — search, filter, PDF report download
- **Weekly progress** — reviews per week, scores, languages practiced
- **Leaderboard** — rank by average score and review count
- **Dark / light mode** — brown & beige theme preserved

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Framer Motion, Monaco Editor |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| AI | Google Gemini API |
| Deploy | GCP Cloud Run, Cloud SQL, Secret Manager |

## Color Palette

- Brown `#6F4E37`
- Beige `#F5F0E6`
- Light Beige `#E8DCCB`
- White `#FFFFFF`

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- [Gemini API key](https://aistudio.google.com/apikey)

### 1. Database

```bash
createdb codereview_ai
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npm install
npm run db:init
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — API proxied to http://localhost:3000

## Project Structure

```
code-review-ai/
├── backend/
│   ├── routes/          # auth, reviews, users, stats, leaderboard
│   ├── services/        # Gemini, stats, PDF
│   ├── database/        # schema.sql
│   └── scripts/initDb.js
├── frontend/
│   └── src/
│       ├── pages/       # Dashboard, CodeReview, History, etc.
│       └── context/     # Auth, Theme
└── deploy/              # GCP Cloud Build & guide
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/reviews/analyze` | Run Gemini review |
| GET | `/api/reviews` | History (search/filter) |
| GET | `/api/reviews/:id/pdf` | Download PDF report |
| GET | `/api/stats/dashboard` | Dashboard stats |
| GET | `/api/stats/weekly` | Weekly progress |
| GET | `/api/leaderboard` | Top students |

## GCP Deployment

See [deploy/GCP.md](deploy/GCP.md) for Cloud Run, Cloud SQL, Secret Manager, and monitoring setup.

## License

MIT — built for student hackathons and learning.
"# project-intelliai" 
"# project-intelliai" 
