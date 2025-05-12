
"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { CalendarDays, Clock, Info } from "lucide-react"; // Added Info icon
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
// Assuming SchoolEvent type is defined elsewhere
// import { SchoolEvent } from "@/types/event"; 

// Placeholder data - replace with actual data fetching
const isLoadingSchedule = false; // Set to true when fetching data
const scheduleEvents: any[] = [ // Replace 'any' with SchoolEvent[] when type is available
    { id: 'evt1', title: 'Multimedia Class Introduction', date: new Date(2024, 6, 25), time: '09:00', description: 'Room 101' },
    { id: 'evt2', title: 'Project Brainstorming Session', date: new Date(2024, 6, 25), time: '11:00', description: 'Innovation Lab' },
    { id: 'evt3', title: 'DKV Workshop', date: new Date(2024, 6, 27), time: '14:00', description: 'Online' },
];

export default function StudentSchedulePage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const eventsForSelectedDate = scheduleEvents.filter(event => 
        selectedDate && format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    ).sort((a,b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime());

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
                        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                           {isLoadingSchedule ? (
                                <div className="space-y-3 p-3">
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                </div>
                           ) : eventsForSelectedDate.length === 0 ? (
                               <div className="p-6 text-center text-muted-foreground">
                                    <Info className="mx-auto h-10 w-10 mb-2 text-primary/50" />
                                    <p>No events scheduled for this day.</p>
                                </div>
                           ) : (
                                eventsForSelectedDate.map(event => (
                                    <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                        <div className="p-2 bg-primary/10 rounded-full mt-1">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">Time: {event.time}</p>
                                            {event.description && <p className="text-sm text-muted-foreground">Details: {event.description}</p>}
                                        </div>
                                    </div>
                                ))
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
