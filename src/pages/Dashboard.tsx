import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useUser } from "../hooks/useUser";
import ConfirmDialog from "../components/ConfirmDialog";

type Survey = {
  id: string;
  slug: string;
  title: string;
  description?: string;
};

type Submission = {
  id: string;
  survey_id: string;
  status: string;
  created_at: string;
  survey?: {
    title: string;
    slug: string;
  };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUser();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] =
    useState<Submission | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch available surveys
        const { data: surveysData } = await supabase
          .from("surveys")
          .select("*")
          .order("created_at", { ascending: false });

        setSurveys(surveysData || []);

        // Fetch user's submissions
        if (user) {
          const { data: submissionsData } = await supabase
            .from("submissions")
            .select(
              `
              *,
              survey:surveys(title, slug)
            `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          setSubmissions(submissionsData || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Completed",
      },
      in_progress: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "In Progress",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.in_progress;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const handleDeleteClick = (submission: Submission) => {
    setSubmissionToDelete(submission);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!submissionToDelete) return;

    setDeletingId(submissionToDelete.id);
    setShowDeleteDialog(false);

    try {
      // Delete answers first (due to foreign key constraint)
      const { error: answersError } = await supabase
        .from("answers")
        .delete()
        .eq("submission_id", submissionToDelete.id);

      if (answersError) {
        throw answersError;
      }

      // Delete the submission
      const { error: submissionError } = await supabase
        .from("submissions")
        .delete()
        .eq("id", submissionToDelete.id);

      if (submissionError) {
        throw submissionError;
      }

      // Update local state
      setSubmissions((prev) =>
        prev.filter((s) => s.id !== submissionToDelete.id)
      );
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission. Please try again.");
    } finally {
      setDeletingId(null);
      setSubmissionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setSubmissionToDelete(null);
  };

  const handleEditSubmission = (submission: Submission) => {
    if (submission.status === "completed") {
      // For completed submissions, allow editing by creating a new submission
      if (
        confirm(
          "This will create a new submission based on your previous answers. Continue?"
        )
      ) {
        navigate(`/survey/intake-2024?edit=${submission.id}`);
      }
    } else {
      // For in-progress submissions, continue editing
      navigate(`/survey/intake-2024?continue=${submission.id}`);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading your submissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-2xl font-semibold">Welcome to Waterlily</h1>
        <p className="mt-2 text-gray-600">
          Manage your long-term care assessment and view your submissions.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/survey/intake-2024")}
            className="p-6 border-2 border-dashed border-sky-300 rounded-lg hover:border-sky-400 hover:bg-sky-50 transition-colors text-left"
          >
            <div className="text-sky-600 font-medium">Take Assessment</div>
            <div className="text-sm text-gray-600 mt-1">
              Complete your long-term care intake assessment
            </div>
          </button>

          {submissions.length > 0 && (
            <button
              onClick={() => navigate(`/review/${submissions[0].id}`)}
              className="p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
            >
              <div className="text-green-600 font-medium">
                View Latest Submission
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Review your most recent assessment
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      {submissions.length > 0 ? (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            Your Assessment History
          </h2>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {submission.survey?.title || "Long-Term Care Assessment"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted on{" "}
                    {new Date(submission.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(submission.status)}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/review/${submission.id}`)}
                      className="text-sky-600 hover:text-sky-800 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditSubmission(submission)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      {submission.status === "completed" ? "Edit" : "Continue"}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(submission)}
                      disabled={deletingId === submission.id}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === submission.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No assessments completed yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start your long-term care assessment to get personalized
              recommendations.
            </p>
            <button
              onClick={() => navigate("/survey/intake-2024")}
              className="btn-primary"
            >
              Start Assessment
            </button>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">About Your Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-1">Comprehensive</div>
            <div className="text-blue-700">
              Covers all aspects of your care needs including health, financial,
              and living situation.
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="font-medium text-green-900 mb-1">Personalized</div>
            <div className="text-green-700">
              Get tailored recommendations based on your specific situation and
              preferences.
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-900 mb-1">Secure</div>
            <div className="text-purple-700">
              Your information is protected and only used to provide you with
              better care options.
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Submission"
        message={`Are you sure you want to delete this submission? This action cannot be undone and will permanently remove all your answers for this assessment.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
    </div>
  );
}
