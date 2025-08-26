export type Question = {
  id: string;
  survey_id: string;
  ui_order: number;
  question_text: string;
  help_text?: string | null;
  input_type: "text" | "number" | "date" | "select" | "radio" | "checkbox";
  options?: { label: string; value: string }[] | null;
  required?: boolean;
  validation?: Record<string, any> | null;
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

export type UserRole = "admin" | "user";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};
