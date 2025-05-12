
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
      {/* Sidebar is collapsible by icon by default in new AdminSidebar */}
      <SidebarProvider defaultOpen={true}> 
          <AdminSidebar />
          {/* Main content area will have its background set by the page or a wrapper inside children */}
          <SidebarInset className="bg-transparent flex flex-col"> {/* Changed to transparent to let page control bg, added flex flex-col */}
              <AdminHeader /> {/* Contains mobile trigger and global user actions */}
              {/* The main content area needs to fill remaining space if chat page is to be full height */}
              <main className="flex-1 overflow-y-auto" style={{ '--admin-header-height': '4rem' } as React.CSSProperties}> {/* Removed p-6 and bg-secondary/50, page will handle it */}
                  {children}
              </main>
          </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
