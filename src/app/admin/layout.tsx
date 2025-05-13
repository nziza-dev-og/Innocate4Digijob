
import type { Metadata } from "next";
// AdminHeader is removed as its functionality will be integrated into the dashboard page.
// import { AdminHeader } from "@/components/layout/admin-header"; 
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin - DigiSpark", // Updated title to DigiSpark
  description: "Admin panel for DigiSpark.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute adminOnly={true}>
      {/* Applying 'dark' class here to force dark theme for admin section */}
      <div className={cn("dark admin-page-override")}> {/* Ensures dark theme variables are applied */}
        <SidebarProvider defaultOpen={true}> {/* Keep sidebar open by default */}
            <AdminSidebar />
            {/* SidebarInset will contain the main dashboard content */}
            {/* The new design has a main content area and potentially a right event sidebar within the dashboard page itself */}
            <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
                {/* AdminHeader is removed. Page specific headers will be in the page component. */}
                {/* Main content area should fill remaining space and allow internal scrolling */}
                <main className="flex-1 overflow-y-auto main-content-scrollbar"> 
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}
