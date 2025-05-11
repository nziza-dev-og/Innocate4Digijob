"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth-hook";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpenCheck, Briefcase, Edit3, Settings, User } from "lucide-react";

// Placeholder data - replace with actual Firebase data fetching
interface Project {
  id: string;
  title: string;
  status: string;
  lastUpdate: string;
}

interface UserData {
  displayName: string;
  email: string;
  bio?: string;
  skills?: string[];
  projects?: Project[];
}


export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      // Simulate fetching user data from Firebase
      // In a real app, you'd fetch from Firestore using user.uid
      const fetchUserData = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        // Example: Fetch from Firestore
        // const userDocRef = doc(db, "users", user.uid);
        // const userDocSnap = await getDoc(userDocRef);
        // if (userDocSnap.exists()) {
        //   setUserData(userDocSnap.data() as UserData);
        // } else { ... handle error or set default ... }

        setUserData({
          displayName: user.displayName || "Innovator",
          email: user.email || "No email",
          bio: "Passionate about digital innovation and making a difference. Eager to learn and contribute to exciting projects.",
          skills: ["Web Development", "UI/UX Design", "Project Management"],
          projects: [
            { id: "p1", title: "Community Health App", status: "In Progress", lastUpdate: "2 days ago" },
            { id: "p2", title: "E-learning Platform Enhancements", status: "Completed", lastUpdate: "1 month ago" },
          ],
        });
        setIsLoading(false);
      };
      fetchUserData();
    } else if (!authLoading) {
      setIsLoading(false); // Not logged in or finished auth check
    }
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Could not load user data. Please try logging in again.</p>
        <Button asChild className="mt-4"><Link href="/login">Go to Login</Link></Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl mb-8 bg-card">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle className="text-3xl font-bold text-primary">Welcome, {userData.displayName}!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">This is your personal DigiSpark dashboard.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/settings"> {/* Assuming settings are unified or user has specific settings page */}
              <Settings className="mr-2 h-4 w-4" /> Profile Settings
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <User className="h-5 w-5" /> Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong className="text-foreground">Name:</strong> {userData.displayName}</p>
            <p><strong className="text-foreground">Email:</strong> {userData.email}</p>
            {userData.bio && <p className="text-sm text-muted-foreground italic">"{userData.bio}"</p>}
            {userData.skills && userData.skills.length > 0 && (
              <div>
                <strong className="text-foreground">Skills:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {userData.skills.map(skill => (
                    <span key={skill} className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Projects */}
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <Briefcase className="h-5 w-5" /> My Projects
            </CardTitle>
            <Button variant="default" size="sm">
                <Edit3 className="mr-2 h-4 w-4" /> Start New Project
            </Button>
          </CardHeader>
          <CardContent>
            {userData.projects && userData.projects.length > 0 ? (
              <ul className="space-y-4">
                {userData.projects.map(project => (
                  <li key={project.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{project.title}</h4>
                        <p className="text-sm text-muted-foreground">Status: <span className={project.status === "Completed" ? "text-green-600" : "text-yellow-600"}>{project.status}</span></p>
                      </div>
                      <p className="text-xs text-muted-foreground">{project.lastUpdate}</p>
                    </div>
                    <div className="mt-2">
                        <Button variant="link" size="sm" className="p-0 h-auto text-primary">View Details</Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">You haven't started or joined any projects yet. <Link href="#" className="text-primary hover:underline">Explore opportunities!</Link></p>
            )}
          </CardContent>
        </Card>

         {/* Quick Actions / Resources */}
        <Card className="md:col-span-3 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary">
              <BookOpenCheck className="h-5 w-5" /> Resources & Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="justify-start text-left h-auto py-3">
                <Link href="#">
                    <div className="flex items-center gap-3">
                        <Edit3 className="h-5 w-5 text-accent"/>
                        <div>
                            <p className="font-semibold">Submit a New Idea</p>
                            <p className="text-xs text-muted-foreground">Got a project concept? Share it!</p>
                        </div>
                    </div>
                </Link>
            </Button>
             <Button variant="outline" asChild className="justify-start text-left h-auto py-3">
                <Link href="#">
                    <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-accent"/>
                        <div>
                            <p className="font-semibold">Browse Projects</p>
                            <p className="text-xs text-muted-foreground">Find projects to join or get inspired.</p>
                        </div>
                    </div>
                </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start text-left h-auto py-3">
                <Link href="#">
                     <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-accent"/>
                        <div>
                            <p className="font-semibold">Update Your Profile</p>
                            <p className="text-xs text-muted-foreground">Keep your skills and info current.</p>
                        </div>
                    </div>
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
