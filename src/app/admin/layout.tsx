
import type { Metadata } from "next";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";


export const metadata: Metadata = {
  title: "Admin - DigiSpark",
  description: "Admin panel for DigiSpark project.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
        <AdminSidebar />
        <SidebarInset>
            <AdminHeader />
            <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 bg-muted/40">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
