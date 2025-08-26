import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function Home() {
  const navigate = useNavigate();
  const user = useUser();

  useEffect(() => {
    if (user === null) {
      // User is not authenticated, redirect to sign in
      navigate("/signin");
    } else if (user) {
      // User is authenticated, redirect based on role
      if (user.role === "admin") {
        navigate("/admin/submissions");
      } else {
        // Regular user - redirect to survey or dashboard
        navigate("/survey/intake-2024");
      }
    }
  }, [user, navigate]);

  // Show loading while checking auth state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg">Loading...</div>
      </div>
    </div>
  );
}
