"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Info, Ticket, DollarSign } from "lucide-react"; // Removed unused Users, Tag
import type { SchoolEvent } from "@/types/event";
import { format } from "date-fns";
import type { CSSProperties } from "react";

interface EventDetailDialogProps {
  event: SchoolEvent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, isOpen, onOpenChange }: EventDetailDialogProps) {
  if (!event) return null;

  const badgeStyle: CSSProperties = {};
  if (event.color) {
    // Assuming event.color is a hex string like #RRGGBB
    // For border, using 50% opacity version of the color. Appending '80' for ~50% alpha in hex.
    // For text, using the direct color.
    // This might need theme-aware adjustments for optimal contrast.
    badgeStyle.borderColor = `${event.color}80`; 
    badgeStyle.color = event.color;
  }
  // If event.color is not set, badgeStyle remains empty, 
  // and the default styles from Badge variant="outline" will apply.

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{event.title}</DialogTitle>
          
          {/* Container for Badge (audience) and other non-paragraph header info */}
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline" style={badgeStyle}>
              {event.audience ? event.audience.charAt(0).toUpperCase() + event.audience.slice(1) : 'Event'}
            </Badge>
            {/* If there was a short type/category, it could go here as a span */}
            {/* Example: {event.category && <span className="text-muted-foreground text-sm">({event.category})</span>} */}
          </div>

          {/* Main textual description for accessibility and content */}
          {event.description && (
            <DialogDescription className="pt-2 text-sm text-muted-foreground">
              {event.description}
            </DialogDescription>
          )}
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
          
          {/* Visual display of the description, if DialogDescription in header is not sufficient or for layout */}
          {/* This is kept if the design intends the description to be visually prominent in the body with an icon */}
          {event.description && (
             <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-1" />
                <p className="text-foreground text-sm leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
