
"use client";
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/hooks/use-auth-hook'; 
import { useEffect } from 'react';

export function AuthAwareLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isUserAdmin } = useAuth(); 

  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserDashboardRoute = pathname.startsWith('/dashboard');

  useEffect(() => {
    if (!loading && user && isAuthRoute) {
      router.push(isUserAdmin ? '/admin/dashboard' : '/dashboard');
    }
  }, [user, loading, isAuthRoute, isUserAdmin, router, pathname]);


  if (isAuthRoute) {
    // Auth pages provide their own full layout
    return <main className="flex-grow flex flex-col bg-background">{children}</main>;
  }

  if (isAdminRoute || isUserDashboardRoute) {
    // Admin and User Dashboard pages have their own layout structure (AdminLayout, DashboardLayout),
    // which includes ProtectedRoute. These layouts will render their own specific headers/sidebars.
    // The main Navbar and Footer are not rendered for these dedicated sections.
     return (
        <main className="flex-grow"> {/* Occupies full height for sidebar layouts */}
            {children}
        </main>
     );
  }

  // Default layout for other public pages (e.g., homepage)
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
