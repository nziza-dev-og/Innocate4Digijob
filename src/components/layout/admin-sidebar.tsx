
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
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  UserCheck, 
  CalendarDays, 
  DollarSign, 
  ChefHat, // Using Lucide's ChefHat
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hook";

// Updated main navigation links
const mainMenuLinks = [
  { href: "/admin/dashboard", label: "Events Dashboard", icon: LayoutDashboard, exactMatch: true }, // Dashboard is the events page.
  { href: "/admin/chat", label: "Chat", icon: MessageSquare },
  { href: "/admin/users", label: "Users (Students/Teachers)", icon: Users }, // Unified user management
  // { href: "/admin/teachers", label: "Teacher", icon: UserCheck }, // Keep separate if distinct teacher functionality is planned
];

const otherMenuLinks = [
    { href: "/admin/finance", label: "Finance", icon: DollarSign },
    { href: "/admin/food", label: "Food", icon: ChefHat, badge: "New" }, // Example badge
    { href: "/admin/settings", label: "Settings", icon: Settings },
];


export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, signOut, loading } = useAuth();

  const isActive = (href: string, exactMatch: boolean = false) => {
    if (exactMatch) return pathname === href;
    // Special case for dashboard as it might be /admin or /admin/dashboard
    if (href === "/admin/dashboard" && (pathname === "/admin" || pathname === "/admin/dashboard")) return true;
    return pathname.startsWith(href) && href !== "/admin/dashboard"; // Avoids matching /admin/dashboard for other /admin/* links
  };

  return (
    <Sidebar variant="sidebar" side="left" collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setOpenMobile(false)}>
          <div className="bg-sidebar-primary text-sidebar-primary-foreground rounded-md p-2 w-10 h-10 flex items-center justify-center">
            <span className="font-bold text-lg">AS</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-bold text-lg text-sidebar-primary">AdminSchool</p>
            <p className="text-xs text-sidebar-foreground/70">School Admin Panel</p>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="p-2 flex-grow">
        {user && !loading && (
             <div className="p-2 mb-2 border-b border-sidebar-border/30 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-3 p-2 rounded-md bg-sidebar-primary/10">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || "https://picsum.photos/seed/admin-user/40/40"} alt={user.displayName || "Admin User"} data-ai-hint="admin avatar"/>
                        <AvatarFallback>{user.displayName?.[0].toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-sidebar-primary truncate">{user.displayName || "Admin User"}</p>
                        <p className="text-xs text-sidebar-foreground/70">{user.role === "admin" ? "Super Admin" : "Admin"}</p> 
                    </div>
                    {/* Dropdown for user profile/quick actions could go here */}
                </div>
            </div>
        )}
        
        <SidebarMenu>
            <SidebarMenuItem className="px-2 py-1 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:px-0">
                <p className="text-xs font-semibold text-sidebar-foreground/60 mb-1 group-data-[collapsible=icon]:hidden">Main Menu</p>
            </SidebarMenuItem>
          {mainMenuLinks.map(link => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(link.href, link.exactMatch)}
                onClick={() => setOpenMobile(false)}
                tooltip={{ children: link.label, side: "right", align: "center" }}
                className={`
                  justify-start rounded-md
                  ${isActive(link.href, link.exactMatch) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/20 hover:text-sidebar-primary"}
                `}
              >
                <Link href={link.href}>
                  <link.icon className={`h-5 w-5 ${isActive(link.href, link.exactMatch) ? 'text-sidebar-accent-foreground' : 'text-sidebar-primary/80'}`}/>
                  <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                  {link.badge && <Badge variant="secondary" className="ml-auto group-data-[collapsible=icon]:hidden bg-sidebar-foreground/20 text-sidebar-foreground/80">{link.badge}</Badge>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarMenu className="mt-4">
            <SidebarMenuItem className="px-2 py-1 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:px-0">
                <p className="text-xs font-semibold text-sidebar-foreground/60 mb-1 group-data-[collapsible=icon]:hidden">Others</p>
            </SidebarMenuItem>
          {otherMenuLinks.map(link => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(link.href)}
                onClick={() => setOpenMobile(false)}
                tooltip={{ children: link.label, side: "right", align: "center" }}
                className={`
                    justify-start rounded-md
                    ${isActive(link.href) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/20 hover:text-sidebar-primary"}
                `}
              >
                <Link href={link.href}>
                  <link.icon className={`h-5 w-5 ${isActive(link.href) ? 'text-sidebar-accent-foreground' : 'text-sidebar-primary/80'}`}/>
                  <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                   {link.badge && <Badge className="ml-auto group-data-[collapsible=icon]:hidden bg-accent text-accent-foreground px-1.5 text-[10px] h-4">{link.badge}</Badge>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-3 border-t border-sidebar-border/50">
        <SidebarMenu>
            <SidebarMenuItem>
                 <SidebarMenuButton
                    onClick={() => { signOut(); setOpenMobile(false); }}
                    className="justify-start rounded-md hover:bg-sidebar-accent/20 hover:text-sidebar-primary text-sidebar-foreground/80"
                    tooltip={{ children: "Logout", side: "right", align: "center" }}
                >
                    <LogOut className="h-5 w-5 text-sidebar-primary/80" />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
