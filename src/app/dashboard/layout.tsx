import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "My Dashboard - DigiSpark",
  description: "Your personal DigiSpark dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // Protect this route for any logged-in user (adminOnly is false by default or explicitly set)
    <ProtectedRoute adminOnly={false}>
      {/* 
        The AuthAwareLayout will handle Navbar and Footer for /dashboard routes
        if we want them. For a cleaner dashboard view, they can be omitted here
        and a specific DashboardHeader could be added if needed.
      */}
      {children}
    </ProtectedRoute>
  );
}
