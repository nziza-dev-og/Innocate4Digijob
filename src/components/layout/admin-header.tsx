"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, LogOut, Bell, ChevronDown, Users as UsersIcon, Search as SearchIcon } from "lucide-react"; 
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth-hook";
import { Input } from "@/components/ui/input"; // For search bar
// import { useTheme } from "next-themes"; // If theme toggle is implemented

export function AdminHeader() {
  const { user, signOut, loading } = useAuth();
  // const { theme, setTheme } = useTheme(); // For theme toggle

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      
      {/* Search bar - non-functional placeholder */}
      <div className="relative hidden md:block flex-1 max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search here..." className="pl-9 h-9 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary" disabled />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-4">
        {/* Language Dropdown - non-functional placeholder */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 rounded-full text-xs px-3 hidden sm:flex">
                    ENGLISH <ChevronDown className="ml-1 h-3 w-3"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>English (Selected)</DropdownMenuItem>
                <DropdownMenuItem disabled>Français (Soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Kinyarwanda (Soon)</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        {/* New Teachers Button */}
        <Button asChild className="h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-4 hidden sm:flex">
            <Link href="/admin/users">
                <UsersIcon className="mr-2 h-4 w-4" /> New Teachers
            </Link>
        </Button>
        
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/50">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground bg-destructive rounded-full transform translate-x-1/2 -translate-y-1/2">
            1 {/* Example notification count */}
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {user && !loading && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} alt={user.displayName || "User"} data-ai-hint="user avatar"/>
                  <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                   <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
                    Role: {user.role || 'Admin'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 {/* Link to /dashboard/settings for student, /admin/settings for admin */}
                <Link href={user.role === 'admin' ? "/admin/settings" : "/dashboard/settings"}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive hover:!text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}