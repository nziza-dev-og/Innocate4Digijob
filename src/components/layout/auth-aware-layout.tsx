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
      // If on an auth page and logged in, redirect to the appropriate dashboard
      router.push(isUserAdmin ? '/admin/dashboard' : '/dashboard');
    }
    // ProtectedRoute component will handle unauthorized access to admin or user dashboard routes
  }, [user, loading, isAuthRoute, isUserAdmin, router, pathname]);


  if (isAuthRoute) {
    // Auth pages provide their own full layout
    return <main className="flex-grow flex flex-col bg-background">{children}</main>;
  }

  if (isAdminRoute || isUserDashboardRoute) {
    // Admin and User Dashboard pages have their own layout structure (AdminLayout, DashboardLayout), 
    // which includes ProtectedRoute. Navbar/Footer are not part of these layouts by default here.
    // Specific layouts (AdminLayout, DashboardLayout) will render their own Navbar/Header if needed.
    // For now, the main Navbar/Footer are excluded from these dedicated sections.
    // We can add a simpler header/footer within those layouts if needed.
     return (
        <>
            {/* Navbar can be conditional or a different one for dashboard view */}
            {isUserDashboardRoute && <Navbar />} 
            <main className="flex-grow">
                {children}
            </main>
            {isUserDashboardRoute && <Footer />}
        </>
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
