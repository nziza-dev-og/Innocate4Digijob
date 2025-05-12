
"use client";

import { Button } from "@/components/ui/button";
import { Calendar }  from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { 
    ChevronLeft, ChevronRight, Search, Bell, MessageSquare, UserCircle, Users, MoreVertical, Calendar as CalendarIcon 
} from "lucide-react";
import { useState, useEffect } from "react";
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, eachDayOfInterval, endOfMonth } from "date-fns";
import { SidebarTrigger } from "@/components/ui/sidebar";


// Sample event data (replace with Firebase data)
interface SchoolEvent {
  id: string;
  date: Date;
  title: string;
  time: string;
  price?: number;
  ticketsLeft?: number;
  totalTickets?: number;
  attendees?: string[]; // Avatar URLs
  color?: string; // For dots in calendar
}

const sampleEvents: SchoolEvent[] = [
  { id: "1", date: new Date(2021, 11, 6), title: "Movie Night", time: "07:00 - 10:00 PM", price: 5.0, ticketsLeft: 23, totalTickets: 100, attendees: ["https://picsum.photos/20/20?random=1", "https://picsum.photos/20/20?random=2", "https://picsum.photos/20/20?random=3"], color: "bg-blue-500" },
  { id: "2", date: new Date(2021, 11, 10), title: "Franklin, 2+", time: "All Day", price: 600.00, color: "bg-green-500" },
  { id: "3", date: new Date(2021, 11, 15), title: "Art Exhibition", time: "10:00 AM - 04:00 PM", attendees: ["https://picsum.photos/20/20?random=4", "https://picsum.photos/20/20?random=5"], color: "bg-yellow-500"},
  { id: "4", date: new Date(2021, 11, 18), title: "Franklin, 2+", time: "All Day", price: 600.00, color: "bg-green-500" },
  { id: "5", date: new Date(2021, 11, 28), title: "Hawkins", time: "Full Day", price: 600.00, color: "bg-red-500"},
  { id: "6", date: new Date(2021, 11, 2), title: "Staff Meeting", time: "02:00 PM", color: "bg-indigo-500"},
  { id: "7", date: new Date(2021, 11, 23), title: "Parent Conference", time: "09:00 AM - 05:00 PM", color: "bg-purple-500"},
  { id: "evt_movie_night", date: new Date(2020, 10, 20), title: "Movie Night", time: "07:00 - 10:00 PM", price: 5.0, ticketsLeft: 23, totalTickets: 100 },
  { id: "evt_color_run", date: new Date(2020, 10, 6), title: "Color Run", time: "07:00 - 10:00 PM", price: 0, ticketsLeft: 17, totalTickets: 50 },
  { id: "evt_hostage_situation", date: new Date(2020, 10, 20), title: "Hostage Situation", time: "07:00 - 10:00 PM", price: 5.0, ticketsLeft: 4, totalTickets: 30 },
  { id: "evt_yard_sale", date: new Date(2020, 10, 20), title: "Yard Sale", time: "07:00 - 10:00 PM", price: 5.0, ticketsLeft: 13, totalTickets: 25 },
];


export default function AdminDashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2021, 11, 1)); // December 2021
  const [events, setEvents] = useState<SchoolEvent[]>(sampleEvents); // Later from Firebase
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2021, 11, 6));


  // TODO: Fetch events from Firebase based on currentMonth
  useEffect(() => {
    // const fetchEvents = async () => { ... }
    // fetchEvents();
    const eventsForSelectedDate = sampleEvents.filter(event => 
        event.date.getFullYear() === selectedDate?.getFullYear() &&
        event.date.getMonth() === selectedDate?.getMonth() &&
        event.date.getDate() === selectedDate?.getDate()
    );
    // For the event list, we might want to show upcoming events or events for the month
    // For now, let's show events from the sample that match the initial selected date's month
    const initialEventsForList = sampleEvents.filter(event =>
        event.date.getFullYear() === currentMonth.getFullYear() &&
        event.date.getMonth() === currentMonth.getMonth()
    ).sort((a,b) => a.date.getTime() - b.date.getTime());

    // The provided image shows event list for "Nov 20th, 2020", let's hardcode that for display for now
    setEvents(sampleEvents.filter(e => e.id.startsWith("evt_")));


  }, [currentMonth, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfMonth = getDay(startOfMonth(currentMonth)); // 0 for Sunday, 1 for Monday etc.
  
  // Adjust to make Monday the first day of the week (0 for Monday)
  const adjustedFirstDayOfMonth = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;


  const getEventsForDate = (date: Date): SchoolEvent[] => {
    return sampleEvents.filter(event => 
      event.date.getFullYear() === date.getFullYear() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getDate() === date.getDate()
    );
  };


  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-secondary/30"> {/* Light gray background for the page */}
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
             {/* SidebarTrigger should ideally be in AdminHeader, but for this specific layout, if AdminHeader is not used or very minimal */}
             {/* This is a bit of a hack if AdminHeader isn't providing it. */}
            <SidebarTrigger />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Events</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium text-foreground w-28 text-center">{format(currentMonth, "MMMM yyyy")}</span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search here..." className="pl-9 h-9 rounded-full bg-background border-border" />
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/50"><Bell className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/50"><MessageSquare className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/50"><UserCircle className="h-5 w-5"/></Button>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 rounded-full text-xs px-3">
                        ENGLISH <ChevronDown className="ml-1 h-3 w-3"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>English</DropdownMenuItem>
                    <DropdownMenuItem>French</DropdownMenuItem>
                    <DropdownMenuItem>Kinyarwanda</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button className="h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-4">
                <Users className="mr-2 h-4 w-4" /> New Teachers
            </Button>
        </div>
      </div>

      {/* Main Content Area: Calendar + Event List */}
      <div className="flex-grow flex flex-col lg:flex-row gap-6">
        {/* Calendar View */}
        <div className="flex-grow lg:w-2/3 bg-card p-4 rounded-lg shadow">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                    <div key={day}>{day.slice(0,3)}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 gap-1 h-[calc(100%-2rem-0.5rem)]">
                {/* Empty cells for days before the start of the month */}
                {Array.from({ length: adjustedFirstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-secondary/40 rounded-md"></div>
                ))}
                {/* Calendar Days */}
                {days.map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                    return (
                        <div 
                            key={day.toString()} 
                            onClick={() => setSelectedDate(day)}
                            className={`p-2 rounded-md cursor-pointer transition-colors min-h-[80px] flex flex-col justify-between
                                ${isSelected ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-background hover:bg-muted/50'}
                                ${day.getMonth() !== currentMonth.getMonth() ? 'text-muted-foreground/50' : 'text-foreground'}
                            `}
                        >
                            <span className={`font-medium text-sm ${isSelected ? '' : 'text-right'}`}>{format(day, "d")}</span>
                            {dayEvents.length > 0 && (
                                <div className="mt-auto">
                                    {dayEvents.length <=3 && dayEvents[0].attendees && dayEvents[0].attendees.length > 0 && !isSelected && (
                                        <div className="flex -space-x-1 overflow-hidden justify-start mt-1">
                                            {dayEvents[0].attendees.slice(0,3).map((att, idx) => (
                                                <Avatar key={idx} className="inline-block h-4 w-4 rounded-full ring-1 ring-background">
                                                    <AvatarImage src={att} data-ai-hint="user avatar small" />
                                                    <AvatarFallback>U</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {dayEvents[0].attendees.length > 3 && <span className="text-xs font-light pl-1.5 pt-0.5">+{dayEvents[0].attendees.length-3}</span>}
                                        </div>
                                    )}
                                     {dayEvents.length > 0 && dayEvents[0].price && !isSelected && (
                                        <p className={`text-xs truncate ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                            ${dayEvents[0].price.toFixed(2)}
                                        </p>
                                    )}
                                    {dayEvents.length > 0 && dayEvents[0].title && isSelected && (
                                        <p className="text-xs font-semibold truncate mt-1">{dayEvents[0].title}</p>
                                    )}
                                    {dayEvents.length > 0 && !isSelected && (
                                       <div className="flex space-x-1 mt-1 justify-start">
                                            {dayEvents.slice(0, 3).map(e => (
                                                <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${e.color || 'bg-gray-400'}`}></span>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    );
                })}
                 {/* Empty cells for days after the end of the month to fill the grid */}
                {Array.from({ length: (7 * 5) - days.length - adjustedFirstDayOfMonth }).map((_, i) => (
                    <div key={`empty-end-${i}`} className="bg-secondary/40 rounded-md"></div>
                ))}
            </div>
        </div>

        {/* Event List Sidebar */}
        <Card className="lg:w-1/3 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Event List</CardTitle>
            <CardDescription className="text-xs">Lorem ipsum dolor sit amet.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[calc(100vh-20rem)] overflow-y-auto event-list-scrollbar"> {/* Custom scrollbar class */}
            {events.filter(e => e.id.startsWith("evt_")).map((event) => (
              <div key={event.id} className="p-4 border-b last:border-b-0 hover:bg-muted/30">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
                  {event.price !== undefined && <span className="text-sm font-bold text-primary">${event.price.toFixed(2)}</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  <CalendarIcon className="inline h-3 w-3 mr-1" /> {format(event.date, "MMM do, yyyy")} &nbsp;
                  <Clock className="inline h-3 w-3 mr-1" /> {event.time}
                </p>
                {event.totalTickets && event.ticketsLeft !== undefined && (
                  <>
                    <Progress value={(event.ticketsLeft / event.totalTickets) * 100} className="h-1.5 mb-1" />
                    <p className="text-xs text-muted-foreground">{event.ticketsLeft} ticket left</p>
                  </>
                )}
                 <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 text-muted-foreground">
                    <MoreVertical className="h-4 w-4"/>
                </Button>
              </div>
            ))}
            </div>
          </CardContent>
           <CardFooter className="p-4 border-t">
                <Button variant="outline" className="w-full rounded-full">View All Events</Button>
           </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Clock icon for event list
const Clock = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

