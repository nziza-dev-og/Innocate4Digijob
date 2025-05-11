
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, LayoutDashboard, Users, Settings, LogOut, Home } from "lucide-react";

const adminNavLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  // Add more admin specific links here
];

const generalNavLinks = [
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/", label: "View Site", icon: Home },
];


export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();


  const renderLink = (link: { href: string; label: string; icon: React.ElementType }) => (
    <SidebarMenuItem key={link.href}>
      <SidebarMenuButton
        asChild
        isActive={pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href))}
        onClick={() => setOpenMobile(false)}
        tooltip={{ children: link.label, side: "right", align: "center" }}
      >
        <Link href={link.href}>
          <link.icon />
          <span>{link.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-lg text-primary"  onClick={() => setOpenMobile(false)}>
          <Sparkles className="h-6 w-6" />
          <span>DigiSpark Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {adminNavLinks.map(renderLink)}
        </SidebarMenu>
        <Separator className="my-4" />
        <SidebarMenu>
            {generalNavLinks.map(renderLink)}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                 <SidebarMenuButton asChild onClick={() => setOpenMobile(false)} tooltip={{ children: "Logout", side: "right", align: "center" }}>
                    {/* This would trigger actual logout */}
                    <Link href="/login">
                        <LogOut />
                        <span>Logout</span>
                    </Link>
                 </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
