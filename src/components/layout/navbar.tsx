
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sparkles, UserCircle, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import * as React from 'react';
import { usePathname } from 'next/navigation';

const mainNavLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#activities', label: 'Activities' },
  { href: '#impact', label: 'Impact' },
  { href: '#team', label: 'Team' },
  { href: '#join', label: 'Join Us' },
  { href: '#contact', label: 'Contact' },
];

// Placeholder for authentication state
// In a real app, this would come from a context or auth hook
const isAuthenticated = false; // Set to true to see Admin link
const isAdminUser = true; // Placeholder for admin role check

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  // Hide main navigation on auth and admin pages
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return null; // Admin layout will handle its own header/sidebar
  }

  const navLinksToDisplay = isAuthPage ? [] : mainNavLinks;


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
          {isAuthenticated ? (
            <>
              {isAdminUser && (
                <Button variant="ghost" asChild className="hidden md:inline-flex">
                  <Link href="/admin/dashboard">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel
                  </Link>
                </Button>
              )}
              {/* Replace with User Avatar/Dropdown for logged-in user */}
              <Button variant="outline" size="icon">
                <UserCircle className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
             {!isAuthPage && (
                <>
                    <Button variant="ghost" asChild className="hidden md:inline-flex">
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" /> Login
                    </Link>
                    </Button>
                    <Button asChild className="hidden md:inline-flex bg-accent hover:bg-accent/90">
                    <Link href="/register">
                        <UserPlus className="mr-2 h-4 w-4" /> Register
                    </Link>
                    </Button>
                </>
             )}
            </>
          )}


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
                    {isAuthenticated ? (
                       <>
                        {isAdminUser && (
                            <Link href="/admin/dashboard" className="text-lg font-medium text-foreground transition-colors hover:text-primary flex items-center" onClick={() => setIsOpen(false)}>
                                <ShieldCheck className="mr-2 h-5 w-5" /> Admin Panel
                            </Link>
                        )}
                         {/* Add logout or profile link here for mobile */}
                       </>
                    ) : (
                      <>
                        <Link href="/login" className="text-lg font-medium text-foreground transition-colors hover:text-primary flex items-center" onClick={() => setIsOpen(false)}>
                          <LogIn className="mr-2 h-5 w-5" /> Login
                        </Link>
                        <Link href="/register" className="text-lg font-medium text-foreground transition-colors hover:text-primary flex items-center" onClick={() => setIsOpen(false)}>
                          <UserPlus className="mr-2 h-5 w-5" /> Register
                        </Link>
                      </>
                    )}
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
