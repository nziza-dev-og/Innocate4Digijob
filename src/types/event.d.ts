
import type { Timestamp } from 'firebase/firestore';

export interface SchoolEvent {
  id: string;
  title: string;
  date: Date; // JS Date object for client-side use
  time: string;
  description?: string;
  price?: number;
  ticketsLeft?: number;
  totalTickets?: number;
  attendees?: string[]; // URLs or IDs
  color?: string;
  createdBy?: string; // UID of admin who created it
  createdAt?: Timestamp; // Firebase Timestamp
}

export interface SchoolEventFormData {
  title: string;
  date: string | Date; // Can be string from form input, converted to Date then Timestamp
  time: string;
  description?: string;
  price?: number;
  ticketsLeft?: number;
  totalTickets?: number;
  attendees?: string[];
  color?: string;
}
