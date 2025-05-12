
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sparkles, UserCircle, LogIn, UserPlus, LogOut as LogOutIcon, LayoutDashboard, User } from 'lucide-react'; // Added User icon
import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-hook';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mainNavLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#activities', label: 'Activities' },
  { href: '#impact', label: 'Impact' },
  { href: '#team', label: 'Team' },
  { href: '#join', label: 'Join Us' },
  { href: '#contact', label: 'Contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, signOut, isUserAdmin, loading } = useAuth();

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  const isAdminPage = pathname.startsWith('/admin');
  const isUserDashboardPage = pathname.startsWith('/dashboard');


  if (isAdminPage || isUserDashboardPage) { // Navbar should not show on admin or student dashboard pages
    return null;
  }

  const navLinksToDisplay = isAuthPage ? [] : mainNavLinks;

  const renderAuthButtons = (isMobile = false) => {
    if (loading) return null; 

    if (user) {
      return (
        <>
          {isUserAdmin && (
            <Button variant="ghost" asChild className={isMobile ? "w-full justify-start text-lg" : "hidden md:inline-flex"}>
              <Link href="/admin/dashboard" onClick={() => isMobile && setIsOpen(false)}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel
              </Link>
            </Button>
          )}
          {!isUserAdmin && (
             <Button variant="ghost" asChild className={isMobile ? "w-full justify-start text-lg" : "hidden md:inline-flex"}>
              <Link href="/dashboard" onClick={() => isMobile && setIsOpen(false)}>
                <User className="mr-2 h-4 w-4" /> My Dashboard
              </Link>
            </Button>
          )}

          {isMobile ? (
            <Button variant="ghost" onClick={() => { signOut(); setIsOpen(false); }} className="w-full justify-start text-lg">
              <LogOutIcon className="mr-2 h-5 w-5" /> Logout
            </Button>
          ) : (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.photoURL || `https://picsum.photos/seed/${user?.uid || 'defaultUser'}/40/40`} 
                      alt={user?.displayName || "User"} 
                      data-ai-hint="user avatar" 
                    />
                    <AvatarFallback>{user?.displayName?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.displayName || user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isUserAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                {!isUserAdmin && ( // This condition was correct, student dashboard link
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard"><User className="mr-2 h-4 w-4" />My Dashboard</Link>
                  </DropdownMenuItem>
                )}
                 <DropdownMenuItem asChild>
                    <Link href={isUserAdmin ? "/admin/settings" : "/dashboard/settings"}><Settings className="mr-2 h-4 w-4" />Settings</Link>
                 </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-600 hover:!text-red-600 hover:!bg-red-50">
                  <LogOutIcon className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      );
    } else {
      if (isAuthPage) return null;
      return (
        <>
          <Button variant="ghost" asChild className={isMobile ? "w-full justify-start text-lg" : "hidden md:inline-flex"}>
            <Link href="/login" onClick={() => isMobile && setIsOpen(false)}>
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Link>
          </Button>
          <Button asChild className={isMobile ? "w-full justify-start text-lg bg-accent hover:bg-accent/90 text-accent-foreground mt-2" : "bg-accent hover:bg-accent/90 text-accent-foreground"}>
            <Link href="/register" onClick={() => isMobile && setIsOpen(false)}>
              <UserPlus className="mr-2 h-4 w-4" /> Register
            </Link>
          </Button>
        </>
      );
    }
  };
  
  // DropdownMenu components for Navbar user avatar (only needed for non-mobile)
  const DropdownMenu = React.lazy(() => import('@/components/ui/dropdown-menu').then(module => ({ default: module.DropdownMenu })));
  const DropdownMenuTrigger = React.lazy(() => import('@/components/ui/dropdown-menu').then(module => ({ default: module.DropdownMenuTrigger })));
  const DropdownMenuContent = React.lazy(() => import('@/components/ui/dropdown-menu').then(module => ({ default: module.DropdownMenuContent })));
  const DropdownMenuItem = React.lazy(() => import('@/components/ui/dropdown-menu').then(module => ({ default: module.DropdownMenuItem })));
  const DropdownMenuLabel = React.lazy(() => import('@/components/ui/dropdown-menu').then(module => ({ default: module.DropdownMenuLabel })));
  const DropdownMenuSeparator = React.lazy(() => import('@/components/ui/dropdown-menu').then(module => ({ default: module.DropdownMenuSeparator })));
  const Settings = React.lazy(() => import('lucide-react').then(module => ({ default: module.Settings })));


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <Link href={isAuthPage ? "/" : "#home"} className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">DigiSpark</span>
        </Link>

        {!isAuthPage && (
          <nav className="hidden md:flex gap-4 items-center">
            {navLinksToDisplay.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <React.Suspense fallback={<div className="h-8 w-20 rounded-full bg-muted animate-pulse" />}> {/* Fallback for lazy loaded dropdown components */}
            {renderAuthButtons()}
          </React.Suspense>
          
          {!isAuthPage && (
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col gap-4 pt-8">
                    {navLinksToDisplay.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <hr className="my-4" />
                    {renderAuthButtons(true)}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
