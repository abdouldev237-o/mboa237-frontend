// src/layouts/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

/**
 * Layout dashboard — garde la Navbar Mboa237 mais sans le Footer.
 */
export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}