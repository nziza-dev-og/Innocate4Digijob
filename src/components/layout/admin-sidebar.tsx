
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
  Home,
  ClipboardList,
  Users,
  Briefcase, // Using Briefcase for Faculty as a stand-in for a more specific "teacher" icon
  TrendingUp,
  CalendarCheck,
  CircleDollarSign,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hook";

// Define main navigation links based on the image
const mainNavLinks = [
  { href: "/admin/dashboard", label: "Home", icon: Home },
  { href: "/admin/school-details", label: "School Details", icon: ClipboardList, disabled: true },
  {
    label: "Students",
    icon: Users,
    subLinks: [
      { href: "/admin/students/all", label: "All Students", disabled: true },
      { href: "/admin/students/add", label: "Add Student", disabled: true },
    ],
  },
  {
    label: "Faculty",
    icon: Briefcase, // Represents teachers/staff
    subLinks: [
      { href: "/admin/faculty/all", label: "All Faculty", disabled: true },
      { href: "/admin/faculty/add", label: "Add Faculty", disabled: true },
    ],
  },
  {
    label: "Performance",
    icon: TrendingUp,
    subLinks: [
      { href: "/admin/performance/reports", label: "Reports", disabled: true },
      { href: "/admin/performance/rankings", label: "Rankings", disabled: true },
    ],
  },
  {
    label: "Attendance",
    icon: CalendarCheck,
    subLinks: [
      { href: "/admin/attendance/students", label: "Student Attendance", disabled: true },
      { href: "/admin/attendance/faculty", label: "Faculty Attendance", disabled: true },
    ],
  },
  {
    label: "Finance",
    icon: CircleDollarSign,
    subLinks: [
      { href: "/admin/finance/fees", label: "Fee Management", disabled: true },
      { href: "/admin/finance/expenses", label: "Expenses", disabled: true },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user, signOut, loading } = useAuth();

  const renderLink = (link: { href: string; label: string; icon: React.ElementType; disabled?: boolean }) => (
    <SidebarMenuItem key={link.href}>
      <SidebarMenuButton
        asChild
        isActive={pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href))}
        onClick={() => setOpenMobile(false)}
        tooltip={{ children: link.label, side: "right", align: "center" }}
        disabled={link.disabled}
        className={link.disabled ? "cursor-not-allowed opacity-50" : ""}
      >
        <Link href={link.disabled ? "#" : link.href}>
          <link.icon />
          <span>{link.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const renderDropdownLink = (
    item: { label: string; icon: React.ElementType; subLinks: Array<{ href: string; label: string; disabled?: boolean }> }
  ) => {
    const isActiveParent = item.subLinks.some(subLink => pathname.startsWith(subLink.href));
    return (
      <SidebarMenuItem key={item.label}>
        {/* This is a conceptual dropdown, actual implementation might need Radix Dropdown or Accordion */}
        <SidebarMenuButton
          isActive={isActiveParent}
          className="justify-between"
          // onClick={() => setOpenMobile(false)} // Keep menu open for sub-items or handle differently
        >
          <div className="flex items-center gap-2">
            <item.icon />
            <span>{item.label}</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isActiveParent ? "rotate-180" : ""}`} />
        </SidebarMenuButton>
        {isActiveParent && ( // Simplified: always show sublinks if parent is active for demo
          <SidebarMenuSub>
            {item.subLinks.map(subLink => (
              <SidebarMenuSubItem key={subLink.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === subLink.href}
                  onClick={() => setOpenMobile(false)}
                  className={subLink.disabled ? "cursor-not-allowed opacity-50" : ""}
                >
                  <Link href={subLink.disabled ? "#" : subLink.href}>{subLink.label}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  };


  return (
    <Sidebar variant="sidebar" side="left" collapsible="none" className="border-r bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {/* Logo based on image */}
        <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setOpenMobile(false)}>
          {/* Placeholder for actual logo image if available */}
          <svg width="32" height="32" viewBox="0 0 100 100" className="text-primary fill-current">
            <rect width="100" height="100" rx="20" fill="currentColor"/>
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="60" fill="var(--primary-foreground)">D</text>
          </svg>
          <span className="font-bold text-xl text-primary">Dobson School</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="p-2 flex-grow">
        <SidebarMenu>
          {mainNavLinks.map(link => 
            link.subLinks ? renderDropdownLink(link as any) : renderLink(link)
          )}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && !loading ? (
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || "https://picsum.photos/40/40?random=admin"} alt={user.displayName || user.email || "User"} data-ai-hint="user avatar" />
                    <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user.displayName || user.email}</p>
                    {/* In a real app, user role might come from Firestore/custom claims */}
                    <p className="text-xs text-muted-foreground">Principal</p> 
                </div>
                 <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-primary">
                    <LogOut className="h-5 w-5" />
                 </Button>
            </div>
        ) : (
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-muted" />
                <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                </div>
            </div>
        )}
         <Link href="/admin/settings" passHref>
            <Button variant="ghost" className="w-full justify-start mt-2 text-muted-foreground hover:text-primary hover:bg-sidebar-accent">
                <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
