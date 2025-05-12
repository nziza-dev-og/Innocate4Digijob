
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
  LayoutDashboard, // Dashboard
  MessageSquare, // Chat
  Users, // Student
  UserCheck, // Teacher (using UserCheck as stand-in)
  CalendarDays, // Event
  DollarSign, // Finance
  ChefHat, // Food (using ChefHat as stand-in)
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hook";

// Define main navigation links based on the image
const mainMenuLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exactMatch: false }, // Dashboard is the events page now.
  { href: "/admin/chat", label: "Chat", icon: MessageSquare, disabled: true },
  { href: "/admin/students", label: "Student", icon: Users, badge: "35", disabled: true },
  { href: "/admin/teachers", label: "Teacher", icon: UserCheck, disabled: true },
  { href: "/admin/events", label: "Event", icon: CalendarDays, exactMatch: true }, // Explicitly mark this for active state on /admin/dashboard
];

const otherMenuLinks = [
    { href: "/admin/finance", label: "Finance", icon: DollarSign, disabled: true },
    { href: "/admin/food", label: "Food", icon: ChefHat, badge: "1", disabled: true },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];


export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, signOut, loading } = useAuth();

  const isActive = (href: string, exactMatch: boolean = false) => {
    if (href === "/admin/events" && pathname === "/admin/dashboard") return true; // Special case for Event mapping to dashboard
    if (exactMatch) return pathname === href;
    return pathname.startsWith(href);
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
            <p className="text-xs text-sidebar-foreground/70">School Admission Dashboard</p>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="p-2 flex-grow">
        {user && !loading && (
             <div className="p-2 mb-2 border-b border-sidebar-border/30 group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-3 p-2 rounded-md bg-sidebar-primary/10">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || "https://picsum.photos/seed/admin-user/40/40"} alt={user.displayName || "Zack Foster"} data-ai-hint="admin avatar"/>
                        <AvatarFallback>{user.displayName?.[0] || 'Z'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-sidebar-primary truncate">{user.displayName || "Zack Foster"}</p>
                        <p className="text-xs text-sidebar-foreground/70">Super Admin</p> 
                    </div>
                    <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 hover:text-sidebar-primary">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
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
                disabled={link.disabled}
                className={`
                  justify-start rounded-md
                  ${link.disabled ? "cursor-not-allowed opacity-50" : ""}
                  ${isActive(link.href, link.exactMatch) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/20 hover:text-sidebar-primary"}
                `}
              >
                <Link href={link.disabled ? "#" : link.href}>
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
                disabled={link.disabled}
                className={`
                    justify-start rounded-md
                    ${link.disabled ? "cursor-not-allowed opacity-50" : ""}
                    ${isActive(link.href) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/20 hover:text-sidebar-primary"}
                `}
              >
                <Link href={link.disabled ? "#" : link.href}>
                  <link.icon className={`h-5 w-5 ${isActive(link.href) ? 'text-sidebar-accent-foreground' : 'text-sidebar-primary/80'}`}/>
                  <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                   {link.badge && <Badge variant="secondary" className="ml-auto group-data-[collapsible=icon]:hidden bg-red-500 text-white px-1.5 text-[10px] h-4 w-4 flex items-center justify-center">{link.badge}</Badge>}
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

