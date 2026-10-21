# SickleCell Care — Full-Stack Application

A modern, full-stack application for Sickle Cell awareness, genotype management, and educational assessments, powered by **React (TypeScript + Vite)** on the frontend and **Supabase** (PostgreSQL, Auth, and Row Level Security) on the backend.

---

## 📁 Project Architecture & Directory Structure

```text
sickle-cell-app/
├── frontend/                     # React + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/           # UI Components
│   │   │   ├── Navbar.tsx        # Navigation & Auth state indicator
│   │   │   ├── ConfigBanner.tsx  # Dynamic Supabase connection indicator & guide
│   │   │   ├── AuthModal.tsx     # Sign In & Sign Up with genotype selection
│   │   │   ├── UserProfile.tsx   # Profile & genotype management
│   │   │   ├── QuizCard.tsx      # Interactive Sickle Cell test with score calculation
│   │   │   ├── QuizHistory.tsx   # Quiz score log & statistics from Quiz_Scores table
│   │   │   └── GenotypeInfo.tsx  # Genotype guide & interactive compatibility matcher
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Supabase Auth provider (session, profile, signup, login)
│   │   ├── data/
│   │   │   └── sampleQuestions.ts# Curated sickle cell & genetics quiz questions
│   │   ├── lib/
│   │   │   └── supabase.ts       # Supabase client setup & configuration detection
│   │   ├── types/
│   │   │   └── database.ts       # TypeScript types matching Supabase schema
│   │   ├── App.tsx               # Root application shell
│   │   ├── index.css             # Healthcare UI theme & responsive styling
│   │   └── main.tsx              # React DOM entry point
│   ├── .env.example              # Environment variables template
│   └── package.json
│
├── backend/                      # Node.js / Express backend service layer
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js       # Server-side Supabase client (Anon & Service Role)
│   │   ├── services/
│   │   │   ├── userService.js    # Profile & genotype queries/updates
│   │   │   └── quizService.js    # Quiz score persistence & leaderboard logic
│   │   └── index.js              # Express REST API endpoints & health check
│   ├── .env.example              # Backend environment template
│   └── package.json
│
├── supabase/                     # Supabase database configuration & migrations
│   ├── schema.sql                # Complete SQL DDL (Users, Quiz_Scores, RLS, Triggers)
│   ├── migrations/
│   │   └── 20261016000000_initial_schema.sql
│   ├── seed.sql                  # Seed data
│   └── README.md                 # Supabase setup guide
│
├── package.json                  # Root scripts to run frontend and backend
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

The database schema is defined in [`supabase/schema.sql`](./supabase/schema.sql) and [`supabase/migrations/20261016000000_initial_schema.sql`](./supabase/migrations/20261016000000_initial_schema.sql).

### 1. `Users` Table (`public.users`)
Stores user identity, profile, and hemoglobin genotype:
- `id` (`UUID`, Primary Key, references `auth.users(id)` with `ON DELETE CASCADE`)
- `email` (`TEXT`, Unique, Not Null)
- `name` (`TEXT`, Not Null)
- `genotype` (`TEXT`, Check constraint: `'AA' | 'AS' | 'SS' | 'AC' | 'SC' | 'Unknown' | 'Other'`)
- `avatar_url` (`TEXT`)
- `bio` (`TEXT`)
- `created_at` (`TIMESTAMPTZ`, Default `now()`)
- `updated_at` (`TIMESTAMPTZ`, Default `now()`)

### 2. `Quiz_Scores` Table (`public.quiz_scores`)
Stores completed quiz results:
- `id` (`UUID`, Primary Key, Default `gen_random_uuid()`)
- `user_id` (`UUID`, Foreign Key referencing `public.users(id)` with `ON DELETE CASCADE`)
- `quiz_title` (`TEXT`, Not Null)
- `category` (`TEXT`, Not Null)
- `score` (`INTEGER`, Not Null)
- `total_questions` (`INTEGER`, Not Null)
- `percentage` (`NUMERIC(5,2)`, Generated: `(score / total_questions) * 100`)
- `feedback` (`TEXT`)
- `created_at` (`TIMESTAMPTZ`, Default `now()`)

### 3. Supabase Features Configured
- **Automatic Profile Trigger**: An `AFTER INSERT ON auth.users` trigger (`handle_new_user`) automatically populates `public.users` with the user's name and genotype whenever they register.
- **Row Level Security (RLS)**: Enforces that users can only view, create, and modify their own records.
- **Performance Indexes**: Indexes on `users(email)`, `users(genotype)`, `quiz_scores(user_id)`, and `quiz_scores(created_at)`.

---

## 🚀 Quick Start Guide

### 1. Setup Supabase
1. Create a project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
4. Retrieve your **Project URL** and **anon public key** from *Project Settings* -> *API*.

### 2. Configure Environment Variables
Copy the `.env.example` files:
```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```
Update `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Run the Frontend
```bash
npm run dev:frontend
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. (Optional) Run the Backend Server
```bash
npm run dev:backend
```
The Express API runs at [http://localhost:5000](http://localhost:5000) with endpoints:
- `GET /api/health`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `POST /api/quiz/scores`
- `GET /api/quiz/scores/user/:userId`
- `GET /api/quiz/leaderboard`
