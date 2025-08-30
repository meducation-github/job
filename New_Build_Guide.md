# Survey Intake App - Feature-Driven Build Guide

## 🎬 Video Script: Introduction

Hey guys! I hope you are doing great. I will be building the survey intake application in this video. This project would let user create their account with email, verify their account, login, take a survey of detailed questions, submit it and then afterwards can view the submitted survey, edit it or even delete it as well. For admin they would be able to login with their admin email and would be able to see all users and all of their surveys they have took in detail. Some great to have features that I will include for users will be auto save of the survey form at any step and progress tracking of their survey form.

For the tech stack, I will be using React with TypeScript for type safety, Vite for lightning-fast development, Tailwind CSS for beautiful styling, and Supabase as our backend - which gives us a PostgreSQL database, authentication, and real-time features all in one package. I have chosen supabase as our backend because I will be able to show you a live demo after it is done, as in I will share a link where you would be able to use this project as a user or as an admin. I won't need to host a separate backend for APIs and database. I think for a small project like this where we need to just collect some user data and there are simple CRUD operations a good logical decision to use something that will make the product or project release super fast and at the same time reliable with less bugs as you are not coding up everything from scratch which would require maintinance, more work and susptible to more bugs. Non the less, to show you my backend nodejs work I will be creating an edge function hosting it on supabase which will be like a mock or simple version of the machine learning model API that would predict person's long-term care needs and costs.

Final note before we start with the development is that I have setup a few things ahead like table schema and some usual style or markup stuff just to make things a bit faster, this would only take more time and won't show you my actual development skills and approach.But I will be showing everything from start to finish, not skipping over things, or not recording so you could see every aspect of the development. I also have a plan file for different steps or phases of development where we could see the development process from a bit of top to get idea of where we are and where we are heading. Before taking more of your time let's get started.

---

## Development Approach

This guide follows a **feature-driven development approach** where each step:

- Builds a complete, working feature
- Can be demonstrated immediately after completion
- Provides immediate value to users
- Follows a natural development flow

Each feature step will result in a working, testable application that you can show in your video.

---

## Phase 1: Foundation Setup

**🎬 Phase Overview:** Let's start with the essential foundation - setting up our React app, configuring Tailwind CSS, and establishing our Supabase backend. This gives us a solid base to build upon.

### Step 1: Project Initialization & Styling

**🎬 Step Script:** "First, let's create our React app with Vite and set up Tailwind CSS for beautiful styling. This gives us a modern, fast development environment with great styling capabilities."

**Commands to run:**

```bash
# Create new Vite project with React + TypeScript
npm create vite@latest survey-intake-app -- --template react-ts

# Navigate to project directory
cd survey-intake-app

# Install base dependencies
npm install

# Install Tailwind CSS and its dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind CSS
npx tailwindcss init -p

# Install additional dependencies
npm install react-router-dom @supabase/supabase-js react-hot-toast

# Start development server
npm run dev
```

**Files to create/modify:**

1. **`tailwind.config.js`** - Tailwind configuration

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        "var(--max-width)": "var(--max-width)",
      },
    },
  },
  plugins: [],
};
```

2. **`src/index.css`** - Global styles and Tailwind imports

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --max-width: 1200px;
}

@layer components {
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }

  .btn-primary {
    @apply px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors;
  }

  .btn-ghost {
    @apply px-4 py-2 text-gray-600 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors;
  }
}
```

3. **`src/App.tsx`** - Basic app structure

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-var(--max-width) mx-auto p-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Survey Intake App
          </h1>
          <div className="card">
            <p className="text-gray-600">
              Welcome to our survey intake application! This is where users will
              be able to take surveys and get AI-powered assessments.
            </p>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
```

**What we'll accomplish:**

- Create React + TypeScript project with Vite
- Configure Tailwind CSS with custom components
- Set up basic project structure
- Create a simple landing page to demonstrate styling

**Result:** A beautiful, styled React application ready for features

### Step 2: Supabase Backend Setup

**🎬 Step Script:** "Now let's set up our Supabase backend. This includes creating our database tables, setting up security policies, and configuring our project. This is where our data will live."

**Supabase Setup:**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down your project URL and anon key

**Database Schema - Create `database-schema.sql`:**

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

-- assessments table (NEW - for AI-generated care plans)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  care_plan JSONB NOT NULL, -- structured care plan data
  cost_estimate JSONB NOT NULL, -- cost breakdown data
  ai_model_used TEXT DEFAULT 'gpt-5',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX idx_assessments_submission_id ON assessments(submission_id);
```

**Row Level Security (RLS) - Create `rls-policies.sql`:**

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
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

-- Assessments policies
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = assessments.submission_id
      AND submissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own assessments" ON assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = assessments.submission_id
      AND submissions.user_id = auth.uid()
    )
  );

-- Admin can view all assessments
CREATE POLICY "Admin can view all assessments" ON assessments
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

**What we'll accomplish:**

- Create Supabase project
- Set up database schema (profiles, surveys, questions, submissions, answers, assessments)
- Configure Row Level Security (RLS) policies
- Add assessment table for AI-generated care plans

**Result:** Complete backend infrastructure ready for data

### Step 3: Core Configuration & Types

**🎬 Step Script:** "Let's connect our frontend to our backend by setting up the Supabase client, defining our TypeScript types, and configuring environment variables."

**Environment Setup:**

1. Create `.env.local` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Create `.env.example` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Files to create:**

1. **`src/lib/supabase.ts`** - Supabase client configuration

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);
    if (error) throw error;
    console.log("✅ Supabase connection successful");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection failed:", error);
    return false;
  }
};
```

2. **`src/types.ts`** - TypeScript type definitions

```typescript
// Database types
export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Survey {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  survey_id: string;
  ui_order: number;
  question_text: string;
  help_text: string | null;
  input_type: "text" | "number" | "date" | "select" | "radio" | "checkbox";
  options: QuestionOption[] | null;
  required: boolean;
  validation: ValidationRules | null;
  created_at: string;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
}

export interface Submission {
  id: string;
  survey_id: string;
  user_id: string;
  status: "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  submission_id: string;
  question_id: string;
  answer_text: string | null;
  answer_json: any | null;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  submission_id: string;
  care_plan: CarePlan;
  cost_estimate: CostEstimate;
  ai_model_used: string;
  generated_at: string;
  created_at: string;
}

export interface CarePlan {
  summary: string;
  recommendations: string[];
  care_level: "independent" | "assisted" | "skilled" | "memory_care";
  services_needed: string[];
  frequency: string;
  estimated_duration: string;
}

export interface CostEstimate {
  monthly_cost: number;
  annual_cost: number;
  breakdown: {
    service: string;
    cost: number;
    frequency: string;
  }[];
  total_range: {
    min: number;
    max: number;
  };
}

// User roles
export type UserRole = "user" | "admin";

// Form types
export interface SurveyFormData {
  [questionId: string]: string | number | string[] | null;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Component props
export interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}
```

3. **`src/App.tsx`** - Update with connection test

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { testConnection } from "./lib/supabase";
import "./App.css";

function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testConnection();
      setIsConnected(connected);
    };
    checkConnection();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-var(--max-width) mx-auto p-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Survey Intake App
          </h1>

          {/* Connection Status */}
          <div className="mb-6">
            {isConnected === null && (
              <div className="text-blue-600">
                Testing database connection...
              </div>
            )}
            {isConnected === true && (
              <div className="text-green-600 font-medium">
                ✅ Connected to Supabase
              </div>
            )}
            {isConnected === false && (
              <div className="text-red-600 font-medium">
                ❌ Database connection failed
              </div>
            )}
          </div>

          <div className="card">
            <p className="text-gray-600">
              Welcome to our survey intake application! This is where users will
              be able to take surveys and get AI-powered assessments.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Authentication system</li>
                <li>• Survey taking interface</li>
                <li>• AI-powered assessments</li>
                <li>• User dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
```

**Commands to run:**

```bash
# Test the application
npm run dev

# Check if everything is working
# - Visit http://localhost:5173
# - Check browser console for connection status
# - Verify Tailwind styles are applied
```

**What we'll accomplish:**

- Set up Supabase client configuration
- Define comprehensive TypeScript types
- Configure environment variables
- Create basic connection test

**Result:** Frontend and backend connected with type safety

---

## Phase 2: Authentication System

**🎬 Phase Overview:** Now we're building our authentication system - the gateway to our application. Users will be able to sign up, sign in, and we'll manage their roles.

### Step 4: Authentication Pages & User Management

**🎬 Step Script:** "Let's build our authentication system. This includes sign-in and sign-up pages, user state management, and role-based access control."

**Files to create:**

1. **`src/hooks/useUser.ts`** - User authentication hook

```typescript
import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Profile, UserRole } from "../types";

export interface AuthUser {
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
}

export const useUser = () => {
  const [authUser, setAuthUser] = useState<AuthUser>({
    user: null,
    profile: null,
    role: "user",
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await handleUserChange(session);
      } else {
        setAuthUser((prev) => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await handleUserChange(session);
      } else {
        setAuthUser({
          user: null,
          profile: null,
          role: "user",
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserChange = async (session: Session) => {
    const user = session.user;

    // Determine role based on email
    const role: UserRole =
      user.email === "waterlily-admin@yopmail.com" ? "admin" : "user";

    // Get or create profile
    let profile: Profile | null = null;

    if (role === "user") {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (existingProfile) {
        profile = existingProfile;
      } else {
        // Create profile for new users
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || null,
          })
          .select()
          .single();

        profile = newProfile;
      }
    }

    setAuthUser({
      user,
      profile,
      role,
      loading: false,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authUser,
    signOut,
  };
};
```

2. **`src/components/ProtectedRoute.tsx`** - Protected route component

```typescript
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: "user" | "admin";
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireRole,
}: ProtectedRouteProps) => {
  const { user, role, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Redirect if role doesn't match
  if (requireRole && role !== requireRole) {
    if (role === "admin") {
      return <Navigate to="/admin/submissions" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
```

3. **`src/pages/SignIn.tsx`** - Sign in page

```typescript
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Signed in successfully!");

      // Redirect based on role
      if (data.user?.email === "waterlily-admin@yopmail.com") {
        navigate("/admin/submissions");
      } else {
        navigate(from);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-sky-600 hover:text-sky-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

4. **`src/pages/SignUp.tsx`** - Sign up page

```typescript
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast.success(
        "Account created successfully! Please check your email to verify your account."
      );
      navigate("/signin");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signin"
              className="font-medium text-sky-600 hover:text-sky-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

5. **`src/App.tsx`** - Update with authentication routes

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { testConnection } from "./lib/supabase";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Home } from "./pages/index";
import { Dashboard } from "./pages/Dashboard";
import { SubmissionList } from "./pages/Admin/SubmissionList";
import "./App.css";

function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testConnection();
      setIsConnected(connected);
    };
    checkConnection();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute requireRole="admin">
              <SubmissionList />
            </ProtectedRoute>
          }
        />

        {/* Home route - smart redirector */}
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
```

**Commands to run:**

```bash
# Test the authentication system
npm run dev

# Test the following flows:
# 1. Visit http://localhost:5173
# 2. Click "Create Account" and sign up
# 3. Sign in with the created account
# 4. Test admin access with waterlily-admin@yopmail.com
```

**What we'll accomplish:**

- Create sign-in page with form validation
- Create sign-up page with profile creation
- Build user authentication hook
- Implement role-based access (admin vs user)
- Create protected route component

**Result:** Complete authentication system with role management

**Demo:** Show sign-up, sign-in, and role-based redirects

**Test Accounts:**

- **Admin:** waterlily-admin@yopmail.com (any password)
- **User:** Any email you sign up with

---

## Phase 3: Navigation & Basic Layout

**🎬 Phase Overview:** Now we're creating the navigation and layout system that will wrap our entire application.

### Step 5: Navigation & Layout System

**🎬 Step Script:** "Let's build our navigation and layout system. This provides a consistent structure across all pages with role-based navigation."

**Files to create:**

1. **`src/components/Layout.tsx`** - Main layout component

```typescript
import { ReactNode } from "react";
import { Nav } from "./Nav";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-var(--max-width) mx-auto p-4">{children}</main>
    </div>
  );
};
```

2. **`src/components/Nav.tsx`** - Navigation component with role-based menus

```typescript
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import toast from "react-hot-toast";

export const Nav = () => {
  const { user, profile, role, signOut } = useUser();
  const location = useLocation();

  // Don't show nav on auth pages
  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";

  if (isAuthPage) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-var(--max-width) mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Survey Intake
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center space-x-8">
              {role === "admin" ? (
                // Admin Navigation
                <>
                  <Link
                    to="/admin/submissions"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    All Submissions
                  </Link>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Admin
                  </span>
                </>
              ) : (
                // User Navigation
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    My Submissions
                  </Link>
                  <Link
                    to="/survey/intake-2024"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Take Survey
                  </Link>
                </>
              )}

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  {profile?.full_name || user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Sign In Link for unauthenticated users */}
          {!user && (
            <div className="flex items-center space-x-4">
              <Link
                to="/signin"
                className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
```

3. **`src/pages/index.tsx`** - Smart home page redirector

```typescript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export const Home = () => {
  const { user, role, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated - redirect to sign in
        navigate("/signin");
      } else if (role === "admin") {
        // Admin - redirect to admin dashboard
        navigate("/admin/submissions");
      } else {
        // Regular user - redirect to survey
        navigate("/survey/intake-2024");
      }
    }
  }, [user, role, loading, navigate]);

  // Show loading while determining redirect
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // This should never be shown, but just in case
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};
```

4. **`src/pages/Dashboard.tsx`** - User dashboard page

```typescript
import { Layout } from "../components/Layout";

export const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to your dashboard! Here you can manage your survey
            submissions and view your assessments.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/survey/intake-2024"
              className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Take New Survey</h3>
              <p className="text-sm text-gray-600 mt-1">
                Start a new long-term care assessment
              </p>
            </a>
            <a
              href="/dashboard"
              className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">View Submissions</h3>
              <p className="text-sm text-gray-600 mt-1">
                See your previous survey submissions
              </p>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm mt-1">
              Complete your first survey to see your activity here
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            About Your Assessments
          </h2>
          <div className="prose prose-sm text-gray-600">
            <p>
              Your survey responses are used to generate personalized care plans
              and cost estimates using advanced AI technology. Each assessment
              provides:
            </p>
            <ul className="mt-2 space-y-1">
              <li>• Comprehensive care recommendations</li>
              <li>• Detailed cost breakdowns</li>
              <li>• Service frequency recommendations</li>
              <li>• Estimated care duration</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};
```

5. **`src/pages/Admin/SubmissionList.tsx`** - Admin dashboard page

```typescript
import { Layout } from "../../components/Layout";

export const SubmissionList = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Submissions</h1>
          <p className="mt-2 text-gray-600">
            View and manage all user survey submissions and assessments.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-sky-600">0</div>
            <div className="text-sm text-gray-600">Assessments</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, email, or survey..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <p>No submissions found</p>
                    <p className="text-sm mt-1">
                      Submissions will appear here once users start taking
                      surveys
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};
```

6. **`src/App.tsx`** - Update with new routes and layout

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { testConnection } from "./lib/supabase";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Home } from "./pages/index";
import { Dashboard } from "./pages/Dashboard";
import { SubmissionList } from "./pages/Admin/SubmissionList";
import "./App.css";

function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testConnection();
      setIsConnected(connected);
    };
    checkConnection();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute requireRole="admin">
              <SubmissionList />
            </ProtectedRoute>
          }
        />

        {/* Home route - smart redirector */}
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
```

**Commands to run:**

```bash
# Test the navigation system
npm run dev

# Test the following flows:
# 1. Visit http://localhost:5173 (should redirect based on auth status)
# 2. Sign in as admin - should see admin navigation
# 3. Sign in as user - should see user navigation
# 4. Test navigation links and sign out functionality
```

**What we'll accomplish:**

- Create main layout component
- Build navigation with role-based menus
- Set up routing structure
- Create smart home page redirector

**Result:** Complete navigation system with role-based menus

**Demo:** Show navigation changing based on user role

**Key Features:**

- ✅ Role-based navigation (admin vs user)
- ✅ Automatic hiding on auth pages
- ✅ Smart home page redirector
- ✅ User profile display
- ✅ Sign out functionality
- ✅ Responsive design
- ✅ Admin badge for admin users
- ✅ User dashboard with quick actions
- ✅ Admin dashboard with statistics and filters

---

## Phase 4: Survey System Core

**🎬 Phase Overview:** Now we're building the core survey functionality - the heart of our application.

### Step 6: Survey Data & Questions

**🎬 Step Script:** "Let's create our survey system. This includes fetching survey data, rendering different question types, and managing user responses."

**What we'll accomplish:**

- Create survey hook for data fetching
- Build question renderer for different input types
- Implement single-question display
- Add progress tracking
- Create auto-save functionality

**Result:** Complete survey system with auto-save and progress tracking

**Demo:** Show survey taking with auto-save and progress

### Step 7: Survey Pages & Submission

**🎬 Step Script:** "Now let's build the main survey pages where users interact with our survey system."

**What we'll accomplish:**

- Create main survey page with navigation
- Build submission handling
- Add edit/continue functionality
- Create review submission page

**Result:** Complete survey experience with submission and review

**Demo:** Show complete survey flow from start to finish

---

## Phase 5: Assessment & AI Integration

**🎬 Phase Overview:** Now we're adding the AI-powered assessment feature that generates care plans and cost estimates.

### Step 8: Supabase Edge Function

**🎬 Step Script:** "Let's create our AI assessment system. This includes a Supabase edge function that uses OpenAI to generate care plans and cost estimates."

**Supabase Edge Function - Create `supabase/functions/do-assessment/index.ts`:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request body
    const { submission_id } = await req.json();

    if (!submission_id) {
      throw new Error("submission_id is required");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch submission data
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select(
        `
        *,
        survey:surveys(*),
        answers:answers(
          *,
          question:questions(*)
        )
      `
      )
      .eq("id", submission_id)
      .single();

    if (submissionError || !submission) {
      throw new Error("Submission not found");
    }

    // Prepare questions and answers for AI
    const qaData = submission.answers.map((answer: any) => ({
      question: answer.question.question_text,
      answer: answer.answer_text || JSON.stringify(answer.answer_json),
    }));

    // Generate AI assessment using OpenAI
    const assessment = await generateAssessment(qaData, openaiApiKey);

    // Store assessment in database
    const { data: assessmentData, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        submission_id: submission_id,
        care_plan: assessment.care_plan,
        cost_estimate: assessment.cost_estimate,
        ai_model_used: "gpt-5",
      })
      .select()
      .single();

    if (assessmentError) {
      throw new Error("Failed to store assessment");
    }

    return new Response(
      JSON.stringify({
        success: true,
        assessment: assessmentData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

async function generateAssessment(qaData: any[], openaiApiKey: string) {
  const prompt = `
You are a healthcare assessment AI specializing in long-term care planning. Based on the following survey responses, generate a comprehensive care plan and cost estimate.

Survey Responses:
${qaData.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join("\n\n")}

Please provide a structured response in the following JSON format:

{
  "care_plan": {
    "summary": "A 2-3 sentence summary of the person's care needs",
    "recommendations": [
      "Specific recommendation 1",
      "Specific recommendation 2",
      "Specific recommendation 3"
    ],
    "care_level": "independent|assisted|skilled|memory_care",
    "services_needed": [
      "Service 1",
      "Service 2",
      "Service 3"
    ],
    "frequency": "daily|weekly|monthly|as needed",
    "estimated_duration": "3-6 months|6-12 months|1-2 years|long-term"
  },
  "cost_estimate": {
    "monthly_cost": 2500,
    "annual_cost": 30000,
    "breakdown": [
      {
        "service": "Home Health Aide",
        "cost": 1500,
        "frequency": "monthly"
      },
      {
        "service": "Medical Equipment",
        "cost": 200,
        "frequency": "monthly"
      }
    ],
    "total_range": {
      "min": 2000,
      "max": 3500
    }
  }
}

Base your assessment on the survey responses and provide realistic, practical recommendations. Consider factors like age, health conditions, mobility, cognitive function, and support systems mentioned in the responses.
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "You are a healthcare assessment AI. Provide responses in valid JSON format only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `OpenAI API error: ${data.error?.message || "Unknown error"}`
    );
  }

  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const assessment = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!assessment.care_plan || !assessment.cost_estimate) {
      throw new Error("Invalid assessment structure");
    }

    return assessment;
  } catch (parseError) {
    throw new Error(`Failed to parse AI response: ${parseError.message}`);
  }
}
```

**Environment Variables Setup:**

```bash
# Add to your Supabase project environment variables
OPENAI_API_KEY=your_openai_api_key_here
```

**Deploy the Edge Function:**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy do-assessment
```

### Step 9: Assessment Display

**🎬 Step Script:** "Now let's build the assessment display system that shows the AI-generated care plans and cost estimates."

**Files to create:**

1. **`src/components/AssessmentDisplay.tsx`** - Assessment display component

```typescript
import { Assessment } from "../types";

interface AssessmentDisplayProps {
  assessment: Assessment;
  className?: string;
}

export const AssessmentDisplay = ({
  assessment,
  className = "",
}: AssessmentDisplayProps) => {
  const { care_plan, cost_estimate } = assessment;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Care Plan Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Care Plan</h2>

        <div className="space-y-4">
          {/* Summary */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
              {care_plan.summary}
            </p>
          </div>

          {/* Care Level */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Care Level
            </h3>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                care_plan.care_level === "independent"
                  ? "bg-green-100 text-green-800"
                  : care_plan.care_level === "assisted"
                  ? "bg-yellow-100 text-yellow-800"
                  : care_plan.care_level === "skilled"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {care_plan.care_level.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Recommendations
            </h3>
            <ul className="space-y-2">
              {care_plan.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-sky-600 rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Needed */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Services Needed
            </h3>
            <div className="flex flex-wrap gap-2">
              {care_plan.services_needed.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Frequency and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Frequency
              </h3>
              <p className="text-gray-700">{care_plan.frequency}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Estimated Duration
              </h3>
              <p className="text-gray-700">{care_plan.estimated_duration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Estimate Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Cost Estimate
        </h2>

        <div className="space-y-4">
          {/* Total Costs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                ${cost_estimate.monthly_cost.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Cost</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                ${cost_estimate.annual_cost.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Annual Cost</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                ${cost_estimate.total_range.min.toLocaleString()} - $
                {cost_estimate.total_range.max.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Range</div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Cost Breakdown
            </h3>
            <div className="space-y-2">
              {cost_estimate.breakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.service}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.frequency}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${item.cost.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Model Info */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Assessment generated by {assessment.ai_model_used} on{" "}
          {new Date(assessment.generated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
```

2. **`src/hooks/useAssessment.ts`** - Assessment data hook

```typescript
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Assessment } from "../types";

export const useAssessment = (submissionId: string) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("assessments")
          .select("*")
          .eq("submission_id", submissionId)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            // No assessment found - generate one
            await generateAssessment(submissionId);
          } else {
            throw fetchError;
          }
        } else {
          setAssessment(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchAssessment();
    }
  }, [submissionId]);

  const generateAssessment = async (submissionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("do-assessment", {
        body: { submission_id: submissionId },
      });

      if (error) throw error;

      if (data.success && data.assessment) {
        setAssessment(data.assessment);
      } else {
        throw new Error(data.error || "Failed to generate assessment");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate assessment");
    }
  };

  const regenerateAssessment = async () => {
    if (!submissionId) return;

    setLoading(true);
    setError(null);
    await generateAssessment(submissionId);
    setLoading(false);
  };

  return { assessment, loading, error, regenerateAssessment };
};
```

3. **Update `src/pages/ReviewSubmission.tsx`** - Add assessment display

```typescript
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { AssessmentDisplay } from "../components/AssessmentDisplay";
import { useAssessment } from "../hooks/useAssessment";
import { supabase } from "../lib/supabase";
import { useUser } from "../hooks/useUser";
import { Submission, Answer, Question, Survey } from "../types";
import toast from "react-hot-toast";

export const ReviewSubmission = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  // Assessment hook
  const {
    assessment,
    loading: assessmentLoading,
    error: assessmentError,
    regenerateAssessment,
  } = useAssessment(id || "");

  useEffect(() => {
    if (id && user) {
      loadSubmissionData();
    }
  }, [id, user]);

  const loadSubmissionData = async () => {
    try {
      setLoading(true);

      // Load submission
      const { data: submissionData, error: submissionError } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (submissionError) throw submissionError;
      setSubmission(submissionData);

      // Load survey
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", submissionData.survey_id)
        .single();

      if (surveyError) throw surveyError;
      setSurvey(surveyData);

      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", surveyData.id)
        .order("ui_order", { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData);

      // Load answers
      const { data: answersData, error: answersError } = await supabase
        .from("answers")
        .select("*")
        .eq("submission_id", id);

      if (answersError) throw answersError;
      setAnswers(answersData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load submission");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getAnswerForQuestion = (questionId: string) => {
    const answer = answers.find((a) => a.question_id === questionId);
    return answer?.answer_text || answer?.answer_json || "No answer provided";
  };

  const formatAnswer = (answer: any) => {
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }
    return String(answer);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submission...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!submission || !survey) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Submission Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The submission you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Survey Review
            </h1>
            <p className="text-gray-600">
              {survey.title} - Completed on{" "}
              {new Date(submission.created_at).toLocaleDateString()}
            </p>
          </div>
          <button onClick={handlePrint} className="btn-primary">
            Print
          </button>
        </div>

        {/* Assessment Section */}
        {submission.status === "completed" && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                AI Assessment
              </h2>
              {assessmentError && (
                <button
                  onClick={regenerateAssessment}
                  disabled={assessmentLoading}
                  className="btn-primary text-sm"
                >
                  {assessmentLoading
                    ? "Generating..."
                    : "Regenerate Assessment"}
                </button>
              )}
            </div>

            {assessmentLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating AI assessment...</p>
              </div>
            ) : assessmentError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{assessmentError}</p>
                <button onClick={regenerateAssessment} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : assessment ? (
              <AssessmentDisplay assessment={assessment} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No assessment available</p>
              </div>
            )}
          </div>
        )}

        {/* Questions and Answers */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Survey Responses
          </h2>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {question.question_text}
                    </h3>
                    {question.help_text && (
                      <p className="text-sm text-gray-500 mt-1">
                        {question.help_text}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-11">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">
                      {formatAnswer(getAnswerForQuestion(question.id))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button onClick={() => navigate("/dashboard")} className="btn-ghost">
            Back to Dashboard
          </button>
          <button
            onClick={() =>
              navigate(`/survey/${survey.slug}?edit=${submission.id}`)
            }
            className="btn-primary"
          >
            Edit Submission
          </button>
        </div>
      </div>
    </Layout>
  );
};
```

**Commands to run:**

```bash
# Deploy the edge function
supabase functions deploy do-assessment

# Test the assessment system
npm run dev

# Test the following flows:
# 1. Complete a survey submission
# 2. Check that assessment is automatically generated
# 3. View the assessment in the review page
# 4. Test regeneration if needed
```

**What we'll accomplish:**

- Create Supabase edge function
- Integrate OpenAI GPT-5 for assessment
- Generate comprehensive care plans
- Calculate cost estimates
- Store assessment results

**Result:** AI-powered assessment system

**Demo:** Show assessment generation after survey submission

**Key Features:**

- ✅ Supabase Edge Function with OpenAI integration
- ✅ Comprehensive care plan generation
- ✅ Detailed cost estimation
- ✅ Assessment display component
- ✅ Automatic assessment generation
- ✅ Assessment regeneration capability
- ✅ Error handling and loading states
- ✅ Beautiful assessment presentation
- ✅ Print-friendly layout

---

## Phase 6: User Dashboard & Management

**🎬 Phase Overview:** Now we're building the user dashboard where users can manage their submissions and view their assessments.

### Step 10: Enhanced User Dashboard

**🎬 Step Script:** "Let's create our enhanced user dashboard where users can manage their submissions and view their assessments."

**Files to create:**

1. **`src/hooks/useSubmissions.ts`** - User submissions hook

```typescript
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "./useUser";
import { Submission, Survey } from "../types";

export const useSubmissions = () => {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's submissions with survey data
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select(
          `
          *,
          survey:surveys(*)
        `
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (submissionsError) throw submissionsError;

      // Fetch all surveys for reference
      const { data: surveysData, error: surveysError } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (surveysError) throw surveysError;

      setSubmissions(submissionsData || []);
      setSurveys(surveysData || []);
    } catch (err: any) {
      setError(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submissionId)
        .eq("user_id", user?.id);

      if (error) throw error;

      // Remove from local state
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete submission");
      return false;
    }
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const completed = submissions.filter(
      (s) => s.status === "completed"
    ).length;
    const inProgress = submissions.filter(
      (s) => s.status === "in_progress"
    ).length;

    return { total, completed, inProgress };
  };

  return {
    submissions,
    surveys,
    loading,
    error,
    deleteSubmission,
    getSubmissionStats,
    refetch: fetchSubmissions,
  };
};
```

2. **`src/components/ConfirmDialog.tsx`** - Confirmation dialog component

```typescript
import { ReactNode } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          icon: "text-red-600",
        };
      case "warning":
        return {
          button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          icon: "text-yellow-600",
        };
      default:
        return {
          button: "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500",
          icon: "text-sky-600",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className={`h-6 w-6 ${styles.icon}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${styles.button}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

3. **Updated `src/pages/Dashboard.tsx`** - Enhanced user dashboard

```typescript
import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useSubmissions } from "../hooks/useSubmissions";
import { useUser } from "../hooks/useUser";
import toast from "react-hot-toast";

export const Dashboard = () => {
  const { user } = useUser();
  const {
    submissions,
    surveys,
    loading,
    error,
    deleteSubmission,
    getSubmissionStats,
  } = useSubmissions();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    submissionId: string | null;
  }>({
    isOpen: false,
    submissionId: null,
  });

  const stats = getSubmissionStats();

  const handleDeleteSubmission = async () => {
    if (!deleteDialog.submissionId) return;

    const success = await deleteSubmission(deleteDialog.submissionId);
    if (success) {
      toast.success("Submission deleted successfully");
    } else {
      toast.error("Failed to delete submission");
    }
    setDeleteDialog({ isOpen: false, submissionId: null });
  };

  const openDeleteDialog = (submissionId: string) => {
    setDeleteDialog({ isOpen: true, submissionId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, submissionId: null });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.email}! Manage your survey submissions and view
            your assessments.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.inProgress}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/survey/intake-2024"
              className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Take New Survey</h3>
              <p className="text-sm text-gray-600 mt-1">
                Start a new long-term care assessment
              </p>
            </Link>
            {surveys.length > 1 && (
              <Link
                to="/surveys"
                className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900">View All Surveys</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Browse available surveys
                </p>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Submissions
            </h2>
            {submissions.length > 0 && (
              <Link
                to="/submissions"
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                View All
              </Link>
            )}
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No submissions yet</p>
              <p className="text-sm mt-1">
                Complete your first survey to see your submissions here
              </p>
              <Link
                to="/survey/intake-2024"
                className="btn-primary mt-4 inline-block"
              >
                Take Your First Survey
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">
                        {submission.survey?.title || "Survey"}
                      </h3>
                      {getStatusBadge(submission.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Started on{" "}
                      {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {submission.status === "completed" && (
                      <Link
                        to={`/review/${submission.id}`}
                        className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                      >
                        View Assessment
                      </Link>
                    )}
                    {submission.status === "in_progress" && (
                      <Link
                        to={`/survey/${submission.survey?.slug}?continue=${submission.id}`}
                        className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                      >
                        Continue
                      </Link>
                    )}
                    <button
                      onClick={() => openDeleteDialog(submission.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            About Your Assessments
          </h2>
          <div className="prose prose-sm text-gray-600">
            <p>
              Your survey responses are used to generate personalized care plans
              and cost estimates using advanced AI technology. Each assessment
              provides:
            </p>
            <ul className="mt-2 space-y-1">
              <li>• Comprehensive care recommendations</li>
              <li>• Detailed cost breakdowns</li>
              <li>• Service frequency recommendations</li>
              <li>• Estimated care duration</li>
            </ul>
            <p className="mt-4 text-sm">
              <strong>Note:</strong> Assessments are automatically generated
              when you complete a survey. You can view and print your
              assessments from the review page.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteSubmission}
        title="Delete Submission"
        message="Are you sure you want to delete this submission? This action cannot be undone and will also delete any associated assessments."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </Layout>
  );
};
```

4. **`src/pages/Submissions.tsx`** - All submissions page

```typescript
import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useSubmissions } from "../hooks/useSubmissions";
import toast from "react-hot-toast";

export const Submissions = () => {
  const { submissions, loading, error, deleteSubmission } = useSubmissions();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    submissionId: string | null;
  }>({
    isOpen: false,
    submissionId: null,
  });
  const [filter, setFilter] = useState<"all" | "completed" | "in_progress">(
    "all"
  );

  const filteredSubmissions = submissions.filter((submission) => {
    if (filter === "all") return true;
    return submission.status === filter;
  });

  const handleDeleteSubmission = async () => {
    if (!deleteDialog.submissionId) return;

    const success = await deleteSubmission(deleteDialog.submissionId);
    if (success) {
      toast.success("Submission deleted successfully");
    } else {
      toast.error("Failed to delete submission");
    }
    setDeleteDialog({ isOpen: false, submissionId: null });
  };

  const openDeleteDialog = (submissionId: string) => {
    setDeleteDialog({ isOpen: true, submissionId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, submissionId: null });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Submissions
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
            <p className="mt-2 text-gray-600">
              View and manage all your survey submissions and assessments.
            </p>
          </div>
          <Link to="/survey/intake-2024" className="btn-primary">
            Take New Survey
          </Link>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-sky-100 text-sky-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Completed (
              {submissions.filter((s) => s.status === "completed").length})
            </button>
            <button
              onClick={() => setFilter("in_progress")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === "in_progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              In Progress (
              {submissions.filter((s) => s.status === "in_progress").length})
            </button>
          </div>
        </div>

        {/* Submissions List */}
        <div className="card">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {filter === "all" ? (
                <>
                  <p>No submissions yet</p>
                  <p className="text-sm mt-1">
                    Complete your first survey to see your submissions here
                  </p>
                  <Link
                    to="/survey/intake-2024"
                    className="btn-primary mt-4 inline-block"
                  >
                    Take Your First Survey
                  </Link>
                </>
              ) : (
                <>
                  <p>No {filter.replace("_", " ")} submissions</p>
                  <p className="text-sm mt-1">
                    {filter === "completed"
                      ? "Complete a survey to see completed submissions here"
                      : "Start a survey to see in-progress submissions here"}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">
                        {submission.survey?.title || "Survey"}
                      </h3>
                      {getStatusBadge(submission.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Started on{" "}
                      {new Date(submission.created_at).toLocaleDateString()}
                      {submission.updated_at !== submission.created_at && (
                        <span className="ml-2">
                          • Last updated{" "}
                          {new Date(submission.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {submission.status === "completed" && (
                      <Link
                        to={`/review/${submission.id}`}
                        className="btn-primary text-sm"
                      >
                        View Assessment
                      </Link>
                    )}
                    {submission.status === "in_progress" && (
                      <Link
                        to={`/survey/${submission.survey?.slug}?continue=${submission.id}`}
                        className="btn-primary text-sm"
                      >
                        Continue
                      </Link>
                    )}
                    <Link
                      to={`/survey/${submission.survey?.slug}?edit=${submission.id}`}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => openDeleteDialog(submission.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteSubmission}
        title="Delete Submission"
        message="Are you sure you want to delete this submission? This action cannot be undone and will also delete any associated assessments."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </Layout>
  );
};
```

5. **Update `src/App.tsx`** - Add submissions route

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { testConnection } from "./lib/supabase";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Home } from "./pages/index";
import { Dashboard } from "./pages/Dashboard";
import { Submissions } from "./pages/Submissions";
import { SubmissionList } from "./pages/Admin/SubmissionList";
import { SurveyPage } from "./pages/SurveyPage";
import { ReviewSubmission } from "./pages/ReviewSubmission";
import "./App.css";

function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testConnection();
      setIsConnected(connected);
    };
    checkConnection();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submissions"
          element={
            <ProtectedRoute>
              <Submissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute requireRole="admin">
              <SubmissionList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/survey/:slug"
          element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review/:id"
          element={
            <ProtectedRoute>
              <ReviewSubmission />
            </ProtectedRoute>
          }
        />

        {/* Home route - smart redirector */}
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
```

6. **Update `src/components/Nav.tsx`** - Add submissions link

```typescript
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import toast from "react-hot-toast";

export const Nav = () => {
  const { user, profile, role, signOut } = useUser();
  const location = useLocation();

  // Don't show nav on auth pages
  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";

  if (isAuthPage) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-var(--max-width) mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Survey Intake
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center space-x-8">
              {role === "admin" ? (
                // Admin Navigation
                <>
                  <Link
                    to="/admin/submissions"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    All Submissions
                  </Link>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Admin
                  </span>
                </>
              ) : (
                // User Navigation
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/submissions"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    My Submissions
                  </Link>
                  <Link
                    to="/survey/intake-2024"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Take Survey
                  </Link>
                </>
              )}

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  {profile?.full_name || user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Sign In Link for unauthenticated users */}
          {!user && (
            <div className="flex items-center space-x-4">
              <Link
                to="/signin"
                className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
```

**Commands to run:**

```bash
# Test the enhanced user dashboard
npm run dev

# Test the following flows:
# 1. Visit dashboard and see statistics
# 2. View recent submissions
# 3. Navigate to all submissions page
# 4. Test filtering by status
# 5. Test submission deletion with confirmation
# 6. Test continue/edit functionality
```

**What we'll accomplish:**

- Create enhanced user dashboard with statistics
- Build submission management system
- Add confirmation dialogs for destructive actions
- Implement filtering and search capabilities
- Create comprehensive submission viewing

**Result:** Complete user dashboard with full submission management

**Demo:** Show user managing submissions and viewing assessments

**Key Features:**

- ✅ Enhanced dashboard with statistics
- ✅ Submission management (view, edit, delete)
- ✅ Status filtering and organization
- ✅ Confirmation dialogs for safety
- ✅ Quick actions and navigation
- ✅ Assessment access from submissions
- ✅ Responsive design
- ✅ Error handling and loading states
- ✅ User-friendly interface

---

## Phase 7: Admin System

**🎬 Phase Overview:** Now we're building the admin system for data oversight and management.

### Step 11: Admin Dashboard

**🎬 Step Script:** "Let's build our admin system where administrators can view all submissions and assessments."

**Files to create:**

1. **`src/hooks/useAdminData.ts`** - Admin data management hook

```typescript
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Submission, Survey, Assessment, Profile } from "../types";

export const useAdminData = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all submissions with related data
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select(
          `
          *,
          survey:surveys(*),
          user:profiles(*),
          assessment:assessments(*)
        `
        )
        .order("created_at", { ascending: false });

      if (submissionsError) throw submissionsError;

      // Fetch all surveys
      const { data: surveysData, error: surveysError } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (surveysError) throw surveysError;

      // Fetch all assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessments")
        .select("*")
        .order("generated_at", { ascending: false });

      if (assessmentsError) throw assessmentsError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      setSubmissions(submissionsData || []);
      setSurveys(surveysData || []);
      setAssessments(assessmentsData || []);
      setProfiles(profilesData || []);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const getAdminStats = () => {
    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(
      (s) => s.status === "completed"
    ).length;
    const inProgressSubmissions = submissions.filter(
      (s) => s.status === "in_progress"
    ).length;
    const totalAssessments = assessments.length;
    const totalUsers = profiles.length;
    const totalSurveys = surveys.length;

    // Calculate completion rate
    const completionRate =
      totalSubmissions > 0
        ? Math.round((completedSubmissions / totalSubmissions) * 100)
        : 0;

    // Calculate average assessment cost
    const totalCost = assessments.reduce((sum, assessment) => {
      return sum + (assessment.cost_estimate?.monthly_cost || 0);
    }, 0);
    const averageCost =
      assessments.length > 0 ? Math.round(totalCost / assessments.length) : 0;

    return {
      totalSubmissions,
      completedSubmissions,
      inProgressSubmissions,
      totalAssessments,
      totalUsers,
      totalSurveys,
      completionRate,
      averageCost,
    };
  };

  const deleteSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submissionId);

      if (error) throw error;

      // Remove from local state
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setAssessments((prev) =>
        prev.filter((a) => a.submission_id !== submissionId)
      );
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete submission");
      return false;
    }
  };

  const regenerateAssessment = async (submissionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("do-assessment", {
        body: { submission_id: submissionId },
      });

      if (error) throw error;

      if (data.success && data.assessment) {
        // Update local state
        setAssessments((prev) => {
          const filtered = prev.filter((a) => a.submission_id !== submissionId);
          return [data.assessment, ...filtered];
        });
        return true;
      } else {
        throw new Error(data.error || "Failed to regenerate assessment");
      }
    } catch (err: any) {
      setError(err.message || "Failed to regenerate assessment");
      return false;
    }
  };

  return {
    submissions,
    surveys,
    assessments,
    profiles,
    loading,
    error,
    getAdminStats,
    deleteSubmission,
    regenerateAssessment,
    refetch: fetchAdminData,
  };
};
```

2. **Updated `src/pages/Admin/SubmissionList.tsx`** - Enhanced admin dashboard

```typescript
import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AssessmentDisplay } from "../../components/AssessmentDisplay";
import { useAdminData } from "../../hooks/useAdminData";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

export const SubmissionList = () => {
  const { user } = useUser();
  const {
    submissions,
    loading,
    error,
    getAdminStats,
    deleteSubmission,
    regenerateAssessment,
  } = useAdminData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    submissionId: string | null;
  }>({
    isOpen: false,
    submissionId: null,
  });

  const stats = getAdminStats();

  // Filter submissions based on search and status
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.user?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.user?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.survey?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteSubmission = async () => {
    if (!deleteDialog.submissionId) return;

    const success = await deleteSubmission(deleteDialog.submissionId);
    if (success) {
      toast.success("Submission deleted successfully");
    } else {
      toast.error("Failed to delete submission");
    }
    setDeleteDialog({ isOpen: false, submissionId: null });
  };

  const handleRegenerateAssessment = async (submissionId: string) => {
    const success = await regenerateAssessment(submissionId);
    if (success) {
      toast.success("Assessment regenerated successfully");
    } else {
      toast.error("Failed to regenerate assessment");
    }
  };

  const openDeleteDialog = (submissionId: string) => {
    setDeleteDialog({ isOpen: true, submissionId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, submissionId: null });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage all user submissions and assessments across the platform.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalSubmissions}
            </div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-green-600">
              {stats.completedSubmissions}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-sky-600">
              {stats.totalAssessments}
            </div>
            <div className="text-sm text-gray-600">Assessments</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.inProgressSubmissions}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-blue-600">
              {stats.completionRate}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-green-600">
              ${stats.averageCost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Avg. Monthly Cost</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or survey..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <p>No submissions found</p>
                      <p className="text-sm mt-1">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Submissions will appear here once users start taking surveys"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {submission.user?.full_name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.survey?.title || "Unknown Survey"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.assessment ? (
                          <button
                            onClick={() =>
                              setSelectedSubmission(
                                selectedSubmission === submission.id
                                  ? null
                                  : submission.id
                              )
                            }
                            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                          >
                            {selectedSubmission === submission.id
                              ? "Hide"
                              : "View"}{" "}
                            Assessment
                          </button>
                        ) : submission.status === "completed" ? (
                          <button
                            onClick={() =>
                              handleRegenerateAssessment(submission.id)
                            }
                            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                          >
                            Generate Assessment
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Not available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/review/${submission.id}`}
                            className="text-sky-600 hover:text-sky-700"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => openDeleteDialog(submission.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assessment Display */}
        {selectedSubmission && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Assessment Details
              </h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {(() => {
              const submission = submissions.find(
                (s) => s.id === selectedSubmission
              );
              const assessment = submission?.assessment;
              return assessment ? (
                <AssessmentDisplay assessment={assessment} />
              ) : (
                <p className="text-gray-500">No assessment available</p>
              );
            })()}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteSubmission}
        title="Delete Submission"
        message="Are you sure you want to delete this submission? This action cannot be undone and will also delete any associated assessments."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </Layout>
  );
};
```

3. **`src/pages/Admin/UserManagement.tsx`** - User management page

```typescript
import { useState } from "react";
import { Layout } from "../../components/Layout";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useAdminData } from "../../hooks/useAdminData";
import toast from "react-hot-toast";

export const UserManagement = () => {
  const { profiles, loading, error } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
  }>({
    isOpen: false,
    userId: null,
  });

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    // Note: In a real application, you'd want to implement proper user deletion
    // This is a placeholder for demonstration
    toast.success("User deletion would be implemented here");
    setDeleteDialog({ isOpen: false, userId: null });
  };

  const openDeleteDialog = (userId: string) => {
    setDeleteDialog({ isOpen: true, userId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, userId: null });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Users
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage user accounts and view user activity.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900">
              {profiles.length}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-green-600">
              {
                profiles.filter(
                  (p) => p.email === "waterlily-admin@yopmail.com"
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Admin Users</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-blue-600">
              {
                profiles.filter(
                  (p) => p.email !== "waterlily-admin@yopmail.com"
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Regular Users</div>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Users
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <p>No users found</p>
                      <p className="text-sm mt-1">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Users will appear here once they sign up"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {profile.full_name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profile.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {profile.email === "waterlily-admin@yopmail.com" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDeleteDialog(profile.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => handleDeleteUser(deleteDialog.userId!)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will also delete all their submissions and assessments."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </Layout>
  );
};
```

4. **Update `src/App.tsx`** - Add admin routes

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { testConnection } from "./lib/supabase";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Home } from "./pages/index";
import { Dashboard } from "./pages/Dashboard";
import { Submissions } from "./pages/Submissions";
import { SubmissionList } from "./pages/Admin/SubmissionList";
import { UserManagement } from "./pages/Admin/UserManagement";
import { SurveyPage } from "./pages/SurveyPage";
import { ReviewSubmission } from "./pages/ReviewSubmission";
import "./App.css";

function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testConnection();
      setIsConnected(connected);
    };
    checkConnection();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submissions"
          element={
            <ProtectedRoute>
              <Submissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute requireRole="admin">
              <SubmissionList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/survey/:slug"
          element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review/:id"
          element={
            <ProtectedRoute>
              <ReviewSubmission />
            </ProtectedRoute>
          }
        />

        {/* Home route - smart redirector */}
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
```

5. **Update `src/components/Nav.tsx`** - Add admin navigation

```typescript
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import toast from "react-hot-toast";

export const Nav = () => {
  const { user, profile, role, signOut } = useUser();
  const location = useLocation();

  // Don't show nav on auth pages
  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";

  if (isAuthPage) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-var(--max-width) mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Survey Intake
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center space-x-8">
              {role === "admin" ? (
                // Admin Navigation
                <>
                  <Link
                    to="/admin/submissions"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    All Submissions
                  </Link>
                  <Link
                    to="/admin/users"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    User Management
                  </Link>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Admin
                  </span>
                </>
              ) : (
                // User Navigation
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/submissions"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    My Submissions
                  </Link>
                  <Link
                    to="/survey/intake-2024"
                    className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Take Survey
                  </Link>
                </>
              )}

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  {profile?.full_name || user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Sign In Link for unauthenticated users */}
          {!user && (
            <div className="flex items-center space-x-4">
              <Link
                to="/signin"
                className="text-gray-600 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
```

**Commands to run:**

```bash
# Test the admin system
npm run dev

# Test the following flows:
# 1. Sign in as admin (waterlily-admin@yopmail.com)
# 2. View admin dashboard with statistics
# 3. Test submission filtering and search
# 4. View assessments inline
# 5. Test assessment regeneration
# 6. Navigate to user management
# 7. Test user search and management
```

**What we'll accomplish:**

- Create comprehensive admin dashboard
- Build submission management with filtering
- Add inline assessment viewing
- Implement assessment regeneration
- Create user management system
- Add administrative statistics

**Result:** Complete admin system with full oversight capabilities

**Demo:** Show admin managing submissions and users

**Key Features:**

- ✅ Comprehensive admin dashboard with statistics
- ✅ Submission filtering and search
- ✅ Inline assessment viewing
- ✅ Assessment regeneration capability
- ✅ User management system
- ✅ Administrative statistics
- ✅ Role-based access control
- ✅ Confirmation dialogs for safety
- ✅ Responsive design
- ✅ Error handling and loading states

---

## Phase 8: Data Population & Polish

**🎬 Phase Overview:** Finally, we're populating our database with real data and polishing the application.

### Step 12: Survey Data & Final Polish

**🎬 Step Script:** "Let's populate our database with comprehensive survey data and add final polish to our application."

**Files to create:**

1. **`sample-data.sql`** - Comprehensive survey data

```sql
-- Insert the main survey
INSERT INTO surveys (id, title, description, slug, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Long-Term Care Assessment 2024',
  'Comprehensive assessment for long-term care planning and cost estimation',
  'intake-2024',
  true,
  NOW(),
  NOW()
);

-- Get the survey ID for questions
DO $$
DECLARE
  survey_id UUID;
BEGIN
  SELECT id INTO survey_id FROM surveys WHERE slug = 'intake-2024' LIMIT 1;

  -- Personal Information Section
  INSERT INTO questions (id, survey_id, question_text, help_text, input_type, required, ui_order, validation, options, created_at, updated_at) VALUES
  (gen_random_uuid(), survey_id, 'What is your full name?', 'Please enter your legal name as it appears on official documents', 'text', true, 1, '{"pattern": "^[a-zA-Z\\s\'-]+$"}', NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'What is your date of birth?', 'This helps us understand your age-related care needs', 'date', true, 2, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'What is your current age?', 'Please enter your age in years', 'number', true, 3, '{"min": 18, "max": 120}', NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'What is your gender?', 'This information helps us provide more personalized care recommendations', 'select', true, 4, NULL, '[{"value": "male", "label": "Male"}, {"value": "female", "label": "Female"}, {"value": "non-binary", "label": "Non-binary"}, {"value": "prefer-not-to-say", "label": "Prefer not to say"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'What is your primary phone number?', 'We may need to contact you about your assessment', 'text', true, 5, '{"pattern": "^[+]?[0-9\\s\\(\\)\\-]+$"}', NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'What is your email address?', 'We will send your assessment results to this email', 'text', true, 6, '{"pattern": "^[^@]+@[^@]+\\.[^@]+$"}', NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'What is your current address?', 'Please include street address, city, state, and zip code', 'text', true, 7, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'What is your emergency contact name?', 'Who should we contact in case of emergency?', 'text', true, 8, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'What is your emergency contact phone number?', 'Please provide a reliable phone number for your emergency contact', 'text', true, 9, '{"pattern": "^[+]?[0-9\\s\\(\\)\\-]+$"}', NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'What is your relationship to your emergency contact?', 'How are you related to your emergency contact?', 'select', true, 10, NULL, '[{"value": "spouse", "label": "Spouse/Partner"}, {"value": "child", "label": "Child"}, {"value": "parent", "label": "Parent"}, {"value": "sibling", "label": "Sibling"}, {"value": "friend", "label": "Friend"}, {"value": "other", "label": "Other"}]', NOW(), NOW());

  -- Health Information Section
  INSERT INTO questions (id, survey_id, question_text, help_text, input_type, required, ui_order, validation, options, created_at, updated_at) VALUES
  (gen_random_uuid(), survey_id, 'Do you have any chronic health conditions?', 'Please select all that apply', 'checkbox', true, 11, NULL, '[{"value": "diabetes", "label": "Diabetes"}, {"value": "hypertension", "label": "Hypertension (High Blood Pressure)"}, {"value": "heart-disease", "label": "Heart Disease"}, {"value": "arthritis", "label": "Arthritis"}, {"value": "dementia", "label": "Dementia/Alzheimer''s"}, {"value": "cancer", "label": "Cancer"}, {"value": "respiratory", "label": "Respiratory Conditions (COPD, Asthma)"}, {"value": "stroke", "label": "Stroke"}, {"value": "none", "label": "None"}, {"value": "other", "label": "Other (please specify)"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Are you currently taking any medications?', 'Please list your current medications', 'text', false, 12, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Do you have any allergies?', 'Please list any allergies to medications, foods, or environmental factors', 'text', false, 13, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'How would you rate your overall health?', 'Please rate your current health status', 'select', true, 14, NULL, '[{"value": "excellent", "label": "Excellent"}, {"value": "good", "label": "Good"}, {"value": "fair", "label": "Fair"}, {"value": "poor", "label": "Poor"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Do you have any mobility limitations?', 'Please select all that apply', 'checkbox', true, 15, NULL, '[{"value": "walking", "label": "Difficulty Walking"}, {"value": "stairs", "label": "Difficulty with Stairs"}, {"value": "balance", "label": "Balance Issues"}, {"value": "wheelchair", "label": "Uses Wheelchair"}, {"value": "walker", "label": "Uses Walker/Cane"}, {"value": "none", "label": "No Limitations"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Do you have any vision or hearing impairments?', 'Please select all that apply', 'checkbox', true, 16, NULL, '[{"value": "vision", "label": "Vision Impairment"}, {"value": "hearing", "label": "Hearing Impairment"}, {"value": "both", "label": "Both Vision and Hearing"}, {"value": "none", "label": "None"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Do you need assistance with daily activities?', 'Please select all activities where you need help', 'checkbox', true, 17, NULL, '[{"value": "bathing", "label": "Bathing/Showering"}, {"value": "dressing", "label": "Dressing"}, {"value": "eating", "label": "Eating"}, {"value": "toileting", "label": "Toileting"}, {"value": "transferring", "label": "Transferring (bed to chair)"}, {"value": "none", "label": "No Assistance Needed"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'How many times do you fall in a typical month?', 'Please estimate the number of falls you experience', 'select', true, 18, NULL, '[{"value": "0", "label": "0 falls"}, {"value": "1-2", "label": "1-2 falls"}, {"value": "3-5", "label": "3-5 falls"}, {"value": "6+", "label": "6 or more falls"}]', NOW(), NOW());

  -- Living Situation Section
  INSERT INTO questions (id, survey_id, question_text, help_text, input_type, required, ui_order, validation, options, created_at, updated_at) VALUES
  (gen_random_uuid(), survey_id, 'What is your current living situation?', 'Please select your current living arrangement', 'select', true, 19, NULL, '[{"value": "alone", "label": "Living Alone"}, {"value": "spouse", "label": "Living with Spouse/Partner"}, {"value": "family", "label": "Living with Family"}, {"value": "roommate", "label": "Living with Roommate"}, {"value": "assisted-living", "label": "Assisted Living Facility"}, {"value": "nursing-home", "label": "Nursing Home"}, {"value": "other", "label": "Other"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Do you own or rent your home?', 'Please indicate your housing situation', 'select', true, 20, NULL, '[{"value": "own", "label": "Own"}, {"value": "rent", "label": "Rent"}, {"value": "family", "label": "Live with Family"}, {"value": "facility", "label": "Live in Facility"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'How many floors are in your home?', 'Please count the number of floors including basement', 'number', true, 21, '{"min": 1, "max": 10}', NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Do you have stairs in your home?', 'Please indicate if your home has stairs', 'radio', true, 22, NULL, '[{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Do you have any pets?', 'Please indicate if you have pets in your home', 'radio', true, 23, NULL, '[{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'How far is the nearest hospital from your home?', 'Please estimate the distance in miles', 'number', true, 24, '{"min": 0, "max": 100}', NULL, NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Do you have reliable transportation?', 'Please indicate your transportation situation', 'select', true, 25, NULL, '[{"value": "own-car", "label": "Own Car"}, {"value": "family-car", "label": "Family Member''s Car"}, {"value": "public-transit", "label": "Public Transportation"}, {"value": "taxi", "label": "Taxi/Rideshare"}, {"value": "none", "label": "No Transportation"}]', NOW(), NOW());

  -- Financial Information Section
  INSERT INTO questions (id, survey_id, question_text, help_text, input_type, required, ui_order, validation, options, created_at, updated_at) VALUES
  (gen_random_uuid(), survey_id, 'What is your approximate annual income?', 'This helps us estimate your care costs and available resources', 'select', true, 26, NULL, '[{"value": "under-25k", "label": "Under $25,000"}, {"value": "25k-50k", "label": "$25,000 - $50,000"}, {"value": "50k-75k", "label": "$50,000 - $75,000"}, {"value": "75k-100k", "label": "$75,000 - $100,000"}, {"value": "100k-150k", "label": "$100,000 - $150,000"}, {"value": "over-150k", "label": "Over $150,000"}, {"value": "prefer-not-to-say", "label": "Prefer not to say"}]', NOW(), NOW()),
  (gen_random_uuid(), survey_id, 'Do you have long-term care insurance?', 'Please indicate if you have long-term care insurance coverage', 'radio', true, 27, NULL, '[{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}, {"value": "unsure", "label": "I''m not sure"}]', NOW(), NOW());

END $$;
```

2. **`src/components/ErrorBoundary.tsx`** - Error boundary component

```typescript
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                We encountered an unexpected error. Please try refreshing the
                page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

3. **`src/components/LoadingSpinner.tsx`** - Reusable loading component

```typescript
import { LoadingSpinnerProps } from "../types";

export const LoadingSpinner = ({
  size = "md",
  text = "Loading...",
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-sky-600 ${sizeClasses[size]}`}
      ></div>
      {text && <p className="text-gray-600 mt-2 text-sm">{text}</p>}
    </div>
  );
};
```

4. **`src/components/EmptyState.tsx`** - Empty state component

```typescript
import { EmptyStateProps } from "../types";

export const EmptyState = ({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {action && action}
    </div>
  );
};
```

5. **Updated `src/types.ts`** - Add new component types

```typescript
// ... existing types ...

// Component Props
export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

// Enhanced validation types
export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  custom?: (value: any) => string | null;
}

// Enhanced question type
export interface Question {
  id: string;
  survey_id: string;
  question_text: string;
  help_text?: string;
  input_type: "text" | "number" | "date" | "select" | "radio" | "checkbox";
  required: boolean;
  ui_order: number;
  validation?: ValidationRules;
  options?: QuestionOption[];
  created_at: string;
  updated_at: string;
}

// ... rest of existing types ...
```

6. **`src/utils/validation.ts`** - Validation utilities

```typescript
import { ValidationRules } from "../types";

export const validateField = (
  value: any,
  rules: ValidationRules
): string | null => {
  // Required validation
  if (
    rules.required &&
    (!value || (Array.isArray(value) && value.length === 0))
  ) {
    return "This field is required";
  }

  // Skip other validations if value is empty and not required
  if (!value) return null;

  // Min/Max validation for numbers
  if (typeof value === "number" || !isNaN(Number(value))) {
    const numValue = Number(value);
    if (rules.min !== undefined && numValue < rules.min) {
      return `Value must be at least ${rules.min}`;
    }
    if (rules.max !== undefined && numValue > rules.max) {
      return `Value must be at most ${rules.max}`;
    }
  }

  // Pattern validation for strings
  if (typeof value === "string" && rules.pattern) {
    const regex = new RegExp(rules.pattern);
    if (!regex.test(value)) {
      return "Invalid format";
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};
```

7. **`src/utils/formatting.ts`** - Formatting utilities

```typescript
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(date);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};
```

8. **Updated `src/App.tsx`** - Add error boundary

```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { testConnection } from "./lib/supabase";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Home } from "./pages/index";
import { Dashboard } from "./pages/Dashboard";
import { Submissions } from "./pages/Submissions";
import { SubmissionList } from "./pages/Admin/SubmissionList";
import { UserManagement } from "./pages/Admin/UserManagement";
import { SurveyPage } from "./pages/SurveyPage";
import { ReviewSubmission } from "./pages/ReviewSubmission";
import "./App.css";

function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testConnection();
      setIsConnected(connected);
    };
    checkConnection();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <Submissions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute requireRole="admin">
                <SubmissionList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/survey/:slug"
            element={
              <ProtectedRoute>
                <SurveyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/review/:id"
            element={
              <ProtectedRoute>
                <ReviewSubmission />
              </ProtectedRoute>
            }
          />

          {/* Home route - smart redirector */}
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
```

**Commands to run:**

```bash
# Populate the database with sample data
psql -h your-supabase-host -U postgres -d postgres -f sample-data.sql

# Or use Supabase CLI
supabase db reset

# Test the complete application
npm run dev

# Test all user flows:
# 1. Sign up and complete the full 27-question survey
# 2. View AI-generated assessment
# 3. Test all admin features
# 4. Test error handling and edge cases
```

**What we'll accomplish:**

- Create comprehensive 27-question survey
- Add error boundaries and error handling
- Implement reusable components
- Add validation utilities
- Create formatting utilities
- Polish the user experience

**Result:** Production-ready application with real data

**Demo:** Show complete application with all features

**Key Features:**

- ✅ Comprehensive 27-question survey covering all care aspects
- ✅ Error boundaries for graceful error handling
- ✅ Reusable loading and empty state components
- ✅ Advanced validation system
- ✅ Utility functions for formatting
- ✅ Production-ready error handling
- ✅ Responsive design throughout
- ✅ Type safety with enhanced types
- ✅ User-friendly error messages
- ✅ Professional polish and UX

---

## Phase 9: Deployment

**🎬 Phase Overview:** Finally, let's deploy our application to make it available to users.

### Step 13: Production Deployment

**🎬 Step Script:** "Let's deploy our application to production so it's available for real users."

**What we'll accomplish:**

- Configure production environment
- Build optimized application
- Deploy to hosting platform
- Test production deployment

**Result:** Live, accessible survey intake application

**Demo:** Show live application in production

---

## Key Features Overview

### Core Features

- **Authentication System:** Email/password auth with role-based access
- **Survey System:** Single-question display with auto-save and progress tracking
- **Assessment System:** AI-powered care plan generation and cost estimation
- **User Dashboard:** Submission management and assessment viewing
- **Admin System:** Complete data oversight with filtering and search

### Technical Features

- **Auto-save:** Prevents data loss during survey completion
- **Progress Tracking:** Visual indicators of survey completion
- **Role-based Navigation:** Different menus for admins and users
- **Responsive Design:** Works on all devices
- **Type Safety:** Full TypeScript implementation

### AI Integration

- **Care Plan Generation:** Comprehensive long-term care plans
- **Cost Estimation:** Detailed cost breakdowns
- **OpenAI Integration:** GPT-5 powered assessments
- **Structured Display:** Beautiful presentation of AI results

### Data Management

- **27-Question Survey:** Comprehensive long-term care assessment
- **Assessment Storage:** AI-generated results stored in database
- **Security:** Row-level security for data protection
- **Audit Trail:** Complete data tracking

This feature-driven approach ensures that each step results in a working, demonstrable feature that adds immediate value to the application.
