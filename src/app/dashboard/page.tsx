
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth-hook";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { ArrowRight, BookOpen, Briefcase, CalendarCheck, DollarSign, PlusCircle, Search, Smile, UserCircle2, Users, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserData {
  displayName: string;
  email: string;
  photoURL?: string | null;
  // Add other student-specific data from Firestore if needed
}

// Sample data (replace with Firebase data)
const feedbackActivityData = [
  { month: "Jun", good: 60, bad: 20 },
  { month: "Jul", good: 75, bad: 10 },
  { month: "Aug", good: 90, bad: 5 },
  { month: "Sep", good: 50, bad: 30, label: "146 Feedback!" }, // Example with label
  { month: "Oct", good: 85, bad: 15 },
  { month: "Nov", good: 70, bad: 25 },
  { month: "Dec", good: 65, bad: 5 },
];

const chartConfig = {
  good: { label: "Good Feedback", color: "hsl(var(--chart-2))" }, // Green
  bad: { label: "Bad Feedback", color: "hsl(var(--primary))" }, // Blue (or another contrasting color like red)
};

const scheduleItems = [
    { title: "How To Use Pen Tool", time: "08:20 - 09:00", type: "Multimedia Class", icon: UserCircle2, iconBg: "bg-blue-100", iconColor: "text-blue-500" },
    { title: "Create Short CBR", time: "10:00 - 12:00", type: "DKV Class", icon: Briefcase, iconBg: "bg-green-100", iconColor: "text-green-500" },
    { title: "Masking Technique", time: "13:00 - 14:30", type: "Multimedia", icon: Users, iconBg: "bg-yellow-100", iconColor: "text-yellow-500" },
];


export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date(2022,0,1)); // January 2022 from image


  useEffect(() => {
    if (user && !authLoading) {
      // Simulate fetching user data (already done in AuthProvider, user object has basic info)
      setUserData({
        displayName: user.displayName || "Student",
        email: user.email || "No email",
        photoURL: user.photoURL,
      });
      setIsLoading(false);
    } else if (!authLoading) {
      setIsLoading(false); 
    }
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading dashboard...</p> {/* Replace with a proper loader skeleton */}
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Left and Middle) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Good Morning Card */}
          <Card className="bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-2/3">
                <p className="text-sm">Good Morning,</p>
                <h2 className="text-3xl font-bold mb-4">{userData.displayName}</h2>
                <Button variant="secondary" className="bg-white text-green-500 hover:bg-gray-100 rounded-full">
                  View All Schedule
                </Button>
              </div>
              <div className="mt-4 md:mt-0 md:w-1/3 flex justify-center md:justify-end">
                 <Image 
                    src="https://picsum.photos/seed/student-dashboard/200/200" // Placeholder
                    alt="Student illustration" 
                    width={150} 
                    height={150} 
                    className="rounded-lg object-cover"
                    data-ai-hint="student illustration"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 mb-3 ring-2 ring-offset-2 ring-pink-400">
                    <AvatarImage src="https://picsum.photos/seed/fav-student/100/100" data-ai-hint="student avatar" />
                    <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Upcoming Event</p>
                <p className="text-lg font-semibold text-foreground">Science Fair Prep</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                 <div className="p-3 rounded-full bg-blue-100 mb-2">
                    <DollarSign className="h-6 w-6 text-blue-500" />
                 </div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground">Courses In Progress</p>
              </CardContent>
            </Card>
             <Card className="shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                 <div className="p-3 rounded-full bg-purple-100 mb-2">
                    <BookOpen className="h-6 w-6 text-purple-500" />
                 </div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Courses Completed</p>
              </CardContent>
            </Card>
          </div>
            
          {/* Feedback Activity Chart */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Feedback Activity</CardTitle>
              {/* Month selector can be added here */}
              <Button variant="outline" size="sm" className="h-8 text-xs">Month <ArrowRight className="ml-1 h-3 w-3"/></Button>
            </CardHeader>
            <CardContent className="h-[250px] p-2">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart data={feedbackActivityData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="good" fill="var(--color-good)" radius={[4, 4, 0, 0]} barSize={15}/>
                  <Bar dataKey="bad" fill="var(--color-bad)" radius={[4, 4, 0, 0]} barSize={15}/>
                </BarChart>
              </ChartContainer>
            </CardContent>
             <CardFooter className="pt-4 border-t">
                <Button variant="default" className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 px-6">
                    <PlusCircle className="mr-2 h-5 w-5" /> Explore Courses
                </Button>
             </CardFooter>
          </Card>
        </div>

        {/* Right Sidebar Content */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardContent className="p-2">
                <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={setCalendarDate}
                    className="rounded-md p-0 [&_button]:h-8 [&_button]:w-8 [&_caption_label]:text-sm"
                    classNames={{
                        caption_label: "text-sm font-medium text-foreground",
                        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent/20 text-accent-foreground",
                    }}
                />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Schedule</CardTitle>
              <Button variant="link" size="sm" className="text-primary hover:underline text-xs">View All</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduleItems.map(item => (
                <div key={item.title} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <div className={`p-2 rounded-full ${item.iconBg}`}>
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.time} - {item.type}</p>
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
