
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sparkles, UserCircle, LogIn, UserPlus, LogOut as LogOutIcon, LayoutDashboard } from 'lucide-react';
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

  if (isAdminPage) {
    return null; // Admin layout will handle its own header/sidebar
  }

  const navLinksToDisplay = isAuthPage ? [] : mainNavLinks;

  const renderAuthButtons = (isMobile = false) => {
    if (loading) return null; // Or a skeleton loader

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
          {isMobile ? (
            <Button variant="ghost" onClick={() => { signOut(); setIsOpen(false); }} className="w-full justify-start text-lg">
              <LogOutIcon className="mr-2 h-5 w-5" /> Logout
            </Button>
          ) : (
            <Button variant="outline" size="icon" onClick={signOut}>
              <Avatar className="h-8 w-8">
                 <AvatarImage src={user.photoURL || `https://picsum.photos/40/40?u=${user.uid}`} alt={user.displayName || "User"} />
                 <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
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
          <Button asChild className={isMobile ? "w-full justify-start text-lg bg-accent hover:bg-accent/90 text-accent-foreground mt-2" : "hidden md:inline-flex bg-accent hover:bg-accent/90"}>
            <Link href="/register" onClick={() => isMobile && setIsOpen(false)}>
              <UserPlus className="mr-2 h-4 w-4" /> Register
            </Link>
          </Button>
        </>
      );
    }
  };

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
          {renderAuthButtons()}
          
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
