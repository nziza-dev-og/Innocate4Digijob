
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Tag, Users, Info, Ticket, DollarSign } from "lucide-react";
import type { SchoolEvent } from "@/types/event";
import { format } from "date-fns";

interface EventDetailDialogProps {
  event: SchoolEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, isOpen, onOpenChange }: EventDetailDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{event.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
             <Badge variant="outline" className={`border-${event.color || 'primary'}/50 text-${event.color || 'primary'}`}>{event.audience ? event.audience.charAt(0).toUpperCase() + event.audience.slice(1) : 'Event'}</Badge>
             {event.description && <span className="text-muted-foreground text-sm">({event.description})</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{format(event.date, "EEEE, MMMM do, yyyy")}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{event.time}</span>
          </div>
          {event.price !== undefined && (
            <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className={`font-semibold ${event.price === 0 ? 'text-green-600' : 'text-primary'}`}>
                    {event.price === 0 ? "Free Event" : `$${event.price.toFixed(2)}`}
                </span>
            </div>
          )}
           {event.totalTickets !== undefined && event.ticketsLeft !== undefined && (
            <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">
                    {event.ticketsLeft} / {event.totalTickets} tickets remaining
                </span>
            </div>
          )}
          {event.description && (
             <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-1" />
                <p className="text-foreground text-sm leading-relaxed">{event.description}</p>
            </div>
          )}
           {/* Add more details if needed, e.g., location, attendees list */}
        </div>
        {/* <DialogFooter> 
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Close</Button> 
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
