
import type { Metadata } from "next";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";


export const metadata: Metadata = {
  title: "Admin - AdminSchool", // Updated title
  description: "Admin panel for AdminSchool.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute adminOnly={true}>
      <SidebarProvider defaultOpen={true}>
          <AdminSidebar />
          {/* Ensure SidebarInset takes full height and main content area scrolls */}
          <SidebarInset className="bg-secondary/30 flex flex-col h-screen overflow-hidden"> {/* Added h-screen and overflow-hidden */}
              <AdminHeader /> {/* Header takes its own height */}
              {/* Main content area should fill remaining space and allow internal scrolling */}
              <main className="flex-1 overflow-y-auto"> {/* Removed custom style, rely on flex-1 and overflow */}
                  {children}
              </main>
          </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
