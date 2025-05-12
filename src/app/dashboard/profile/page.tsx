
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth-hook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCircle, Mail, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-10 w-32 mt-4 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Please log in to view your profile.</p>
        <Button asChild className="mt-4"><Link href="/login">Go to Login</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center border-b pb-6">
          <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-2 mb-4">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="user profile" />
            <AvatarFallback className="text-4xl">
              {user.displayName ? user.displayName[0].toUpperCase() : <UserCircle className="h-16 w-16" />}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold text-primary">{user.displayName || "User"}</CardTitle>
          <CardDescription className="text-muted-foreground capitalize">{user.role || "Student"}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
           <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
           </div>
            {/* Add more profile details here if available in Firestore */}
            {/* Example: 
            <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Grade 11</span>
            </div> 
            */}
           <div className="pt-4 text-center">
             <Button asChild variant="outline">
                <Link href="/dashboard/settings">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
            </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
