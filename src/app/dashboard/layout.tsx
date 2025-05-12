
import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentHeader } from "@/components/layout/student-header";


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
    <ProtectedRoute adminOnly={false}> {/* Students and other non-admin users */}
      <SidebarProvider defaultOpen={true}> {/* Sidebar is always open for student dashboard design */}
          <StudentSidebar />
           {/* Ensure SidebarInset takes full height and main content area scrolls */}
          <SidebarInset className="bg-secondary/30 flex flex-col h-screen overflow-hidden"> {/* Added h-screen and overflow-hidden */}
              <StudentHeader />
               {/* Main content should allow internal scrolling, padding is handled by page now */}
              <main className="flex-1 overflow-y-auto"> {/* Removed padding, page will handle it */}
                  {children}
              </main>
          </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
