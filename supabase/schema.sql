-- ==============================================================================
-- SICKLE CELL APP - INITIAL DATABASE SCHEMA & RBAC EXTENSION
-- ==============================================================================
-- Tables:
--  1. Users (public.users) - Stores user profile, email, full name, genotype, role ('user' | 'professional')
--  2. Quiz_Scores (public.quiz_scores) - Stores quiz attempt results per user
--  3. Inquiries (public.inquiries) - Stores clinical inquiries and responses between patients and professionals
--
-- Features:
--  - Linked to Supabase Auth (auth.users)
--  - Role-Based Access Control (RBAC): 'user' (patients) and 'professional' (clinicians)
--  - Row Level Security (RLS) policies for user data privacy and clinical access
--  - Automatic profile creation trigger on signup (persisting name, genotype, role)
--  - Indexes for performance optimization
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    genotype TEXT NOT NULL CHECK (genotype IN ('AA', 'AS', 'SS', 'AC', 'SC', 'Unknown', 'Other')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'professional')),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MIGRATION NOTE FOR EXISTING DATABASES:
-- If public.users already exists without role, run:
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'professional'));

-- Comments for documentation
COMMENT ON TABLE public.users IS 'Profile table storing sickle cell app user details';
COMMENT ON COLUMN public.users.genotype IS 'Hemoglobin genotype (AA, AS: trait carrier, SS: sickle cell disease, AC, SC, etc.)';
COMMENT ON COLUMN public.users.role IS 'User permission role: user (default patient) or professional (licensed clinician)';

-- Indexes for Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_genotype ON public.users(genotype);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ------------------------------------------------------------------------------
-- 2. QUIZ_SCORES TABLE
-- ------------------------------------------------------------------------------
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

-- Comments for documentation
COMMENT ON TABLE public.quiz_scores IS 'Tracks user scores and progress on sickle cell educational quizzes';
COMMENT ON COLUMN public.quiz_scores.score IS 'Number of correct answers';
COMMENT ON COLUMN public.quiz_scores.total_questions IS 'Total number of questions in quiz attempt';
COMMENT ON COLUMN public.quiz_scores.percentage IS 'Calculated score percentage';

-- Indexes for Quiz Scores
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_id ON public.quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_created_at ON public.quiz_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_category ON public.quiz_scores(category);

-- ------------------------------------------------------------------------------
-- 3. INQUIRIES TABLE (Patient-Professional Clinical Communications)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    patient_genotype TEXT NOT NULL CHECK (patient_genotype IN ('AA', 'AS', 'SS', 'AC', 'SC', 'Unknown', 'Other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'responded', 'closed')),
    response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments for documentation
COMMENT ON TABLE public.inquiries IS 'Stores clinical messages and inquiries between patients and health professionals';
COMMENT ON COLUMN public.inquiries.user_id IS 'Foreign key to public.users of the patient initiating the inquiry';
COMMENT ON COLUMN public.inquiries.professional_id IS 'Foreign key to public.users of the clinician handling the inquiry';
COMMENT ON COLUMN public.inquiries.status IS 'Lifecycle state: pending, in_review, responded, closed';

-- Indexes for Inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_professional_id ON public.inquiries(professional_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. AUTOMATIC PROFILE CREATION TRIGGER
-- ------------------------------------------------------------------------------
-- Automatically creates a public.users row when a user signs up through Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, genotype, role)
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
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'role',
      'user'
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
    role = CASE 
      WHEN EXCLUDED.role IS NOT NULL THEN EXCLUDED.role 
      ELSE public.users.role 
    END,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is a professional (SECURITY DEFINER prevents recursion)
CREATE OR REPLACE FUNCTION public.is_professional()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'professional'
  );
$$;

-- 5.1 Policies for public.users
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Clinicians can view user profiles to contextualize patient inquiries
CREATE POLICY "Professionals can view patient profiles"
  ON public.users
  FOR SELECT
  USING (public.is_professional());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5.2 Policies for public.quiz_scores
-- Users can view their own quiz attempts
CREATE POLICY "Users can view their own quiz scores"
  ON public.quiz_scores
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can submit their own quiz scores
CREATE POLICY "Users can insert their own quiz scores"
  ON public.quiz_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own quiz scores if desired
CREATE POLICY "Users can delete their own quiz scores"
  ON public.quiz_scores
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5.3 Policies for public.inquiries
-- Patients can view their own inquiries
CREATE POLICY "Patients can view their own inquiries"
  ON public.inquiries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Health professionals can view all incoming patient inquiries
CREATE POLICY "Professionals can view all inquiries"
  ON public.inquiries
  FOR SELECT
  USING (public.is_professional());

-- Patients can submit new clinical inquiries
CREATE POLICY "Patients can insert inquiries"
  ON public.inquiries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Health professionals can update inquiries (to respond, update status, assign themselves)
CREATE POLICY "Professionals can update inquiries"
  ON public.inquiries
  FOR UPDATE
  USING (public.is_professional())
  WITH CHECK (public.is_professional());

-- Patients can update their own inquiries while still pending
CREATE POLICY "Patients can update pending inquiries"
  ON public.inquiries
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- 5.4 Optional: Anonymized leaderboard view
CREATE OR REPLACE VIEW public.quiz_leaderboard AS
  SELECT 
    q.id,
    u.name AS user_name,
    q.quiz_title,
    q.score,
    q.total_questions,
    q.percentage,
    q.created_at
  FROM public.quiz_scores q
  JOIN public.users u ON q.user_id = u.id
  ORDER BY q.percentage DESC, q.created_at DESC;
