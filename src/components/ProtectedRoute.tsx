import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  if (user === undefined) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}
