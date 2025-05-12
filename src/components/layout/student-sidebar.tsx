
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid, // Dashboard
  BookOpen,   // Courses
  CalendarDays, // Schedule
  UserCircle, // Student (Profile)
  MessageSquare, // Chat
  Video,      // Live Class
  CreditCard, // Transaction - Still Placeholder
  Settings,
  LogOut,
  GraduationCap, // App Logo Icon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hook";
import { cn } from "@/lib/utils"; // Import cn

const mainNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/dashboard/profile", label: "My Profile", icon: UserCircle }, // Links to profile page
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/live-class", label: "Live Class", icon: Video },
  { href: "/dashboard/transactions", label: "Transaction", icon: CreditCard }, // Keep as placeholder for now
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, signOut, loading } = useAuth();

  const activeLinkClasses = "bg-primary/10 text-primary font-semibold"; // Custom active style based on image
  const defaultLinkClasses = "hover:bg-secondary/50 text-muted-foreground";
  const disabledLinkClasses = "opacity-50 cursor-not-allowed hover:bg-transparent text-muted-foreground/50"; // Style for disabled links

  // Update enabled links based on implemented pages
  const enabledLinks = [
      "/dashboard", 
      "/dashboard/settings", 
      "/dashboard/profile",
      "/dashboard/courses", // Enable Courses (placeholder)
      "/dashboard/schedule", // Enable Schedule (placeholder)
      "/dashboard/chat", // Enable Chat
      "/dashboard/live-class", // Enable Live Class (placeholder)
    ]; // Transactions still disabled

  return (
    <Sidebar variant="sidebar" side="left" collapsible="none" className="border-r bg-card shadow-sm"> {/* Changed bg-sidebar to bg-card for white */}
      <SidebarHeader className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpenMobile(false)}>
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl text-primary">Smartings</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-3 flex-grow">
        <SidebarMenu>
          {mainNavLinks.map(link => {
             const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
             const isEnabled = enabledLinks.includes(link.href); // Check if link should be enabled

             return (
                <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                    asChild={isEnabled} // Use asChild only if enabled to make it a Link
                    // isActive is not directly supported, manage style via className
                    onClick={() => isEnabled && setOpenMobile(false)}
                    tooltip={{ children: link.label, side: "right", align: "center" }}
                    disabled={!isEnabled} // Disable button if not enabled
                    className={cn(
                    "justify-start rounded-lg w-full",
                     isEnabled ? (isActive ? activeLinkClasses : defaultLinkClasses) : disabledLinkClasses
                    )}
                >
                    {isEnabled ? (
                    <Link href={link.href} className="flex items-center w-full">
                        <link.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                        <span>{link.label}</span>
                    </Link>
                    ) : (
                    // Render a div or span for disabled items so it's not clickable
                    <div className="flex items-center w-full">
                        <link.icon className={`mr-3 h-5 w-5`} />
                        <span>{link.label}</span>
                    </div>
                    )}
                </SidebarMenuButton>
                </SidebarMenuItem>
             );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t">
         <SidebarMenu>
            <SidebarMenuItem>
                 <SidebarMenuButton
                    asChild
                    onClick={() => setOpenMobile(false)}
                    tooltip={{ children: "Settings", side: "right", align: "center" }}
                     className={cn(
                        "justify-start rounded-lg",
                        pathname.startsWith("/dashboard/settings") ? activeLinkClasses : defaultLinkClasses
                     )}
                    >
                    <Link href="/dashboard/settings">
                        <Settings className={`mr-3 h-5 w-5 ${pathname.startsWith('/dashboard/settings') ? 'text-primary' : ''}`} />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            {user && !loading && (
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => { signOut(); setOpenMobile(false); }}
                        className={cn(
                            "justify-start rounded-lg mt-2 text-red-500 hover:text-red-600 hover:bg-red-500/10", // Adjusted hover for red
                            defaultLinkClasses // Use default hover logic but override color above
                        )}
                         tooltip={{ children: "Logout", side: "right", align: "center" }}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
