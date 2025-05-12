
import type { Timestamp } from 'firebase/firestore';

export interface SchoolEvent {
  id: string;
  title: string;
  date: Date; // JS Date object for client-side use
  time: string;
  description?: string; // Could store event type like 'Multimedia Class' here
  price?: number;
  ticketsLeft?: number;
  totalTickets?: number;
  attendees?: string[]; // URLs or IDs
  color?: string;
  createdBy?: string; // UID of admin who created it
  createdAt?: Timestamp; // Firebase Timestamp
  audience?: 'admin' | 'student' | 'public'; // Optional field to target events
}

export interface SchoolEventFormData {
  title: string;
  date: string | Date; // Can be string from form input, converted to Date then Timestamp
  time: string;
  description?: string;
  price?: number;
  ticketsLeft?: number; // Optional: calculated or set explicitly
  totalTickets?: number;
  attendees?: string[];
  color?: string;
  audience?: 'admin' | 'student' | 'public'; // Allow setting audience on creation/update
}
