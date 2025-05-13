
"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useMemo } from "react";
import { CalendarDays, Clock, Info, Eye } from "lucide-react"; // Added Info and Eye icons
import { format, isSameDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { getEvents } from "@/lib/firebase/firestore";
import { SchoolEvent } from "@/types/event"; 
import { useToast } from "@/hooks/use-toast";
import { EventDetailDialog } from "@/components/event-detail-dialog"; // Import detail dialog
import { Button } from "@/components/ui/button"; // Import Button

export default function StudentSchedulePage() {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [allEvents, setAllEvents] = useState<SchoolEvent[]>([]); 
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

    // State for showing event details
    const [selectedEventDetails, setSelectedEventDetails] = useState<SchoolEvent | null>(null);
    const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false);

    // Fetch all relevant events for the student/public
    useEffect(() => {
        const fetchStudentEvents = async () => {
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
        fetchStudentEvents(); 
    }, [toast]); 

    // Filter events based on the selected date using useMemo
    const eventsForSelectedDate = useMemo(() => {
        if (!selectedDate || !allEvents) return [];
        return allEvents
        .filter(event => isSameDay(event.date, selectedDate))
        .sort((a, b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime()); 
    }, [selectedDate, allEvents]);

    const openViewEventDialog = (event: SchoolEvent) => {
        setSelectedEventDetails(event);
        setShowEventDetailsDialog(true);
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="shadow-lg mb-6">
                <CardHeader>
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-8 w-8 text-primary" />
                    <CardTitle className="text-3xl font-bold text-primary">My Schedule</CardTitle>
                </div>
                <CardDescription>View your upcoming classes, events, and deadlines.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card className="shadow-md">
                        <CardContent className="p-2">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md p-0 [&_button]:h-8 [&_button]:w-8 [&_caption_label]:text-sm"
                             classNames={{
                                caption_label: "text-sm font-medium text-foreground",
                                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent/20 text-accent-foreground",
                            }}
                            modifiers={{ 
                                hasEvent: allEvents.map(e => e.date) 
                             }}
                             modifiersClassNames={{
                                hasEvent: 'relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary'
                             }}
                        />
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>
                                Events for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Selected Date"}
                            </CardTitle>
                             <CardDescription>
                                {isLoadingSchedule ? "Loading events..." : 
                                 eventsForSelectedDate.length > 0 ? `You have ${eventsForSelectedDate.length} event(s) scheduled.` : "No events scheduled for this day."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto p-4"> {/* Added padding */}
                           {isLoadingSchedule ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-20 w-full rounded-lg" />
                                    <Skeleton className="h-20 w-full rounded-lg" />
                                </div>
                           ) : eventsForSelectedDate.length === 0 ? (
                               <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
                                    <Info className="mx-auto h-10 w-10 mb-2 text-primary/50" />
                                    <p>No events scheduled for this day.</p>
                                </div>
                           ) : (
                                eventsForSelectedDate.map(event => (
                                    <div 
                                       key={event.id} 
                                       className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group relative"
                                       onClick={() => openViewEventDialog(event)}
                                    >
                                        <div className="p-2 bg-primary/10 rounded-full mt-1">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">Time: {event.time}</p>
                                            {event.description && <p className="text-sm text-muted-foreground truncate" title={event.description}>Details: {event.description}</p>}
                                            {/* Display price if available */}
                                            {event.price !== undefined && (
                                                <p className={`text-sm font-semibold ${event.price === 0 ? 'text-green-600' : 'text-primary'}`}>
                                                    {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                                                </p>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary" title="View Details">
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View Details</span>
                                        </Button>
                                    </div>
                                ))
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
             {/* Event Detail Dialog */}
            <EventDetailDialog
                event={selectedEventDetails}
                isOpen={showEventDetailsDialog}
                onOpenChange={setShowEventDetailsDialog}
            />
        </div>
    );
}
