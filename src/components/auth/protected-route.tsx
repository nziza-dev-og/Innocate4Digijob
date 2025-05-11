
"use client";

import type { ReactNode} from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-hook';
import { Skeleton } from '@/components/ui/skeleton'; // Or any loading spinner

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading, isUserAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (adminOnly && !isUserAdmin) {
        // If adminOnly is true and user is not admin, redirect to a non-admin page or show an error
        // For now, redirecting to a generic dashboard or home.
        // This could be a specific "access denied" page in a real app.
        router.push('/'); 
      }
    }
  }, [user, loading, router, adminOnly, isUserAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        {/* You can replace this with a more sophisticated loader/skeleton */}
        <div className="space-y-4 p-8">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user || (adminOnly && !isUserAdmin)) {
    // This will briefly show before redirect kicks in, or if redirect fails
    return null; 
  }

  return <>{children}</>;
}
