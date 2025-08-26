import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "./Nav";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[var(--max-width)] mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
