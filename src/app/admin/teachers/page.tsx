
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page will redirect to /admin/users as teacher management is handled there.
export default function AdminTeachersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users?role=teacher'); // Optional: Add query param to pre-filter if users page supports it
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to User Management (Teachers)...</p>
      </div>
    </div>
  );
}
