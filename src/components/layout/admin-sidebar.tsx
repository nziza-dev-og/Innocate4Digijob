
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
import {
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Settings,
  LogOutIcon as LogOut, // Renamed to avoid conflict
  Briefcase, 
  PieChart, 
  CalendarClock, 
  ShieldCheck, 
  LampDesk, 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hook";
import { cn } from "@/lib/utils";

const AppLogo = () => (
  <div className="flex items-center justify-center w-10 h-10">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L12 4L10 8L4 8L6 4Z" fill="hsl(var(--sidebar-accent))"/>
      <path d="M10 10L16 10L14 14L8 14L10 10Z" fill="hsl(var(--sidebar-accent))"/>
       <path d="M14 16L20 16L18 20L12 20L14 16Z" fill="hsl(var(--sidebar-accent))"/>
    </svg>
  </div>
);

const mainMenuLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: PieChart, exactMatch: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/chat", label: "Chat", icon: MessageSquare },
  { href: "/admin/projects", label: "Projects", icon: Briefcase }, // Placeholder link
  { href: "/admin/analytics", label: "Analytics", icon: LayoutDashboard }, // Placeholder link
  { href: "/admin/ideas", label: "Ideas", icon: LampDesk }, // Placeholder link
];


export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, signOut, loading } = useAuth();

  const isActive = (href: string, exactMatch: boolean = false) => {
    if (exactMatch) return pathname === href;
    // Special handling for /admin/dashboard to also match /admin
    if (href === "/admin/dashboard" && (pathname === "/admin" || pathname === "/admin/dashboard")) return true;
    return pathname.startsWith(href) && href !== "/admin/dashboard"; // Avoid matching dashboard for other /admin/* routes
  };

  return (
    <Sidebar variant="sidebar" side="left" collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-3 border-b border-sidebar-border/50 flex items-center justify-center group-data-[collapsible=icon]:py-3">
        <Link href="/admin/dashboard" className="flex items-center justify-center" onClick={() => setOpenMobile(false)}>
           <AppLogo />
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="p-2 flex-grow flex flex-col justify-between">
        <SidebarMenu className="flex-grow space-y-1">
          {mainMenuLinks.map(link => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(link.href, link.exactMatch)}
                onClick={() => setOpenMobile(false)}
                tooltip={{ children: link.label, side: "right", align: "center" }}
                className={cn(
                  "justify-center rounded-lg h-10 w-10 p-0", 
                  isActive(link.href, link.exactMatch) 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "hover:bg-sidebar-accent/20 hover:text-sidebar-primary text-sidebar-foreground/70",
                  "group-data-[collapsible=icon]:justify-center" 
                )}
              >
                <Link href={link.href}>
                  <link.icon className="h-5 w-5"/>
                  <span className="sr-only group-data-[collapsible=expanded]:not-sr-only group-data-[collapsible=expanded]:ml-2">{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <SidebarMenu className="space-y-1 mt-auto">
           <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin/settings")}
                onClick={() => setOpenMobile(false)}
                tooltip={{ children: "Settings", side: "right", align: "center" }}
                 className={cn(
                  "justify-center rounded-lg h-10 w-10 p-0",
                  isActive("/admin/settings") 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "hover:bg-sidebar-accent/20 hover:text-sidebar-primary text-sidebar-foreground/70",
                  "group-data-[collapsible=icon]:justify-center"
                )}
              >
                <Link href="/admin/settings">
                  <Settings className="h-5 w-5" />
                   <span className="sr-only group-data-[collapsible=expanded]:not-sr-only group-data-[collapsible=expanded]:ml-2">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-3 border-t border-sidebar-border/50 flex items-center justify-center">
        {user && !loading && (
            <SidebarMenuButton
                onClick={() => { signOut(); setOpenMobile(false); }}
                className="justify-center rounded-full h-10 w-10 p-0 hover:bg-red-500/20 hover:text-red-400 text-sidebar-foreground/70"
                tooltip={{ children: "Logout", side: "right", align: "center" }}
            >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} alt={user.displayName || "Admin"} data-ai-hint="admin avatar"/>
                  <AvatarFallback>{user.displayName?.[0].toUpperCase() || 'A'}</AvatarFallback>
                </Avatar>
                 <span className="sr-only group-data-[collapsible=expanded]:not-sr-only group-data-[collapsible=expanded]:ml-2">Logout</span>
            </SidebarMenuButton>
        )}
         {!user && loading && ( 
             <div className="h-10 w-10 rounded-full bg-sidebar-foreground/10 animate-pulse"></div>
         )}
      </SidebarFooter>
    </Sidebar>
  );
}
