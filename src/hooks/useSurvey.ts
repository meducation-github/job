import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Question } from "../types";

export type Survey = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  created_at: string;
};

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

        // Fetch survey by slug
        const { data: surveyData, error: surveyError } = await supabase
          .from("surveys")
          .select("*")
          .eq("slug", slug)
          .single();

        if (surveyError) {
          throw new Error("Survey not found");
        }

        setSurvey(surveyData);

        // Fetch questions for this survey
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("survey_id", surveyData.id)
          .order("ui_order");

        if (questionsError) {
          throw new Error("Failed to load questions");
        }

        setQuestions(questionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchSurvey();
    }
  }, [slug]);

  return { survey, questions, loading, error };
}
