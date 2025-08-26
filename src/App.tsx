import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import SurveyPage from "./pages/SurveyPage";
import ReviewSubmission from "./pages/ReveiwSubmission";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminSubmissionList from "./pages/Admin/SubmissionList";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/survey/:slug"
          element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review/:id"
          element={
            <ProtectedRoute>
              <ReviewSubmission />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute>
              <AdminSubmissionList />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
