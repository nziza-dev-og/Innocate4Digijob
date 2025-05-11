
"use client";
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/hooks/use-auth-hook'; // Import useAuth
import { useEffect } from 'react';

export function AuthAwareLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isUserAdmin } = useAuth(); // Use the auth hook

  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (!loading) {
      if (isAuthRoute && user) {
        // If on an auth page and logged in, redirect to dashboard
        router.push(isUserAdmin ? '/admin/dashboard' : '/'); // Or a user-specific dashboard
      }
      // ProtectedRoute component will handle unauthorized access to admin routes
    }
  }, [user, loading, isAuthRoute, isAdminRoute, isUserAdmin, router, pathname]);


  if (isAuthRoute) {
    // Auth pages provide their own full layout
    return <main className="flex-grow flex flex-col bg-background">{children}</main>;
  }

  if (isAdminRoute) {
    // Admin pages have their own layout structure (AdminLayout), which includes ProtectedRoute
    return <>{children}</>;
  }

  // Default layout for other public pages
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
