# Survey Intake Application - Complete Build Guide

This guide will walk you through building a complete survey intake application with React, TypeScript, Tailwind CSS, and Supabase. The app includes user authentication, role-based access control, survey management, and submission handling.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account
- Basic knowledge of React, TypeScript, and SQL

## Phase 1: Project Setup

### Step 1: Create React Project with Vite

```bash
npm create vite@latest survey-intake-app -- --template react-ts
cd survey-intake-app
npm install
```

### Step 2: Install Core Dependencies

```bash
npm install react-router-dom @supabase/supabase-js
npm install -D @types/node
```

### Step 3: Setup Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Update `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
    },
  },
  plugins: [],
};
```

**Update `src/index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --max-width: 1200px;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
    "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

.btn-primary {
  @apply px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors;
}

.btn-ghost {
  @apply px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors;
}
```

### Step 4: Setup TypeScript Configuration

**Update `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Phase 2: Supabase Setup

### Step 5: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### Step 6: Setup Supabase Client

**Create `src/lib/supabase.ts`:**

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Create `.env.local`:**

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 7: Create Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS
alter table auth.users enable row level security;

-- profiles table
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- surveys table
create table surveys (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- questions table
create table questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id) on delete cascade,
  ui_order integer not null,
  question_text text not null,
  help_text text,
  input_type text not null,
  options jsonb,
  required boolean default false,
  validation jsonb,
  created_at timestamptz default now()
);

-- submissions table
create table submissions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id) on delete cascade,
  user_id uuid references profiles(id),
  status text default 'in_progress',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- answers table
create table answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade,
  question_id uuid references questions(id),
  answer_text text,
  answer_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- audit_logs table
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor uuid references profiles(id),
  action text not null,
  object_type text,
  object_id uuid,
  meta jsonb,
  created_at timestamptz default now()
);

-- RLS Policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Anyone can view surveys" on surveys
  for select using (true);

create policy "Anyone can view questions" on questions
  for select using (true);

create policy "Users can view own submissions" on submissions
  for select using (auth.uid() = user_id);

create policy "Users can insert own submissions" on submissions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own submissions" on submissions
  for update using (auth.uid() = user_id);

create policy "Users can delete own submissions" on submissions
  for delete using (auth.uid() = user_id);

create policy "Users can view own answers" on answers
  for select using (
    submission_id in (
      select id from submissions where user_id = auth.uid()
    )
  );

create policy "Users can insert own answers" on answers
  for insert with check (
    submission_id in (
      select id from submissions where user_id = auth.uid()
    )
  );

create policy "Users can update own answers" on answers
  for update using (
    submission_id in (
      select id from submissions where user_id = auth.uid()
    )
  );

create policy "Users can delete own answers" on answers
  for delete using (
    submission_id in (
      select id from submissions where user_id = auth.uid()
    )
  );

-- Admin policies (for waterlily-admin@yopmail.com)
create policy "Admins can view all submissions" on submissions
  for select using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.email = 'waterlily-admin@yopmail.com'
    )
  );

create policy "Admins can view all answers" on answers
  for select using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.email = 'waterlily-admin@yopmail.com'
    )
  );

create policy "Admins can view all profiles" on profiles
  for select using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.email = 'waterlily-admin@yopmail.com'
    )
  );
```

### Step 8: Insert Sample Data

Run this SQL to populate the database with sample survey data:

```sql
-- Insert sample survey
INSERT INTO surveys (slug, title, description)
VALUES ('intake-2024', 'Long-Term Care Intake Assessment', 'Comprehensive assessment for long-term care planning and cost prediction.');

-- Insert sample questions (27 questions total)
INSERT INTO questions (survey_id, ui_order, question_text, help_text, input_type, required) VALUES
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 1, 'What is your full name?', 'Please enter your legal name as it appears on official documents.', 'text', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 2, 'What is your date of birth?', 'MM/DD/YYYY format', 'date', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 3, 'What is your current age?', 'Enter your age in years', 'number', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 4, 'What is your gender?', 'Please select your gender identity', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 5, 'What is your marital status?', 'Current marital status', 'select', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 6, 'What is your current address?', 'Include street address, city, state, and zip code', 'text', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 7, 'What is your phone number?', 'Include area code', 'text', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 8, 'What is your email address?', 'We will use this for important communications', 'text', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 9, 'What is your annual household income?', 'Before taxes', 'number', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 10, 'What is the total value of your assets?', 'Including savings, investments, property, etc.', 'number', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 11, 'Do you have long-term care insurance?', 'Select yes if you have any long-term care insurance policy', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 12, 'What is your current health status?', 'Please describe any chronic conditions or health concerns', 'text', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 13, 'Do you have any mobility limitations?', 'Difficulty walking, using stairs, or getting around', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 14, 'Do you need assistance with bathing?', 'Help with getting in/out of shower or bath', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 15, 'Do you need assistance with dressing?', 'Help with putting on clothes, shoes, etc.', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 16, 'Do you need assistance with eating?', 'Help with cutting food, using utensils, etc.', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 17, 'Do you need assistance with toileting?', 'Help with using the bathroom', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 18, 'Do you need assistance with transferring?', 'Help getting in/out of bed, chairs, etc.', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 19, 'Can you manage your medications independently?', 'Taking correct doses at correct times', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 20, 'Can you prepare your own meals?', 'Planning and cooking meals', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 21, 'Can you manage your finances?', 'Paying bills, managing accounts', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 22, 'Can you use transportation independently?', 'Driving, public transit, ride services', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 23, 'Do you currently receive any care services?', 'Home health, personal care, etc.', 'radio', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 24, 'What type of care setting do you prefer?', 'Select all that apply', 'checkbox', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 25, 'Who is your emergency contact?', 'Name and relationship', 'text', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 26, 'What is your emergency contact phone number?', 'Include area code', 'text', true),
((SELECT id FROM surveys WHERE slug = 'intake-2024'), 27, 'Is there anything else you would like us to know?', 'Additional information that might be relevant', 'text', false);

-- Add options for select/radio/checkbox questions
UPDATE questions SET options = '[{"label":"Male","value":"male"},{"label":"Female","value":"female"},{"label":"Other","value":"other"}]' WHERE ui_order = 4;

UPDATE questions SET options = '[{"label":"Single","value":"single"},{"label":"Married","value":"married"},{"label":"Divorced","value":"divorced"},{"label":"Widowed","value":"widowed"}]' WHERE ui_order = 5;

UPDATE questions SET options = '[{"label":"Yes","value":"yes"},{"label":"No","value":"no"}]' WHERE ui_order IN (11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23);

UPDATE questions SET options = '[{"label":"Home care","value":"home_care"},{"label":"Assisted living","value":"assisted_living"},{"label":"Nursing home","value":"nursing_home"},{"label":"Memory care","value":"memory_care"},{"label":"Independent living","value":"independent_living"}]' WHERE ui_order = 24;
```

## Phase 3: Type Definitions

### Step 9: Create Type Definitions

**Create `src/types.ts`:**

```typescript
export type Question = {
  id: string;
  survey_id: string;
  ui_order: number;
  question_text: string;
  help_text?: string;
  input_type: string;
  options?: any[];
  required: boolean;
  validation?: any;
  created_at: string;
};

export type AnswerRow = {
  id?: string;
  submission_id: string;
  question_id: string;
  answer_text?: string | null;
  answer_json?: any | null;
  created_at?: string;
  updated_at?: string;
};

export type UserRole = "admin" | "user";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

export type Survey = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  created_by?: string;
  created_at: string;
};

export type Submission = {
  id: string;
  survey_id: string;
  user_id: string;
  status: "in_progress" | "completed";
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name?: string;
  phone?: string;
  created_at: string;
};
```

## Phase 4: Custom Hooks

### Step 10: Create Authentication Hook

**Create `src/hooks/useUser.ts`:**

```typescript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type UserRole = "admin" | "user";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        const role: UserRole =
          data.session.user.email === "waterlily-admin@yopmail.com"
            ? "admin"
            : "user";
        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          role,
        });
      } else {
        setUser(null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const role: UserRole =
            session.user.email === "waterlily-admin@yopmail.com"
              ? "admin"
              : "user";
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return user;
}
```

### Step 11: Create Survey Hook

**Create `src/hooks/useSurvey.ts`:**

```typescript
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Survey, Question } from "../types";

export function useSurvey(slug: string) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSurvey() {
      try {
        setLoading(true);
        setError(null);

        // Fetch survey
        const { data: surveyData, error: surveyError } = await supabase
          .from("surveys")
          .select("*")
          .eq("slug", slug)
          .single();

        if (surveyError) {
          throw new Error("Survey not found");
        }

        setSurvey(surveyData);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("survey_id", surveyData.id)
          .order("ui_order", { ascending: true });

        if (questionsError) {
          throw new Error("Failed to load questions");
        }

        setQuestions(questionsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchSurvey();
  }, [slug]);

  return { survey, questions, loading, error };
}
```

## Phase 5: Core Components

### Step 12: Create Layout Component

**Create `src/components/Layout.tsx`:**

```typescript
import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "./Nav";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-[var(--max-width)] mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
```

### Step 13: Create Navigation Component

**Create `src/components/Nav.tsx`:**

```typescript
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useUser } from "../hooks/useUser";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/signin");
  }

  // Don't show nav on auth pages
  if (location.pathname === "/signin" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-[var(--max-width)] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-semibold text-sky-600">
            Waterlily
          </Link>
          {user && (
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              {user.role === "admin" ? (
                <>
                  <Link
                    to="/admin/submissions"
                    className={`hover:text-sky-600 ${
                      location.pathname === "/admin/submissions"
                        ? "text-sky-600"
                        : ""
                    }`}
                  >
                    All Submissions
                  </Link>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    Admin
                  </span>
                </>
              ) : (
                <>
                  <Link
                    to="/survey/intake-2024"
                    className={`hover:text-sky-600 ${
                      location.pathname.startsWith("/survey")
                        ? "text-sky-600"
                        : ""
                    }`}
                  >
                    Take Survey
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`hover:text-sky-600 ${
                      location.pathname === "/dashboard" ? "text-sky-600" : ""
                    }`}
                  >
                    My Submissions
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:block text-sm text-gray-600">
                Welcome, {user.email}
                {user.role === "admin" && (
                  <span className="ml-2 text-purple-600 font-medium">
                    (Admin)
                  </span>
                )}
              </div>
              <button
                onClick={signOut}
                className="text-sm text-gray-600 hover:text-sky-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/signin"
                className="text-sm text-gray-600 hover:text-sky-600"
              >
                Sign in
              </Link>
              <Link to="/signup" className="text-sm btn-primary">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
```

### Step 14: Create Protected Route Component

**Create `src/components/ProtectedRoute.tsx`:**

```typescript
import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const user = useUser();

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (user === null) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
```

### Step 15: Create Progress Bar Component

**Create `src/components/ProgressBar.tsx`:**

```typescript
import React from "react";

type Props = {
  progress: number;
};

export default function ProgressBar({ progress }: Props) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-sky-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

### Step 16: Create Question Renderer Component

**Create `src/components/QuestionRenderer.tsx`:**

```typescript
import React from "react";
import type { Question } from "../types";

type Props = {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  autoFocus?: boolean;
};

export default function QuestionRenderer({
  question,
  value,
  onChange,
  autoFocus = false,
}: Props) {
  const renderInput = () => {
    switch (question.input_type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            autoFocus={autoFocus}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            autoFocus={autoFocus}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            autoFocus={autoFocus}
          />
        );

      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            autoFocus={autoFocus}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case "checkbox":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option.value]);
                    } else {
                      onChange(
                        selectedValues.filter((v) => v !== option.value)
                      );
                    }
                  }}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            autoFocus={autoFocus}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {question.question_text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {question.help_text && (
          <p className="text-sm text-gray-500 mb-2">{question.help_text}</p>
        )}
      </div>
      {renderInput()}
    </div>
  );
}
```

### Step 17: Create Question Single Component

**Create `src/components/QuestionSingle.tsx`:**

```typescript
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Question, AnswerRow } from "../types";
import QuestionRenderer from "./QuestionRenderer";

type Props = {
  question: Question;
  submissionId: string | null;
  answer?: AnswerRow | null;
  autoFocus?: boolean;
  onSaved?: (answer: AnswerRow, submissionId: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

export default function QuestionSingle({
  question,
  submissionId: submissionIdProp,
  answer,
  autoFocus = false,
  onSaved,
  onNext,
  onPrev,
}: Props) {
  const mountedRef = useRef(true);
  const [localValue, setLocalValue] = useState<any>(() => {
    if (!answer) return "";
    return answer.answer_json ?? answer.answer_text ?? "";
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [submissionId, setSubmissionId] = useState<string | null>(
    submissionIdProp
  );
  const saveTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    if (autoFocus && inputRef.current) inputRef.current.focus();
    return () => {
      mountedRef.current = false;
    };
  }, [autoFocus]);

  // sync if answer prop changes (e.g., parent loaded saved answers)
  useEffect(() => {
    setLocalValue(answer ? answer.answer_json ?? answer.answer_text ?? "" : "");
  }, [answer?.id]);

  // Debounced save
  useEffect(() => {
    // skip initial empty state
    if (typeof localValue === "undefined") return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void saveAnswer();
    }, 800);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue]);

  async function ensureSubmission() {
    if (submissionId) return submissionId;
    // create an in_progress submission
    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("submissions")
      .insert([
        {
          survey_id: question.survey_id,
          user_id: userId,
          status: "in_progress",
        },
      ])
      .select()
      .single();
    if (error) throw error;
    setSubmissionId(data.id);
    return data.id;
  }

  async function saveAnswer() {
    try {
      setStatus("saving");
      const sid = await ensureSubmission();
      // prepare payload depending on input type
      const payload: Partial<AnswerRow> = {
        submission_id: sid,
        question_id: question.id,
      };

      // differentiate between structured and plain
      if (question.input_type === "checkbox" || Array.isArray(localValue)) {
        payload.answer_json = localValue;
      } else {
        payload.answer_text = localValue;
      }

      // upsert the answer
      const { data, error } = await supabase
        .from("answers")
        .upsert(payload, {
          onConflict: "submission_id,question_id",
        })
        .select()
        .single();

      if (error) throw error;

      if (mountedRef.current) {
        setStatus("saved");
        onSaved?.(data, sid);
        // clear saved status after a moment
        setTimeout(() => {
          if (mountedRef.current) setStatus("idle");
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      if (mountedRef.current) setStatus("error");
    }
  }

  return (
    <div className="card">
      <div className="mb-6">
        <QuestionRenderer
          question={question}
          value={localValue}
          onChange={setLocalValue}
          autoFocus={autoFocus}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onPrev && (
            <button onClick={onPrev} className="btn-ghost" type="button">
              Previous
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {status === "saving" && "Saving..."}
            {status === "saved" && "Saved"}
            {status === "error" && "Error saving"}
          </div>

          {onNext && (
            <button
              onClick={onNext}
              className="btn-primary"
              type="button"
              disabled={question.required && !localValue}
            >
              {onPrev ? "Next" : "Start"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 18: Create Confirmation Dialog Component

**Create `src/components/ConfirmDialog.tsx`:**

```typescript
import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "info",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getButtonStyles = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
      default:
        return "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Phase 6: Authentication Pages

### Step 19: Create Sign In Page

**Create `src/pages/SignIn.tsx`:**

```typescript
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Redirect based on user role
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === "waterlily-admin@yopmail.com") {
        navigate("/admin/submissions");
      } else {
        navigate("/survey/intake-2024");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) =>
```
