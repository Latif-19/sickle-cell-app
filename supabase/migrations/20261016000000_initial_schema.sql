-- Migration: 20261016000000_initial_schema.sql
-- Description: Create users and quiz_scores tables with triggers and RLS policies

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    genotype TEXT NOT NULL CHECK (genotype IN ('AA', 'AS', 'SS', 'AC', 'SC', 'Unknown', 'Other')),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_genotype ON public.users(genotype);

-- Quiz Scores table
CREATE TABLE IF NOT EXISTS public.quiz_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    quiz_title TEXT NOT NULL DEFAULT 'Sickle Cell Awareness & Genotype Quiz',
    category TEXT NOT NULL DEFAULT 'General Knowledge',
    score INTEGER NOT NULL CHECK (score >= 0),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    percentage NUMERIC(5, 2) GENERATED ALWAYS AS (ROUND((score::numeric / total_questions::numeric) * 100, 2)) STORED,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_id ON public.quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_created_at ON public.quiz_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_category ON public.quiz_scores(category);

-- Trigger to create profile when auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, genotype)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'genotype',
      'Unknown'
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = CASE 
      WHEN EXCLUDED.name IS NOT NULL AND EXCLUDED.name <> '' THEN EXCLUDED.name 
      ELSE public.users.name 
    END,
    genotype = CASE 
      WHEN EXCLUDED.genotype IS NOT NULL AND EXCLUDED.genotype <> 'Unknown' THEN EXCLUDED.genotype 
      ELSE public.users.genotype 
    END,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- Policies for public.users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for public.quiz_scores
CREATE POLICY "Users can view their own quiz scores"
  ON public.quiz_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz scores"
  ON public.quiz_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz scores"
  ON public.quiz_scores FOR DELETE
  USING (auth.uid() = user_id);
