
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
import { Input } from "@/components/ui/input";
import { Search, Settings, User, LogOut, Bell, Sun, Moon } from "lucide-react"; // Assuming Sun/Moon for theme toggle
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth-hook";
// import { useTheme } from "next-themes"; // If theme toggle is implemented

export function AdminHeader() {
  const { user, signOut, loading } = useAuth();
  // const { theme, setTheme } = useTheme(); // For theme toggle

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {/* Sidebar trigger for mobile - can be adapted from original AdminHeader or Sidebar component */}
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      {/* Dashboard Title - can be dynamic based on page */}
      <h1 className="text-xl font-semibold text-foreground hidden md:block">Dashboard</h1>

      <div className="ml-auto flex items-center gap-4">
        <div className="relative flex-1 md:grow-0 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for students/teachers/documents..."
            className="w-full rounded-lg bg-input pl-8 pr-2 py-2 h-10 text-sm"
          />
        </div>

        {/* Theme Toggle Example - uncomment if next-themes is set up */}
        {/* 
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
        */}
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-destructive-foreground bg-destructive rounded-full transform translate-x-1/2 -translate-y-1/2">
            3 {/* Example notification count */}
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {user && !loading && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || `https://picsum.photos/40/40?u=${user.uid}`} alt={user.displayName || "User"} data-ai-hint="user avatar"/>
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
                <Link href="#">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
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
