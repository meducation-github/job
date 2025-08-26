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
