
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Added
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { SchoolEvent, SchoolEventFormData } from "@/types/event";
import { addEvent, updateEvent } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select

const eventFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  date: z.date({ required_error: "Event date is required." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)." }),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)), // Convert empty string to undefined for optional number
    z.number().min(0).optional()
  ),
  totalTickets: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().min(0).optional()
  ),
  color: z.string().optional(), // Could be a color picker later
  audience: z.enum(['admin', 'student', 'public']).default('admin'), // Add audience field
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface AddEventFormProps {
  eventToEdit?: SchoolEvent | null;
  onFormSubmit: () => void; // Callback to refresh event list or close modal
  onCancel: () => void;
}

export function AddEventForm({ eventToEdit, onFormSubmit, onCancel }: AddEventFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<EventFormValues> = eventToEdit
    ? {
        title: eventToEdit.title,
        date: new Date(eventToEdit.date),
        time: eventToEdit.time,
        description: eventToEdit.description || "",
        price: eventToEdit.price,
        totalTickets: eventToEdit.totalTickets,
        color: eventToEdit.color || "#007BFF", // Default color
        audience: eventToEdit.audience || 'admin', // Load existing audience
      }
    : {
        title: "",
        date: new Date(),
        time: "10:00",
        description: "",
        price: 0,
        totalTickets: 100,
        color: "#007BFF",
        audience: 'admin', // Default audience
      };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  async function onSubmit(values: EventFormValues) {
    setIsSubmitting(true);
    const eventData: SchoolEventFormData = {
      ...values,
      date: values.date, // Already a Date object from react-day-picker
      // ticketsLeft can be inferred from totalTickets if not directly set
      // Let's explicitly set ticketsLeft only on creation if totalTickets is set.
      ticketsLeft: eventToEdit ? eventToEdit.ticketsLeft : (values.totalTickets !== undefined ? values.totalTickets : undefined), 
    };

    try {
      if (eventToEdit?.id) {
        // When updating, only pass defined fields to avoid overwriting with defaults accidentally
        const updateData: Partial<SchoolEventFormData> = Object.entries(eventData).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                (acc as any)[key] = value;
            }
            return acc;
        }, {});
        // Ensure ticketsLeft isn't accidentally reset if only totalTickets changes
         if (values.totalTickets !== undefined && eventToEdit.totalTickets !== values.totalTickets && values.ticketsLeft === undefined) {
           // If totalTickets changed and ticketsLeft wasn't provided, recalculate or handle as needed.
           // For now, we'll just update totalTickets. If ticketsLeft logic is needed, it goes here.
           updateData.totalTickets = values.totalTickets;
           // Maybe update ticketsLeft proportionally? Or set to new total? Setting to new total for simplicity now.
           // updateData.ticketsLeft = values.totalTickets; 
         }

        await updateEvent(eventToEdit.id, updateData);
        toast({ title: "Event Updated", description: "The event details have been saved." });
      } else {
        await addEvent(eventData);
        toast({ title: "Event Created", description: "The new event has been added." });
      }
      onFormSubmit(); // Call success callback
    } catch (error) {
      console.error("Failed to save event:", error);
      toast({
        title: "Error",
        description: `Failed to save event. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Annual Science Fair" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Event Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Time (HH:MM)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description / Type</FormLabel>
              <FormControl>
                <Textarea placeholder="Briefly describe the event or its type (e.g., Multimedia Class)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price (USD, 0 for free)</FormLabel>
                    <FormControl>
                        {/* Use step="0.01" for currency */}
                        <Input type="number" placeholder="e.g., 5.00" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="totalTickets"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Total Tickets Available</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="audience"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Audience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select who can see this event" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="admin">Admin Only</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Choose who this event is visible to.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Event Color</FormLabel>
                    <FormControl>
                        <Input type="color" {...field} className="p-1 h-10 w-16 block" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
         </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {eventToEdit ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
