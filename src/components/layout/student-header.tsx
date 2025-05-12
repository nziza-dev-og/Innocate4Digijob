
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
import { Search, Settings, User, LogOut, Bell, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth-hook";

export function StudentHeader() {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b bg-card px-6"> {/* bg-card for white background */}
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      <div className="relative flex-1 md:grow-0 max-w-md"> {/* Search bar styling */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Find anything from here easier..."
          className="w-full rounded-full bg-secondary/70 pl-10 pr-4 py-2.5 h-11 text-sm border-none focus:ring-primary focus:ring-2"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 inline-flex items-center justify-center p-[1px] text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full w-2 h-2 ring-2 ring-card">
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {user && !loading ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-auto px-3 py-2 rounded-full flex items-center gap-2 hover:bg-secondary/70"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage 
                    src={user?.photoURL || `https://picsum.photos/seed/${user?.uid || 'defaultUser'}/40/40`} 
                    alt={user?.displayName || "User"} 
                    data-ai-hint="user avatar"
                  />
                  <AvatarFallback>{user?.displayName?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">{user?.displayName || user?.email?.split('@')[0]}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    Role: {user?.role || 'Student'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#"> {/* Link to a dedicated profile view page if exists */}
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 hover:!text-red-600 hover:!bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
            <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9 bg-muted" />
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
        )}
      </div>
    </header>
  );
}
