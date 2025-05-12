
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
  CreditCard, // Transaction
  Settings,
  LogOut,
  GraduationCap, // App Logo Icon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hook";

const mainNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen, disabled: true },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays, disabled: true },
  { href: "/dashboard/profile", label: "My Profile", icon: UserCircle, disabled: true }, // Link to /dashboard/settings later
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, disabled: true },
  { href: "/dashboard/live-class", label: "Live Class", icon: Video, disabled: true },
  { href: "/dashboard/transactions", label: "Transaction", icon: CreditCard, disabled: true },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, signOut, loading } = useAuth();

  const activeLinkClasses = "bg-primary/10 text-primary"; // Custom active style based on image
  const defaultLinkClasses = "hover:bg-secondary/50";

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
          {mainNavLinks.map(link => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                // isActive is not directly supported by SidebarMenuButton, we manage style via className
                onClick={() => setOpenMobile(false)}
                tooltip={{ children: link.label, side: "right", align: "center" }}
                disabled={link.disabled}
                className={`
                  justify-start rounded-lg
                  ${pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href)) ? activeLinkClasses : defaultLinkClasses}
                  ${link.disabled ? "cursor-not-allowed opacity-60" : ""}
                `}
              >
                <Link href={link.disabled ? "#" : link.href}>
                  <link.icon className={`mr-3 h-5 w-5 ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={pathname === link.href ? 'font-semibold' : ''}>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-3 border-t">
         <SidebarMenu>
            <SidebarMenuItem>
                 <SidebarMenuButton
                    asChild
                    onClick={() => setOpenMobile(false)}
                    tooltip={{ children: "Settings", side: "right", align: "center" }}
                    className={`
                        justify-start rounded-lg
                        ${pathname === "/dashboard/settings" ? activeLinkClasses : defaultLinkClasses}
                    `}
                    >
                    <Link href="/dashboard/settings">
                        <Settings className={`mr-3 h-5 w-5 ${pathname === '/dashboard/settings' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={pathname === '/dashboard/settings' ? 'font-semibold' : ''}>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            {user && !loading && (
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => { signOut(); setOpenMobile(false); }}
                        className={`justify-start rounded-lg mt-2 ${defaultLinkClasses} text-red-500 hover:text-red-600`}
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
