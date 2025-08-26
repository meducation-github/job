import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSurvey } from "../hooks/useSurvey";
import QuestionSingle from "../components/QuestionSingle";
import ProgressBar from "../components/ProgressBar";
import { supabase } from "../lib/supabase";
import type { AnswerRow } from "../types";

export default function SurveyPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { survey, questions, loading, error } = useSurvey(slug!);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRow>>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const editSubmissionId = searchParams.get("edit");
  const continueSubmissionId = searchParams.get("continue");

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  // Load existing answers if editing or continuing
  useEffect(() => {
    async function loadExistingAnswers() {
      if (!editSubmissionId && !continueSubmissionId) return;

      setLoadingAnswers(true);
      try {
        const submissionToLoad = editSubmissionId || continueSubmissionId;

        // Get the submission
        const { data: submissionData, error: submissionError } = await supabase
          .from("submissions")
          .select("*")
          .eq("id", submissionToLoad)
          .single();

        if (submissionError) throw submissionError;

        // If editing a completed submission, create a new one
        if (editSubmissionId && submissionData.status === "completed") {
          const { data: newSubmission, error: newSubmissionError } =
            await supabase
              .from("submissions")
              .insert([
                {
                  survey_id: submissionData.survey_id,
                  user_id: submissionData.user_id,
                  status: "in_progress",
                },
              ])
              .select()
              .single();

          if (newSubmissionError) throw newSubmissionError;
          setSubmissionId(newSubmission.id);
        } else {
          setSubmissionId(submissionData.id);
        }

        // Get existing answers
        const { data: answersData, error: answersError } = await supabase
          .from("answers")
          .select("*")
          .eq("submission_id", submissionToLoad);

        if (answersError) throw answersError;

        // Convert answers to the format expected by the component
        const answersMap = answersData.reduce((acc, answer) => {
          acc[answer.question_id] = answer;
          return acc;
        }, {} as Record<string, AnswerRow>);

        setAnswers(answersMap);
      } catch (error) {
        console.error("Error loading existing answers:", error);
        alert("Failed to load existing answers. Starting fresh.");
      } finally {
        setLoadingAnswers(false);
      }
    }

    loadExistingAnswers();
  }, [editSubmissionId, continueSubmissionId]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      // Survey completed, redirect to review
      if (submissionId) {
        navigate(`/review/${submissionId}`);
      }
    }
  }, [currentQuestionIndex, questions.length, submissionId, navigate]);

  if (loading || loadingAnswers) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">
            {loadingAnswers
              ? "Loading your previous answers..."
              : "Loading survey..."}
          </div>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error || "Survey not found"}</p>
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

  if (questions.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold">{survey.title}</h2>
          <p className="mt-2 text-gray-600">
            No questions found for this survey.
          </p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete the survey
      completeSurvey();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSaved = (answer: AnswerRow, sid: string) => {
    setAnswers((prev) => ({ ...prev, [answer.question_id]: answer }));
    setSubmissionId(sid);
  };

  const completeSurvey = async () => {
    if (submissionId) {
      // Update submission status to completed
      const { error } = await supabase
        .from("submissions")
        .update({ status: "completed" })
        .eq("id", submissionId);

      if (!error) {
        navigate(`/review/${submissionId}`);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-semibold">{survey.title}</h1>
        {survey.description && (
          <p className="mt-2 text-gray-600">{survey.description}</p>
        )}
        {(editSubmissionId || continueSubmissionId) && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {editSubmissionId
                ? "Editing your previous submission. Your answers will be pre-filled."
                : "Continuing your in-progress submission."}
            </p>
          </div>
        )}
        <div className="mt-4">
          <ProgressBar progress={progress} />
          <div className="mt-2 text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </div>

      {currentQuestion && (
        <QuestionSingle
          question={currentQuestion}
          submissionId={submissionId}
          answer={answers[currentQuestion.id]}
          autoFocus={true}
          onSaved={handleSaved}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
}
