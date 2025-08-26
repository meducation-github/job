import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type Submission = {
  id: string;
  survey_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  survey?: {
    title: string;
    slug: string;
  };
  user?: {
    full_name: string;
    email: string;
  };
};

export default function AdminSubmissionList() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("submissions")
          .select(
            `
            *,
            survey:surveys(title, slug),
            user:profiles(full_name, email)
          `
          )
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw new Error("Failed to load submissions");
        }

        setSubmissions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, []);

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

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading submissions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Survey Submissions</h1>
            <p className="mt-1 text-gray-600">
              Review all survey submissions from users
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Total: {submissions.length} submissions
            </div>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-gray-600">No submissions found.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Survey
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Submitted
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {submission.user?.full_name || "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.user?.email || "No email"}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {submission.survey?.title || "Unknown Survey"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/review/${submission.id}`)}
                        className="text-sky-600 hover:text-sky-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
