# Supabase Configuration & Database Schema

This directory contains the database schema, migration scripts, and seed configurations for the **Sickle Cell Awareness & Genotype Management Application**.

---

## 🗄️ Database Schema Overview

The database is built on PostgreSQL hosted via **Supabase**, leveraging Supabase's native authentication (`auth.users`) and Row Level Security (RLS).

### 1. `Users` Table (`public.users`)
Stores profile and genetic information for each user.
* Linked to `auth.users(id)` via foreign key with `ON DELETE CASCADE`.
* Automatically populated when a user registers via Supabase Auth trigger `handle_new_user()`.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | References `auth.users.id` |
| `email` | `TEXT` (Unique) | User's email address |
| `name` | `TEXT` | User's full name |
| `genotype` | `TEXT` | Hemoglobin genotype: `AA`, `AS`, `SS`, `AC`, `SC`, `Unknown`, `Other` |
| `avatar_url` | `TEXT` | Optional profile image link |
| `bio` | `TEXT` | Optional personal notes |
| `created_at` | `TIMESTAMPTZ` | Timestamp when user joined |
| `updated_at` | `TIMESTAMPTZ` | Timestamp when profile was last updated |

### 2. `Quiz_Scores` Table (`public.quiz_scores`)
Stores educational quiz results and progress for each user.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Auto-generated UUID |
| `user_id` | `UUID` (FK) | References `public.users.id` |
| `quiz_title` | `TEXT` | Name of the quiz taken |
| `category` | `TEXT` | Category (e.g. *Genetics*, *Crisis Management*) |
| `score` | `INTEGER` | Number of correct answers |
| `total_questions` | `INTEGER` | Total questions attempted |
| `percentage` | `NUMERIC(5,2)` | Generated column: `(score / total_questions) * 100` |
| `feedback` | `TEXT` | Educational recommendations based on score |
| `created_at` | `TIMESTAMPTZ` | Timestamp when quiz was completed |

---

## 🔒 Row Level Security (RLS) Policies

1. **`public.users`**:
   - `SELECT`: Only the authenticated user (`auth.uid() = id`) can read their own profile.
   - `INSERT`: Users can only insert their own profile row.
   - `UPDATE`: Users can update only their own profile row.
2. **`public.quiz_scores`**:
   - `SELECT`: Users can view their own quiz history.
   - `INSERT`: Users can submit their own quiz results.
   - `DELETE`: Users can delete their own quiz attempts.

---

## 🚀 Setting up in Supabase Dashboard

1. **Create a Supabase Project**:
   - Go to [database.new](https://database.new) and create a new project.
2. **Apply the Schema**:
   - Navigate to the **SQL Editor** tab in your Supabase project dashboard.
   - Open and copy the contents of [`supabase/schema.sql`](./schema.sql).
   - Click **Run** to execute the DDL script, create the tables, trigger, and RLS policies.
3. **Get API Credentials**:
   - Navigate to **Project Settings** -> **API**.
   - Copy the **Project URL** (`SUPABASE_URL`).
   - Copy the **anon / public** key (`SUPABASE_ANON_KEY`).
   - Add these credentials to `frontend/.env` and `backend/.env`.
