
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { 
    ChevronLeft, ChevronRight, Search, Bell, MoreVertical, Calendar as CalendarIcon, ChevronDown, PlusCircle, Eye, Edit3, Trash2, Activity, Users, CheckSquare, Briefcase, ThumbsUp, Paperclip, UserPlus, KeyRound, LineChart as LineChartIcon, Settings, LogOut as LogOutIcon, Filter, ListFilter, CalendarDays, Clock // Added Clock
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { format, addMonths, subMonths, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import type { SchoolEvent } from "@/types/event";
import { getEvents, deleteEvent } from "@/lib/firebase/firestore";
import { AddEventForm } from "@/components/admin/add-event-form";
import { useAuth } from "@/hooks/use-auth-hook";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventDetailDialog } from "@/components/event-detail-dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Placeholder data for charts - replace with actual data fetching
const dailySalesData = [
  { name: 'Jan', sales: 200 }, { name: 'Feb', sales: 150 }, { name: 'Mar', sales: 300 },
  { name: 'Apr', sales: 450 }, { name: 'May', sales: 250 }, { name: 'Jun', sales: 350 },
];
const weeklyInvoicesData = [
  { name: 'W1', invoices: 20 }, { name: 'W2', invoices: 35 }, { name: 'W3', invoices: 25 },
  { name: 'W4', invoices: 40 }, { name: 'W5', invoices: 30 },
];
const projectProgressData = [
  { name: 'P1', progress: 30 }, { name: 'P2', progress: 50 }, { name: 'P3', progress: 70 },
  { name: 'P4', progress: 60 }, { name: 'P5', progress: 85 },
];


export default function AdminDashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentScheduleDate, setCurrentScheduleDate] = useState(new Date());
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<SchoolEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<SchoolEvent | null>(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState<SchoolEvent | null>(null);
  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false);

  const fetchAdminEvents = async () => {
    if (!user && !authLoading) {
      toast({ title: "Not Authenticated", description: "Please login to manage events.", variant: "destructive" });
      setIsLoadingEvents(false);
      return;
    }
    if(authLoading) return; 

    setIsLoadingEvents(true);
    try {
      // Fetch only events created by the current admin
      const fetchedEvents = await getEvents(true); // true -> admin only
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({ title: "Error", description: "Could not fetch events.", variant: "destructive" });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchAdminEvents();
  }, [user, authLoading]);

  // Use selectedDate for filtering, not currentScheduleDate for events list
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handlePrevScheduleDay = () => setSelectedDate(prevDate => subMonths(prevDate || new Date(), 1)); 
  const handleNextScheduleDay = () => setSelectedDate(prevDate => addMonths(prevDate || new Date(), 1)); 

  const scheduleEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events
      .filter(event => isSameDay(event.date, selectedDate))
      .sort((a,b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime());
  }, [selectedDate, events]);

  const handleEventFormSuccess = () => {
    setShowAddEventDialog(false);
    setEventToEdit(null);
    fetchAdminEvents(); 
  };

  const openEditEventDialog = (event: SchoolEvent) => {
    setEventToEdit(event);
    setShowAddEventDialog(true);
  };

  const openViewEventDialog = (event: SchoolEvent) => {
    setSelectedEventDetails(event);
    setShowEventDetailsDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete.id);
      toast({ title: "Event Deleted", description: `${eventToDelete.title} has been removed.` });
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ title: "Error", description: "Could not delete event.", variant: "destructive" });
    }
  };

  // Stats cards data (placeholders)
  const statCards = [
    { title: "Tasks Completed", value: "27", change: "-12%", icon: CheckSquare, color: "bg-gradient-to-br from-blue-500 to-blue-700" },
    { title: "New Tasks Assigned", value: "45", change: "+8%", icon: PlusCircle, color: "bg-gradient-to-br from-green-500 to-green-700" },
    { title: "Objectives Completed", value: "24", change: "-4%", icon: Activity, color: "bg-gradient-to-br from-yellow-500 to-yellow-600" },
    { title: "Project Completed", value: "61%", change: "+3%", icon: Briefcase, color: "bg-gradient-to-br from-purple-500 to-purple-700" },
  ];

  const bottomStats = [
      { label: "Likes", value: "16", icon: ThumbsUp },
      { label: "Attachments", value: "32", icon: Paperclip },
      { label: "Team Members", value: "24", icon: UserPlus },
      { label: "Access Creds", value: "40", icon: KeyRound },
  ];

  if (authLoading && !user) {
      return <div className="flex h-full items-center justify-center p-6 text-foreground">Loading dashboard...</div>;
  }


  return (
    <div className="flex h-full bg-background text-foreground">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 md:p-8 space-y-6 overflow-y-auto main-content-scrollbar">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Stats</h1>
                <p className="text-sm text-muted-foreground">MONTHLY UPDATES</p>
            </div>
            <div className="flex items-center gap-3">
                 <div className="relative min-w-[150px] sm:min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search..." className="pl-9 h-10 rounded-full bg-card border-border focus:border-primary text-sm" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 rounded-full text-sm">
                            iOS App Project <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Android App Project</DropdownMenuItem>
                        <DropdownMenuItem>Web Platform</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        {/* Top Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3 bg-card shadow-xl">
                <CardHeader>
                    <CardTitle className="text-lg">Daily Sales Activity</CardTitle>
                    <CardDescription className="text-xs">Today vs Yesterday</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] pr-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailySalesData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false}/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                            <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip cursor={{fill: 'hsl(var(--muted)/0.3)'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: 'var(--radius)', borderColor: 'hsl(var(--border))'}} />
                            <Bar dataKey="sales" radius={[8, 8, 0, 0]} barSize={20}>
                                {dailySalesData.map((entry, index) => (
                                    <rect key={`bar-${index}`} fill={entry.name === 'Apr' ? 'hsl(var(--primary))' : `hsl(var(--chart-${(index % 3) + 1}))`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2 bg-card shadow-xl">
                <CardHeader>
                    <CardTitle className="text-lg">Weekly Invoices</CardTitle>
                    <CardDescription className="text-xs">From 12 Oct - 24 Nov</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] pr-2">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyInvoicesData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" horizontal={false}/>
                            <XAxis type="number" axisLine={false} tickLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" width={30}/>
                            <Tooltip cursor={{fill: 'hsl(var(--muted)/0.3)'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: 'var(--radius)', borderColor: 'hsl(var(--border))'}}/>
                            <Bar dataKey="invoices" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} barSize={15}/>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
                <Card key={index} className={cn("text-white shadow-xl overflow-hidden", card.color)}>
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-2.5 bg-black/20 rounded-lg">
                                <card.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-xs uppercase tracking-wider">{card.title}</p>
                        <p className="text-4xl font-bold mt-1">{card.value}</p>
                        <p className={cn("text-xs mt-1", parseFloat(card.change) > 0 ? "text-green-300" : "text-red-300")}>{card.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Bottom Stats and Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-lg">Project Activity</CardTitle>
                 </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {bottomStats.map(stat => (
                             <div key={stat.label} className="bg-secondary p-3 rounded-lg text-center">
                                <stat.icon className="h-5 w-5 mx-auto mb-1.5 text-primary"/>
                                <p className="text-sm font-medium">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                     <div className="h-[150px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={projectProgressData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" vertical={false}/>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} stroke="hsl(var(--muted-foreground))"/>
                                <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="hsl(var(--muted-foreground))"/>
                                <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: 'var(--radius)', borderColor: 'hsl(var(--border))'}}/>
                                <Line type="monotone" dataKey="progress" strokeWidth={3} stroke="hsl(var(--primary))" dot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} activeDot={{ r: 6 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 pt-4">
                     <Button variant="outline" className="w-full rounded-lg">View Project Details</Button>
                </CardFooter>
            </Card>

             {/* Project Progress (Placeholder - design uses a line chart) */}
            <Card className="bg-card shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                    <CardDescription className="text-xs">Key project milestones</CardDescription>
                 </CardHeader>
                <CardContent className="space-y-3">
                    {/* Placeholder for deadlines */}
                    {[1,2,3,4].map(i => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-secondary rounded-lg">
                            <div>
                                <p className="text-sm font-medium">Milestone {i}</p>
                                <p className="text-xs text-muted-foreground">Due: {format(new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000), "MMM dd, yyyy")}</p>
                            </div>
                            {/* Removed incorrect indicatorClassName prop */}
                            <Progress value={(i*20)+10} className="w-20 h-1.5 bg-muted" /> 
                        </div>
                    ))}
                </CardContent>
                 <CardFooter className="border-t border-border/50 pt-4">
                     <Button variant="outline" className="w-full rounded-lg">View All Deadlines</Button>
                </CardFooter>
            </Card>
        </div>
      </div>

      {/* Right Schedule Sidebar */}
      <div className="w-full md:w-96 bg-card border-l border-border flex flex-col h-full shadow-2xl">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={handlePrevScheduleDay} className="h-8 w-8"><ChevronLeft className="h-5 w-5" /></Button>
                 {/* Format the selectedDate for display */}
                 <Button variant="ghost" className="text-sm font-medium h-8 px-2">{selectedDate ? format(selectedDate, "EEE, dd MMM") : "Select Date"}</Button>
                 <Button variant="ghost" size="icon" onClick={handleNextScheduleDay} className="h-8 w-8"><ChevronRight className="h-5 w-5" /></Button>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ListFilter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
            </div>
        </div>
        <ScrollArea className="flex-grow p-4 event-list-scrollbar">
            {isLoadingEvents ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <Card key={i} className="p-4 bg-secondary animate-pulse h-20 rounded-xl"></Card>)}
                </div>
            ) : scheduleEvents.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                    <p>No events for {selectedDate ? format(selectedDate, "MMM do") : "this date"}.</p>
                </div>
            ) : (
                scheduleEvents.map((event) => (
                    <Card key={event.id} className="mb-3 bg-secondary/70 hover:bg-secondary rounded-xl shadow-md transition-all cursor-pointer group" onClick={() => openViewEventDialog(event)}>
                        <CardContent className="p-4 flex items-start gap-3">
                            <Avatar className="h-10 w-10 mt-1">
                                <AvatarImage src={`https://picsum.photos/seed/${event.id}/40/40`} data-ai-hint="event icon"/>
                                <AvatarFallback>{event.title?.[0] || 'E'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm text-foreground group-hover:text-primary">{event.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                   <Clock className="inline h-3 w-3 mr-1" /> {event.time} {event.description ? `• ${event.description}` : ''}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">Audience: {event.audience || 'Admin'}</p>
                            </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical className="h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openViewEventDialog(event)}><Eye className="mr-2 h-4 w-4"/>View</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEditEventDialog(event)}><Edit3 className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={() => setEventToDelete(event)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4"/>Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>
                    </Card>
                ))
            )}
        </ScrollArea>
        <div className="p-4 border-t border-border/50">
            <Dialog open={showAddEventDialog} onOpenChange={(isOpen) => {
                setShowAddEventDialog(isOpen);
                if (!isOpen) setEventToEdit(null);
            }}>
              <DialogTrigger asChild>
                <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-3" onClick={() => {setEventToEdit(null); setShowAddEventDialog(true);}}>
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-card">
                <DialogHeader>
                  <DialogTitle className="text-foreground">{eventToEdit ? "Edit Event" : "Add New Event"}</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {eventToEdit ? "Update the details for your event." : "Fill in the details for your new event."}
                  </DialogDescription>
                </DialogHeader>
                <AddEventForm 
                    eventToEdit={eventToEdit}
                    onFormSubmit={handleEventFormSuccess} 
                    onCancel={() => { setShowAddEventDialog(false); setEventToEdit(null); }}
                />
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Modals */}
      <AlertDialog open={!!eventToDelete} onOpenChange={(isOpen) => !isOpen && setEventToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the event "{eventToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)} className="text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <EventDetailDialog
        event={selectedEventDetails}
        isOpen={showEventDetailsDialog}
        onOpenChange={setShowEventDetailsDialog}
      />
    </div>
  );
}

