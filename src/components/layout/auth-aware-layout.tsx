"use client";
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export function AuthAwareLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isAdminRoute = pathname.startsWith('/admin');


  if (isAuthRoute) {
    // Auth pages provide their own full layout, so just render children in a basic main container
    return <main className="flex-grow flex flex-col bg-background">{children}</main>;
  }

  if (isAdminRoute) {
    // Admin pages have their own layout structure (AdminLayout), so just render children
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
