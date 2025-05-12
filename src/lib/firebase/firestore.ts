
import { db, auth } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { SchoolEvent, SchoolEventFormData } from '@/types/event';

// Event Collection Reference
const eventsCollectionRef = collection(db, 'events');

// Create a new event
export const addEvent = async (eventData: SchoolEventFormData): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User not authenticated');

  const docRef = await addDoc(eventsCollectionRef, {
    ...eventData,
    date: Timestamp.fromDate(new Date(eventData.date)), // Convert string/Date to Firebase Timestamp
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get all events (optionally created by current admin)
export const getEvents = async (adminOnly: boolean = true): Promise<SchoolEvent[]> => {
  const currentUser = auth.currentUser;
  let q = query(eventsCollectionRef);

  if (adminOnly && currentUser) {
    q = query(eventsCollectionRef, where('createdBy', '==', currentUser.uid));
  } else if (adminOnly && !currentUser) {
    // If adminOnly is true but no user, return no events or handle error
    console.warn("Attempted to fetch admin-only events without a logged-in user.");
    return [];
  }
  // If adminOnly is false, fetch all events (consider security implications for sensitive data)


  const querySnapshot = await getDocs(q);
  const events: SchoolEvent[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    events.push({
      id: doc.id,
      ...data,
      date: (data.date as Timestamp).toDate(), // Convert Firebase Timestamp to JS Date
    } as SchoolEvent);
  });
  return events.sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date
};

// Update an event
export const updateEvent = async (eventId: string, eventData: Partial<SchoolEventFormData>): Promise<void> => {
  const eventDocRef = doc(db, 'events', eventId);
  const updateData: any = { ...eventData };
  if (eventData.date) {
    updateData.date = Timestamp.fromDate(new Date(eventData.date));
  }
  await updateDoc(eventDocRef, updateData);
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  const eventDocRef = doc(db, 'events', eventId);
  await deleteDoc(eventDocRef);
};
