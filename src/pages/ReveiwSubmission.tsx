import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { AnswerRow } from "../types";
import AssessmentDisplay from "../components/AssessmentDisplay";

type Submission = {
  id: string;
  survey_id: string;
  user_id: string;
  status: string;
  assessment?: any | null;
  created_at: string;
  updated_at: string;
};

type Question = {
  id: string;
  question_text: string;
  help_text?: string;
  input_type: string;
  options?: { label: string; value: string }[];
};

export default function ReviewSubmission() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        setLoading(true);
        setError(null);

        // Fetch submission
        const { data: submissionData, error: submissionError } = await supabase
          .from("submissions")
          .select("*")
          .eq("id", id)
          .single();

        if (submissionError) {
          throw new Error("Submission not found");
        }

        setSubmission(submissionData);

        // Fetch answers
        const { data: answersData, error: answersError } = await supabase
          .from("answers")
          .select("*")
          .eq("submission_id", id)
          .order("created_at");

        if (answersError) {
          throw new Error("Failed to load answers");
        }

        setAnswers(answersData);

        // Fetch questions for all answers
        if (answersData.length > 0) {
          const questionIds = answersData.map((a) => a.question_id);
          const { data: questionsData, error: questionsError } = await supabase
            .from("questions")
            .select("*")
            .in("id", questionIds);

          if (questionsError) {
            throw new Error("Failed to load questions");
          }

          const questionsMap = questionsData.reduce((acc, q) => {
            acc[q.id] = q;
            return acc;
          }, {} as Record<string, Question>);

          setQuestions(questionsMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const formatAnswer = (answer: AnswerRow, question: Question) => {
    if (answer.answer_json) {
      if (Array.isArray(answer.answer_json)) {
        return answer.answer_json.join(", ");
      }
      return JSON.stringify(answer.answer_json);
    }
    return answer.answer_text || "No answer provided";
  };

  const getOptionLabel = (
    value: string,
    options?: { label: string; value: string }[]
  ) => {
    if (!options) return value;
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading submission...</div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">
            {error || "Submission not found"}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Survey Submission Review</h1>
            <p className="mt-1 text-gray-600">
              Submitted on{" "}
              {new Date(submission.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                submission.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {submission.status}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Submission Answers */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Survey Responses
          </h2>
          <div className="space-y-4">
            {answers.map((answer) => {
              const question = questions[answer.question_id];
              if (!question) return null;

              return (
                <div key={answer.id} className="card">
                  <h3 className="text-lg font-medium">
                    {question.question_text}
                  </h3>
                  {question.help_text && (
                    <p className="text-sm text-gray-500 mt-1">
                      {question.help_text}
                    </p>
                  )}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">
                      {formatAnswer(answer, question)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Assessment */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Care Assessment
          </h2>
          <AssessmentDisplay assessment={submission.assessment} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex gap-4">
        <button onClick={() => navigate("/dashboard")} className="btn-primary">
          Back to Dashboard
        </button>
        <button onClick={() => window.print()} className="btn-ghost">
          Print
        </button>
      </div>
    </div>
  );
}
