# Waterlily Survey Intake System

A comprehensive survey intake application built with React, TypeScript, and Supabase for collecting demographic, health, and financial information to predict long-term care needs and costs.

## Features

### Core Functionality

- **Dual Authentication System**: Separate login flows for admin and regular users
- **Role-Based Access**: Admin users get access to all submissions, regular users see only their own
- **Comprehensive Survey Form**: 27 detailed questions covering all aspects of long-term care assessment
- **User Authentication**: Secure sign-up and sign-in with Supabase Auth
- **Survey Interface**: Single-question display format with smooth navigation
- **Progress Tracking**: Visual progress indicator showing completion status
- **Auto-save**: Answers are automatically saved as users progress through questions
- **Survey Review**: Complete submission review with print functionality
- **Admin Dashboard**: View all submissions with filtering and search capabilities

### Enhanced UX Features

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Form Validation**: Required field validation and input constraints
- **Navigation Controls**: Previous/Next buttons with keyboard shortcuts (Enter to advance)
- **Real-time Status**: Live saving indicators and error handling
- **Modern UI**: Clean, accessible interface with Tailwind CSS

### Question Types Supported

- Text input (single and multi-line)
- Number input
- Date picker
- Single select dropdown
- Radio button groups
- Checkbox groups (multiple selection)

### Comprehensive Survey Coverage

The survey includes detailed questions covering:

**Personal Information**

- Full legal name, date of birth, gender, marital status
- Current living situation and contact information

**Financial Assessment**

- Annual household income and asset values
- Long-term care insurance status
- Home ownership information

**Health Evaluation**

- Overall health status rating
- Specific health conditions (Alzheimer's, arthritis, cancer, COPD, diabetes, etc.)
- Medication management needs
- Mobility limitations

**Activities of Daily Living (ADLs)**

- Basic ADLs: bathing, dressing, eating, toileting, transferring, ambulating
- Instrumental ADLs: medication management, finances, shopping, cooking, housekeeping

**Current Care Situation**

- Formal care services received
- Hours of care per week
- Primary caregiver identification

**Care Preferences**

- Preferred care setting
- Primary concerns about long-term care
- Timeline for needing services
- Emergency contact information

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account and project created

### 2. Environment Setup

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema

Run the provided SQL schema in your Supabase SQL editor:

```sql
-- users are managed by Supabase Auth. We'll store profile in a table.
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- surveys (a single intake survey; could support many versions)
create table surveys (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- questions
create table questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id) on delete cascade,
  ui_order integer not null,
  question_text text not null,
  help_text text,
  input_type text not null, -- 'text','number','date','select','radio','checkbox'
  options jsonb,            -- for select/radio/checkbox: [{"label":"Male","value":"male"},...]
  required boolean default false,
  validation jsonb,         -- e.g. {"min":0,"max":120,"pattern":"^[0-9]+$"}
  created_at timestamptz default now()
);

-- top-level submission metadata
create table submissions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id) on delete cascade,
  user_id uuid references profiles(id),
  status text default 'completed', -- 'in_progress','completed'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- individual answers (one row per question answer)
create table answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id) on delete cascade,
  question_id uuid references questions(id),
  answer_text text,      -- canonical single column for all answers; use JSON for structured answers
  answer_json jsonb,     -- use when answer is structured (arrays/objects)
  created_at timestamptz default now()
);

-- optional: audit logs
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor uuid references profiles(id),
  action text not null,
  object_type text,
  object_id uuid,
  meta jsonb,
  created_at timestamptz default now()
);
```

### 4. Sample Data

Run the `sample-data.sql` file in your Supabase SQL editor to populate the database with a comprehensive survey and 27 detailed questions.

### 5. Install Dependencies

```bash
npm install
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Authentication & User Roles

### Admin Access

- **Email**: `waterlily-admin@yopmail.com`
- **Password**: Any password (you'll need to create this account in Supabase Auth)
- **Access**: Full admin dashboard with all submissions
- **Redirect**: Goes directly to `/admin/submissions` after login

### Regular Users

- **Access**: Can sign up with any email (except admin email)
- **Features**: Take surveys, view own submissions
- **Redirect**: Goes directly to `/survey/intake-2024` after login

### Role Detection

The system automatically detects user roles based on email:

- If email matches `waterlily-admin@yopmail.com` → Admin role
- All other emails → Regular user role

## Usage

### For Regular Users

1. **Sign Up/In**: Create an account or sign in with any email (except admin email)
2. **Survey Access**: Automatically redirected to the comprehensive assessment
3. **Take Assessment**: Complete the 27-question long-term care intake form
4. **Review**: View your completed submission with detailed responses
5. **Dashboard**: Access your submission history and take new assessments

### For Administrators

1. **Admin Login**: Sign in with `waterlily-admin@yopmail.com`
2. **Admin Dashboard**: Access `/admin/submissions` to view all user submissions
3. **Submission Review**: Click "View Details" to see individual responses
4. **Data Analysis**: Use Supabase dashboard for data export and analysis

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Nav.tsx         # Navigation component with role-based menu
│   ├── ProgressBar.tsx # Survey progress indicator
│   ├── QuestionSingle.tsx # Individual question display
│   ├── QuestionRenderer.tsx # Question input renderer
│   └── ProtectedRoute.tsx # Authentication guard
├── hooks/              # Custom React hooks
│   ├── useUser.ts      # User authentication state with role detection
│   └── useSurvey.ts    # Survey data fetching
├── lib/                # External service configurations
│   └── supabase.ts     # Supabase client setup
├── pages/              # Page components
│   ├── Dashboard.tsx   # User dashboard with submission history
│   ├── SurveyPage.tsx  # Survey interface
│   ├── ReviewSubmission.tsx # Submission review
│   ├── SignIn.tsx      # Authentication with role-based redirects
│   ├── SignUp.tsx      # User registration
│   └── Admin/          # Admin pages
└── types.ts            # TypeScript type definitions
```

## Key Features Explained

### Dual Authentication System

The application uses a single sign-in form that automatically detects user roles based on email address. Admin users get access to the full admin dashboard, while regular users are directed to the survey interface.

### Comprehensive Survey Form

The 27-question survey covers all critical aspects of long-term care assessment:

- **Personal & Contact Information**: Basic demographics and contact details
- **Financial Assessment**: Income, assets, insurance, and home ownership
- **Health Evaluation**: Current health status, conditions, and medication needs
- **Functional Assessment**: ADLs and IADLs to determine care needs
- **Current Care Situation**: Existing services and support network
- **Care Preferences**: Preferred settings and timeline for services

### Single-Question Display

The survey uses a single-question display format to reduce cognitive load and improve completion rates. Users focus on one question at a time, with clear navigation controls.

### Auto-Save Functionality

Answers are automatically saved as users type, with a debounced save mechanism (800ms delay) to prevent excessive API calls while ensuring data persistence.

### Progress Tracking

A visual progress bar shows completion percentage, helping users understand their progress through the comprehensive assessment.

### Responsive Design

The application is fully responsive and works well on mobile devices, with touch-friendly controls and appropriate spacing.

## Future Enhancements

- **Survey Templates**: Pre-built survey templates for different use cases
- **Advanced Validation**: Custom validation rules and error messages
- **Data Export**: CSV/Excel export functionality for admins
- **Analytics Dashboard**: Survey completion analytics and insights
- **Multi-language Support**: Internationalization for different languages
- **Offline Support**: Progressive Web App capabilities for offline survey completion
- **Care Recommendations**: AI-powered care recommendations based on survey responses
- **Cost Estimates**: Automated cost estimates for different care options

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
