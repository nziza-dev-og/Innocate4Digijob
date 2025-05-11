
import type { Metadata } from "next";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";


export const metadata: Metadata = {
  title: "Admin - Dobson School",
  description: "Admin panel for Dobson School.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute adminOnly={true}> {/* Assuming admin section requires admin role */}
      <SidebarProvider defaultOpen={true}> {/* Sidebar is always open in the new design */}
          <AdminSidebar />
          <SidebarInset className="bg-background"> {/* Main content area has a different background from sidebar */}
              <AdminHeader />
              <main className="flex-1 p-6 bg-secondary/50"> {/* Adjusted padding and background */}
                  {children}
              </main>
          </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
