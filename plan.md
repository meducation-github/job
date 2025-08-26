# Development Plan ✅

## Phase 1: Project Setup

### Step 1: Initialize React Project

```bash

npm create vite@latest -- --template react-ts

```

### Step 2: Configure Tailwind CSS

### Step 3: Install Additional Dependencies

```bash
npm install react-router-dom
npm install @supabase/supabase-js
npm install react-hot-toast
```

## Phase 2: Supabase Setup

### Step 4: Create Supabase Project

### Step 5: Database Schema Setup

```sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- profiles table (users are managed by Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- surveys table
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  ui_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  help_text TEXT,
  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'number', 'date', 'select', 'radio', 'checkbox')),
  options JSONB, -- for select/radio/checkbox: [{"label":"Male","value":"male"},...]
  required BOOLEAN DEFAULT FALSE,
  validation JSONB, -- e.g. {"min":0,"max":120,"pattern":"^[0-9]+$"}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  answer_text TEXT, -- canonical single column for all answers
  answer_json JSONB, -- use when answer is structured (arrays/objects)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs table (optional)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  object_type TEXT,
  object_id UUID,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_questions_survey_id ON questions(survey_id);
CREATE INDEX idx_questions_ui_order ON questions(survey_id, ui_order);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_survey_id ON submissions(survey_id);
CREATE INDEX idx_answers_submission_id ON answers(submission_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
```

### Step 6: Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Surveys policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view surveys" ON surveys
  FOR SELECT USING (auth.role() = 'authenticated');

-- Questions policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view questions" ON questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Submissions policies
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own submissions" ON submissions
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can view all submissions
CREATE POLICY "Admin can view all submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'waterlily-admin@yopmail.com'
    )
  );

-- Answers policies
CREATE POLICY "Users can view answers for own submissions" ON answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = answers.submission_id
      AND submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers for own submissions" ON answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = answers.submission_id
      AND submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update answers for own submissions" ON answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = answers.submission_id
      AND submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete answers for own submissions" ON answers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = answers.submission_id
      AND submissions.user_id = auth.uid()
    )
  );

-- Admin can view all answers
CREATE POLICY "Admin can view all answers" ON answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'waterlily-admin@yopmail.com'
    )
  );

-- Audit logs policies (admin only)
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'waterlily-admin@yopmail.com'
    )
  );

CREATE POLICY "Admin can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'waterlily-admin@yopmail.com'
    )
  );
```

## Phase 3: Core Configuration

### Step 7: Supabase Client Setup

### Step 8: TypeScript Types

```js
export type Question = {
  id: string,
  survey_id: string,
  ui_order: number,
  question_text: string,
  help_text?: string | null,
  input_type: "text" | "number" | "date" | "select" | "radio" | "checkbox",
  options?: { label: string, value: string }[] | null,
  required?: boolean,
  validation?: Record<string, any> | null,
};

export type AnswerRow = {
  id?: string,
  submission_id: string,
  question_id: string,
  answer_text?: string | null,
  answer_json?: any | null,
  created_at?: string,
  updated_at?: string,
};

export type Survey = {
  id: string,
  slug: string,
  title: string,
  description?: string,
  created_by?: string,
  created_at: string,
};

export type Submission = {
  id: string,
  survey_id: string,
  user_id: string,
  status: "in_progress" | "completed",
  created_at: string,
  updated_at: string,
};

export type Profile = {
  id: string,
  full_name?: string,
  phone?: string,
  created_at: string,
};

export type UserRole = "admin" | "user";

export type User = {
  id: string,
  email: string,
  role: UserRole,
};
```

### Step 9: Environment Configuration

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Phase 4: Authentication System

### Step 10: User Hook

### Step 11: Protected Route Component

### Step 12: Sign In Page

### Step 13: Sign Up Page

## Phase 5: Survey System

### Step 14: Survey Hook

### Step 15: Question Renderer Component

### Step 16: Question Single Component

### Step 17: Progress Bar Component

## Phase 6: Survey Pages

### Step 18: Survey Page

### Step 19: Review Submission Page

## Phase 7: User Dashboard

### Step 20: Dashboard Page

### Step 21: Confirm Dialog Component

## Phase 8: Admin System

### Step 22: Admin Submission List

## Phase 9: Navigation & Layout

### Step 23: Layout Component

### Step 24: Navigation Component

## Phase 10: Routing & App Structure

### Step 25: App Component

### Step 26: Home Page

## Phase 11: Data Population

### Step 27: Sample Data

### Step 28: Database Population

## Phase 12: Testing & Polish

### Step 29: Error Handling

### Step 30: Responsive Design

### Step 31: User Experience

## Phase 13: Deployment Preparation

### Step 32: Environment Setup

### Step 33: Build & Deploy
