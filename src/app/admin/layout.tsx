
import type { Metadata } from "next";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin - DigiSpark",
  description: "Admin panel for DigiSpark.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute adminOnly={true}>
      <div className={cn("dark admin-page-override")}> 
        <SidebarProvider defaultOpen={true}> 
            <AdminSidebar />
            <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto main-content-scrollbar"> 
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}
