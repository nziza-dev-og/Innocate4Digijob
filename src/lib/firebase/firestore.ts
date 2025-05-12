
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
  orderBy,
  limit,
  startAfter,
  setDoc,
  getDoc,
  onSnapshot,
  writeBatch,
  Query,
  DocumentData,
} from 'firebase/firestore';
import type { SchoolEvent, SchoolEventFormData } from '@/types/event';
import type { ChatMessage, ChatConversation, AppUser as ChatAppUser } from '@/types/chat';


// Event Collection Reference
const eventsCollectionRef = collection(db, 'events');

// Create a new event
export const addEvent = async (eventData: SchoolEventFormData): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User not authenticated');

  // Ensure the date is a valid Date object before converting
  let eventDate: Date;
  if (typeof eventData.date === 'string') {
    eventDate = new Date(eventData.date);
  } else if (eventData.date instanceof Date) {
    eventDate = eventData.date;
  } else {
    throw new Error('Invalid date format provided for event.');
  }

  if (isNaN(eventDate.getTime())) {
      throw new Error('Invalid date provided for event.');
  }


  const docRef = await addDoc(eventsCollectionRef, {
    ...eventData,
    date: Timestamp.fromDate(eventDate), // Convert valid Date object to Firebase Timestamp
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
    audience: eventData.audience || 'admin', // Default to admin only if not specified
    // Ensure ticketsLeft is set correctly on creation
    ticketsLeft: eventData.totalTickets !== undefined ? eventData.totalTickets : undefined,
  });
  return docRef.id;
};

// Get events (optionally filtered by creator or audience)
export const getEvents = async (adminOnly: boolean = true, audienceFilter?: string): Promise<SchoolEvent[]> => {
  const currentUser = auth.currentUser;
  let q: Query<DocumentData> = eventsCollectionRef; // Start with base collection reference

  if (adminOnly) {
    if (currentUser) {
      // Admin fetching their own events
      q = query(q, where('createdBy', '==', currentUser.uid));
    } else {
      // Prevent fetching admin-only events if not logged in
      console.warn("Attempted to fetch admin-only events without a logged-in user.");
      return [];
    }
  } else {
    // Fetching non-admin events (public or student)
    if (audienceFilter && typeof audienceFilter === 'string' && audienceFilter.length > 0) {
       // Fetch events for a specific provided audience (e.g., 'student', 'public')
       q = query(q, where('audience', '==', audienceFilter));
    } else {
       // Fetch all generally accessible events (student or public) if no specific filter is provided
       // Ensure 'audience' field exists for this query to work best. Documents without 'audience' might not be returned.
       q = query(q, where('audience', 'in', ['student', 'public']));
    }
  }

  // Always order by date after applying filters
  q = query(q, orderBy('date', 'asc'));

  try {
      const querySnapshot = await getDocs(q);
      const events: SchoolEvent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Ensure data.date is a Timestamp before converting
        if (data.date instanceof Timestamp) {
            events.push({
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            } as SchoolEvent);
        } else {
            console.warn(`Event with id ${doc.id} has invalid date format:`, data.date);
            // Optionally skip this event or handle it differently
        }
      });
      return events; // Firestore query already sorts
  } catch (error) {
      console.error("Error fetching events:", error);
      // Handle specific errors if needed, e.g., permission denied
      if (error instanceof Error && error.message.includes("invalid data")) {
          console.error("Firestore query error likely due to invalid filter value (e.g., undefined). Check query parameters.");
      }
      return []; // Return empty array on error
  }
};


// Update an event
export const updateEvent = async (eventId: string, eventData: Partial<SchoolEventFormData>): Promise<void> => {
  const eventDocRef = doc(db, 'events', eventId);
  const updateData: any = { ...eventData };

  // Convert Date back to Timestamp if present and valid
  if (eventData.date) {
      let eventDate: Date | null = null;
      if (eventData.date instanceof Date) {
        eventDate = eventData.date;
      } else if (typeof eventData.date === 'string') {
        eventDate = new Date(eventData.date);
      }

      if (eventDate && !isNaN(eventDate.getTime())) {
        updateData.date = Timestamp.fromDate(eventDate);
      } else {
        console.error("Invalid date format provided for update:", eventData.date);
        delete updateData.date; // Don't update if format is wrong
      }
  }


  // Ensure ticketsLeft is updated if totalTickets changes and ticketsLeft wasn't explicitly set
  if (eventData.totalTickets !== undefined && eventData.ticketsLeft === undefined) {
     // Fetch the current event to calculate ticketsLeft if necessary, or just set it based on total?
     // Safest approach: If totalTickets is changed, maybe reset ticketsLeft to totalTickets,
     // assuming a change in capacity means starting fresh count. Or require ticketsLeft to be passed.
     // For now, let's assume ticketsLeft should be explicitly passed if it changes.
     // If only totalTickets changes, maybe we assume ticketsLeft remains relative? Complex logic.
     // Simple approach: just update fields that are passed.
  }

  await updateDoc(eventDocRef, updateData);
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  const eventDocRef = doc(db, 'events', eventId);
  await deleteDoc(eventDocRef);
};


// CHAT FUNCTIONS

// Get or create a chat ID between two users
export const getOrCreateChatId = (userId1: string, userId2: string): string => {
  if (!userId1 || !userId2) {
      console.error("Both user IDs must be provided to create a chat ID.");
      throw new Error("Invalid user IDs for chat.");
  }
  const ids = [userId1, userId2].sort();
  return ids.join('_');
};

// Get or create a chat document
export const getOrCreateChatDocument = async (adminId: string, userId: string): Promise<string> => {
  const chatId = getOrCreateChatId(adminId, userId);
  const chatDocRef = doc(db, "chats", chatId);
  const chatDocSnap = await getDoc(chatDocRef);

  if (!chatDocSnap.exists()) {
    const adminDocSnap = await getDoc(doc(db, "users", adminId));
    const userDocSnap = await getDoc(doc(db, "users", userId));

    if (!adminDocSnap.exists()) {
        console.error(`Admin user document not found for ID: ${adminId}`);
        throw new Error("Admin user does not exist in Firestore.");
    }
     if (!userDocSnap.exists()) {
        console.error(`User document not found for ID: ${userId}`);
        throw new Error("User does not exist in Firestore.");
    }


    await setDoc(chatDocRef, {
      participants: [adminId, userId],
      participantNames: { // Denormalize names for easier display in chat lists
        [adminId]: adminDocSnap.data()?.displayName || "Admin",
        [userId]: userDocSnap.data()?.displayName || "User",
      },
      participantPhotoURLs: {
        [adminId]: adminDocSnap.data()?.photoURL || null,
        [userId]: userDocSnap.data()?.photoURL || null,
      },
      createdAt: serverTimestamp(),
      lastMessageTimestamp: serverTimestamp(), // Initialize for ordering
      // Initialize read status for both participants
      [`${adminId}_isRead`]: true,
      [`${userId}_isRead`]: true,
    });
  }
  return chatId;
};


// Send a chat message
export const sendChatMessage = async (chatId: string, senderId: string, receiverId: string, text: string): Promise<void> => {
  if (!text.trim()) throw new Error("Message text cannot be empty.");
  if (!chatId || !senderId || !receiverId) throw new Error("Missing required IDs for sending chat message.");

  const messagesColRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesColRef, {
    senderId,
    receiverId,
    text,
    timestamp: serverTimestamp(),
    status: 'sent', // Initial status
  });

  // Update the parent chat document for sorting and previews
  const chatDocRef = doc(db, "chats", chatId);
  await updateDoc(chatDocRef, {
    lastMessageText: text,
    lastMessageTimestamp: serverTimestamp(),
    lastMessageSenderId: senderId,
    [`${receiverId}_isRead`]: false, // Mark as unread for the recipient
    [`${senderId}_isRead`]: true, // Mark as read for the sender
  });
};


// Get users for chat list (excluding current user)
export const getUsersForChat = async (currentUserId: string): Promise<ChatAppUser[]> => {
  if (!currentUserId) {
      console.error("Current user ID is required to fetch users for chat.");
      return [];
  }
  const usersCollectionRef = collection(db, 'users');
  // Ensure we only query if currentUserId is valid
  const q = query(usersCollectionRef, where('uid', '!=', currentUserId));

  try {
    const querySnapshot = await getDocs(q);
    const users: ChatAppUser[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Basic validation for essential fields
        if (data.uid && data.displayName) {
            users.push({
                id: doc.id, // Firestore document ID which is user.uid
                uid: data.uid,
                name: data.displayName || data.email || "Unnamed User",
                email: data.email,
                photoURL: data.photoURL,
                role: data.role,
                isOnline: data.isOnline || false,
                lastSeen: data.lastSeen instanceof Timestamp ? data.lastSeen.toDate() : undefined,
            });
        } else {
            console.warn(`Skipping user document ${doc.id} due to missing uid or displayName.`);
        }
    });
    return users;
  } catch (error) {
      console.error("Error fetching users for chat:", error);
      return [];
  }
};


// Stream chat messages (example, not fully integrated into the page yet for simplicity)
export const getChatMessagesStream = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
  msgLimit: number = 20
) => {
   if (!chatId) {
      console.error("Chat ID is required to stream messages.");
      // Optionally call callback with empty array or handle error differently
      callback([]);
      return () => {}; // Return an empty unsubscribe function
   }
  const messagesQuery = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'desc'),
    limit(msgLimit)
  );

  const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure timestamp is valid before proceeding
      if (data.timestamp instanceof Timestamp) {
            messages.push({
                id: doc.id,
                chatId: chatId,
                senderId: data.senderId,
                text: data.text,
                timestamp: data.timestamp.toDate(), // Convert valid timestamp
                status: data.status,
            } as ChatMessage);
        } else {
             console.warn(`Message ${doc.id} in chat ${chatId} has invalid or pending timestamp.`);
             // Optionally include with a default date or skip
             messages.push({
                 id: doc.id,
                 chatId: chatId,
                 senderId: data.senderId,
                 text: data.text,
                 timestamp: new Date(), // Fallback to current time if timestamp is pending/invalid
                 status: data.status,
             } as ChatMessage);
        }
    });
    callback(messages.reverse()); // Reverse to show oldest first
  }, (error) => {
    console.error("Error streaming messages:", error);
    // Potentially call callback with an error state or empty array
    callback([]);
  });

   return unsubscribe; // Return the actual unsubscribe function
};
