
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
           {/* Main content area adjusted to be full height */}
          <SidebarInset className="bg-secondary/30 flex flex-col"> 
              <StudentHeader />
               {/* Main content padding and allow scrolling */}
              <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                  {children}
              </main>
          </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
