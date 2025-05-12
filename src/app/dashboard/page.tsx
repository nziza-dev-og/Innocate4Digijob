
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth-hook";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react"; // Added useMemo
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowRight, BookOpen, Briefcase, CalendarCheck, DollarSign, PlusCircle, UserCircle2, Users, Video, Clock, Loader2, Info, CheckCircle } from "lucide-react"; // Added CheckCircle
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getEvents } from "@/lib/firebase/firestore";
import type { SchoolEvent } from "@/types/event";
import { format, isSameDay } from "date-fns"; // Added isSameDay
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface UserData {
  displayName: string;
  email: string;
  photoURL?: string | null;
}

const feedbackActivityData = [
  { month: "Jun", good: 60, bad: 20 },
  { month: "Jul", good: 75, bad: 10 },
  { month: "Aug", good: 90, bad: 5 },
  { month: "Sep", good: 50, bad: 30, label: "146 Feedback!" },
  { month: "Oct", good: 85, bad: 15 },
  { month: "Nov", good: 70, bad: 25 },
  { month: "Dec", good: 65, bad: 5 },
];

const chartConfig = {
  good: { label: "Good Feedback", color: "hsl(var(--chart-2))" },
  bad: { label: "Bad Feedback", color: "hsl(var(--primary))" },
};

const eventIconMap: { [key: string]: React.ElementType } = {
    "Multimedia Class": UserCircle2,
    "DKV Class": Briefcase,
    "Multimedia": Users,
    "default": CalendarCheck,
};
const eventIconBgMap: { [key: string]: string } = {
    "Multimedia Class": "bg-blue-100",
    "DKV Class": "bg-green-100",
    "Multimedia": "bg-yellow-100",
    "default": "bg-gray-100",
};
const eventIconColorMap: { [key: string]: string } = {
    "Multimedia Class": "text-blue-500",
    "DKV Class": "text-green-500",
    "Multimedia": "text-yellow-500",
    "default": "text-gray-500",
};


export default function UserDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Renamed from calendarDate
  const [allEvents, setAllEvents] = useState<SchoolEvent[]>([]); // Store all fetched events
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);


  useEffect(() => {
    if (user && !authLoading) {
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

  // Fetch all relevant events for the student/public
  useEffect(() => {
    const fetchStudentEvents = async () => {
      // No need to check for user here, getEvents handles visibility based on adminOnly flag
      setIsLoadingSchedule(true);
      try {
        // Fetch events accessible to students ('student' or 'public' audience)
        const fetchedEvents = await getEvents(false); // false -> not admin only
        setAllEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching schedule events:", error);
        toast({ title: "Error", description: "Could not fetch schedule.", variant: "destructive" });
      } finally {
        setIsLoadingSchedule(false);
      }
    };
     fetchStudentEvents(); // Fetch events regardless of login state for public visibility
  }, [toast]); // Removed user dependency, events might be public

  // Filter events based on the selected date using useMemo
  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate || !allEvents) return [];
    return allEvents
      .filter(event => isSameDay(event.date, selectedDate))
      .sort((a, b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime()); // Sort by time
  }, [selectedDate, allEvents]);


  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
         <div className="space-y-4 p-8 w-full max-w-4xl">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Skeleton className="h-32 w-full" />
                 <Skeleton className="h-32 w-full" />
                 <Skeleton className="h-32 w-full" />
            </div>
             <Skeleton className="h-64 w-full" />
        </div>
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
    <div className="space-y-6 p-6"> {/* Added padding */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Left and Middle) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Good Morning Card */}
          <Card className="bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg overflow-hidden">
             <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-2/3">
                    <p className="text-sm">Good Morning,</p>
                    <h2 className="text-3xl font-bold mb-4">{userData.displayName}</h2>
                    <Button asChild variant="secondary" className="bg-white text-green-500 hover:bg-gray-100 rounded-full">
                        <Link href="/dashboard/schedule">View All Schedule</Link>
                    </Button>
                </div>
                <div className="mt-4 md:mt-0 md:w-1/3 flex justify-center md:justify-end">
                    <Image
                        src="https://picsum.photos/seed/student-dashboard/200/200"
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
                <p className="text-xs text-muted-foreground">Next Event</p>
                <p className="text-lg font-semibold text-foreground">
                   {allEvents.filter(e => e.date >= new Date()).sort((a,b) => a.date.getTime() - b.date.getTime())[0]?.title || "No upcoming"}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                 <div className="p-3 rounded-full bg-blue-100 mb-2">
                    <BookOpen className="h-6 w-6 text-blue-500" /> {/* Changed Icon */}
                 </div>
                <p className="text-2xl font-bold text-foreground">2</p> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">Courses In Progress</p>
              </CardContent>
            </Card>
             <Card className="shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                 <div className="p-3 rounded-full bg-purple-100 mb-2">
                    <CheckCircle className="h-6 w-6 text-purple-500" /> {/* Changed Icon */}
                 </div>
                <p className="text-2xl font-bold text-foreground">5</p> {/* Placeholder */}
                <p className="text-xs text-muted-foreground">Courses Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Activity Chart */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Feedback Activity</CardTitle>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled>Month <ArrowRight className="ml-1 h-3 w-3"/></Button>
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
                <Button asChild variant="default" className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 px-6">
                     <Link href="/dashboard/courses">
                        <PlusCircle className="mr-2 h-5 w-5" /> Explore Courses
                    </Link>
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
                    selected={selectedDate}
                    onSelect={setSelectedDate} // Update the selectedDate state
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
              <CardTitle className="text-base font-semibold">
                Schedule for {selectedDate ? format(selectedDate, "MMM do") : "Today"}
              </CardTitle>
              <Button asChild variant="link" size="sm" className="text-primary hover:underline text-xs">
                  <Link href="/dashboard/schedule">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[150px]"> {/* Added min-height */}
              {isLoadingSchedule ? (
                <div className="space-y-3 p-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : eventsForSelectedDate.length === 0 ? ( // Use filtered events
                 <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                    <Info className="h-8 w-8 mb-2 text-primary/50" />
                    <p className="text-sm">No events scheduled for this day.</p>
                </div>
              ) : (
                eventsForSelectedDate.map(event => { // Use filtered events
                    const Icon = eventIconMap[event.description || 'default'] || eventIconMap.default;
                    const iconBg = eventIconBgMap[event.description || 'default'] || eventIconBgMap.default;
                    const iconColor = eventIconColorMap[event.description || 'default'] || eventIconColorMap.default;
                    return (
                        <div key={event.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                            <div className={`p-2 rounded-full ${iconBg}`}>
                                <Icon className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">{event.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    <Clock className="inline h-3 w-3 mr-1" /> {format(event.date, "MMM d")} @ {event.time} - {event.description || "Event"}
                                </p>
                            </div>
                        </div>
                    );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
