
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { 
    ChevronLeft, ChevronRight, Search, Bell, MessageSquare, UserCircle, Users, MoreVertical, Calendar as CalendarIcon, ChevronDown, PlusCircle, Trash2, Edit3, Info
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, eachDayOfInterval, endOfMonth, isSameDay, isSameMonth } from "date-fns";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<SchoolEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<SchoolEvent | null>(null);


  const fetchAdminEvents = async () => {
    if (!user && !authLoading) {
      toast({ title: "Not Authenticated", description: "Please login to manage events.", variant: "destructive" });
      setIsLoadingEvents(false);
      return;
    }
    if(authLoading) return; // Wait for auth to complete

    setIsLoadingEvents(true);
    try {
      const fetchedEvents = await getEvents(true); // true for adminOnly
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

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const daysInMonthGrid = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfMonthWeekday = getDay(start); // 0 (Sun) - 6 (Sat)
    // Adjust to make Monday the first day (0 for Monday, 6 for Sunday)
    const startingDayOffset = (firstDayOfMonthWeekday === 0) ? 6 : firstDayOfMonthWeekday - 1; 
    
    const gridDays = Array(startingDayOffset).fill(null).concat(days);
    const remainingCells = (5 * 7) - gridDays.length; // Assuming 5 rows for simplicity, can be 6
    return gridDays.concat(Array(Math.max(0,remainingCells)).fill(null));
  }, [currentMonth]);


  const getEventsForDate = (date: Date): SchoolEvent[] => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events
      .filter(event => isSameDay(event.date, selectedDate))
      .sort((a,b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime());
  }, [selectedDate, events]);

  const handleEventFormSuccess = () => {
    setShowAddEventDialog(false);
    setEventToEdit(null);
    fetchAdminEvents(); // Refresh list
  };

  const openEditEventDialog = (event: SchoolEvent) => {
    setEventToEdit(event);
    setShowAddEventDialog(true);
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

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-secondary/30">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="md:hidden"><SidebarTrigger /></div>
          <h1 className="text-2xl font-semibold text-foreground">Events Management</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            {/* Month Navigation */}
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium text-foreground w-28 text-center">{format(currentMonth, "MMMM yyyy")}</span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            {/* Search (Placeholder) */}
            <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search events..." className="pl-9 h-9 rounded-full bg-background border-border" disabled/>
            </div>
             {/* Add Event Button */}
            <Dialog open={showAddEventDialog} onOpenChange={(isOpen) => {
                setShowAddEventDialog(isOpen);
                if (!isOpen) setEventToEdit(null); // Reset edit state when dialog closes
            }}>
              <DialogTrigger asChild>
                <Button className="h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-4" onClick={() => {setEventToEdit(null); setShowAddEventDialog(true);}}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{eventToEdit ? "Edit Event" : "Add New Event"}</DialogTitle>
                  <DialogDescription>
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

      <div className="flex-grow flex flex-col lg:flex-row gap-6">
        <div className="flex-grow lg:w-2/3 bg-card p-4 rounded-lg shadow">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <div key={day}>{day}</div>)}
            </div>
            {isLoadingEvents ? (
                 <div className="grid grid-cols-7 grid-rows-5 gap-1 h-[calc(100%-2rem-0.5rem)]">
                    {Array.from({length: 35}).map((_, i) => <div key={i} className="bg-muted/30 rounded-md animate-pulse min-h-[80px]"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-7 grid-rows-5 gap-1 h-[calc(100%-2rem-0.5rem)]">
                    {daysInMonthGrid.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} className="bg-secondary/40 rounded-md"></div>;
                        
                        const dayEvents = getEventsForDate(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentMonthDay = isSameMonth(day, currentMonth);

                        return (
                            <div 
                                key={day.toString()} 
                                onClick={() => { setSelectedDate(day); }}
                                className={`p-2 rounded-md cursor-pointer transition-colors min-h-[80px] flex flex-col justify-between
                                    ${isSelected ? 'bg-primary text-primary-foreground shadow-lg scale-105 ring-2 ring-primary-foreground ring-offset-2 ring-offset-primary' : 'bg-background hover:bg-muted/50'}
                                    ${!isCurrentMonthDay ? 'text-muted-foreground/50 bg-secondary/20' : 'text-foreground'}
                                `}
                            >
                                <span className={`font-medium text-sm ${isSelected ? '' : (isCurrentMonthDay ? 'text-right' : 'text-right text-muted-foreground/50')}`}>{format(day, "d")}</span>
                                {isCurrentMonthDay && dayEvents.length > 0 && (
                                    <div className="mt-auto">
                                        {isSelected && dayEvents[0]?.title && (
                                            <p className="text-xs font-semibold truncate mt-1">{dayEvents[0].title}
                                                {dayEvents.length > 1 && <span className="text-primary-foreground/80"> +{dayEvents.length-1}</span>}
                                            </p>
                                        )}
                                        {!isSelected && (
                                        <div className="flex space-x-1 mt-1 justify-start">
                                                {dayEvents.slice(0, 3).map(e => (
                                                    <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${e.color || 'bg-gray-400'}`} title={e.title}></span>
                                                ))}
                                                {dayEvents.length > 3 && <span className="text-xs font-light text-muted-foreground/80">+</span>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        <Card className="lg:w-1/3 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">
                {selectedDate ? `Events for ${format(selectedDate, "MMM do, yyyy")}` : "Event List"}
            </CardTitle>
            <CardDescription className="text-xs">
                {selectedDateEvents.length > 0 ? `${selectedDateEvents.length} event(s) scheduled.` : "No events for this day. Select a day on the calendar."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             {isLoadingEvents && selectedDateEvents.length === 0 && (
                <div className="p-4 space-y-2">
                    <div className="h-16 bg-muted/50 rounded animate-pulse"></div>
                    <div className="h-16 bg-muted/50 rounded animate-pulse"></div>
                </div>
             )}
             {!isLoadingEvents && selectedDateEvents.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                    <Info className="mx-auto h-10 w-10 mb-2 text-primary/50" />
                    <p>No events scheduled for this day.</p>
                    <p className="text-xs mt-1">Click "Add New Event" to create one.</p>
                </div>
             )}
            <div className="max-h-[calc(100vh-20rem)] overflow-y-auto event-list-scrollbar">
            {selectedDateEvents.map((event) => (
              <div key={event.id} className="p-4 border-b last:border-b-0 hover:bg-muted/30 relative group">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
                  {event.price !== undefined && event.price > 0 && <span className="text-sm font-bold text-primary">${event.price.toFixed(2)}</span>}
                  {event.price === 0 && <span className="text-sm font-semibold text-green-600">Free</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  <CalendarIcon className="inline h-3 w-3 mr-1" /> {format(event.date, "MMM do, yyyy")} &nbsp;
                  <Clock className="inline h-3 w-3 mr-1" /> {event.time}
                </p>
                {event.description && <p className="text-xs text-muted-foreground mb-2 truncate" title={event.description}>{event.description}</p>}
                {event.totalTickets !== undefined && event.ticketsLeft !== undefined && (
                  <>
                    <Progress value={( (event.totalTickets - event.ticketsLeft) / event.totalTickets) * 100} className="h-1.5 mb-1" />
                    <p className="text-xs text-muted-foreground">{event.ticketsLeft} of {event.totalTickets} tickets left</p>
                  </>
                )}
                 <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-700" onClick={() => openEditEventDialog(event)}>
                        <Edit3 className="h-4 w-4"/> <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => setEventToDelete(event)}>
                            <Trash2 className="h-4 w-4"/> <span className="sr-only">Delete</span>
                        </Button>
                    </AlertDialogTrigger>
                </div>
              </div>
            ))}
            </div>
          </CardContent>
           <CardFooter className="p-4 border-t">
                <Button variant="outline" className="w-full rounded-full" disabled>View All Month Events (Soon)</Button>
           </CardFooter>
        </Card>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!eventToDelete} onOpenChange={(isOpen) => !isOpen && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{eventToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const Clock = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
