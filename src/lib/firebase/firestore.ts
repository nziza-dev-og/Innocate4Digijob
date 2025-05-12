
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

  const docRef = await addDoc(eventsCollectionRef, {
    ...eventData,
    date: Timestamp.fromDate(new Date(eventData.date)), // Convert string/Date to Firebase Timestamp
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
    audience: eventData.audience || 'admin', // Default to admin only if not specified
  });
  return docRef.id;
};

// Get events (optionally filtered by creator or audience)
export const getEvents = async (adminOnly: boolean = true, audienceFilter?: string): Promise<SchoolEvent[]> => {
  const currentUser = auth.currentUser;
  let q: Query<DocumentData> = query(eventsCollectionRef); // Use explicit type Query<DocumentData>

  if (adminOnly && currentUser) {
    // Fetch only events created by the current admin
    q = query(q, where('createdBy', '==', currentUser.uid));
  } else if (adminOnly && !currentUser) {
    // Prevent fetching admin-only events if not logged in
    console.warn("Attempted to fetch admin-only events without a logged-in user.");
    return [];
  } else if (!adminOnly && audienceFilter) {
     // Fetch events for a specific audience (e.g., 'student', 'public')
    q = query(q, where('audience', '==', audienceFilter));
  } else if (!adminOnly) {
     // Fetch all public/student accessible events (adjust audience values as needed)
     q = query(q, where('audience', 'in', ['student', 'public', undefined])); // Include events without explicit audience too? Adjust as needed.
  }
  
  // Always order by date
  q = query(q, orderBy('date', 'asc'));

  const querySnapshot = await getDocs(q);
  const events: SchoolEvent[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    events.push({
      id: doc.id,
      ...data,
      date: (data.date as Timestamp).toDate(), 
    } as SchoolEvent);
  });
  
  // Return sorted events (already sorted by Firestore query)
  return events; 
};

// Update an event
export const updateEvent = async (eventId: string, eventData: Partial<SchoolEventFormData>): Promise<void> => {
  const eventDocRef = doc(db, 'events', eventId);
  const updateData: any = { ...eventData };
  
  // Convert Date back to Timestamp if present
  if (eventData.date && eventData.date instanceof Date) {
    updateData.date = Timestamp.fromDate(eventData.date);
  } else if (eventData.date) {
     // Assuming it might be a string, try converting
     try {
       updateData.date = Timestamp.fromDate(new Date(eventData.date));
     } catch (e) {
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

    if (!adminDocSnap.exists() || !userDocSnap.exists()) {
        throw new Error("One or both users do not exist in Firestore.");
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
    });
  }
  return chatId;
};


// Send a chat message
export const sendChatMessage = async (chatId: string, senderId: string, receiverId: string, text: string): Promise<void> => {
  if (!text.trim()) throw new Error("Message text cannot be empty.");

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
  const usersCollectionRef = collection(db, 'users');
  const q = query(usersCollectionRef, where('uid', '!=', currentUserId));
  
  const querySnapshot = await getDocs(q);
  const users: ChatAppUser[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      id: doc.id, // Firestore document ID which is user.uid
      uid: data.uid,
      name: data.displayName || data.email || "Unnamed User",
      email: data.email,
      photoURL: data.photoURL,
      role: data.role,
      isOnline: data.isOnline || false,
      lastSeen: data.lastSeen ? (data.lastSeen as Timestamp).toDate() : undefined,
    });
  });
  return users;
};


// Stream chat messages (example, not fully integrated into the page yet for simplicity)
export const getChatMessagesStream = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
  msgLimit: number = 20
) => {
  const messagesQuery = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'desc'),
    limit(msgLimit)
  );

  return onSnapshot(messagesQuery, (querySnapshot) => {
    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        chatId: chatId,
        senderId: data.senderId,
        text: data.text,
        timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(), // Handle serverTimestamp pending state
        status: data.status,
      } as ChatMessage);
    });
    callback(messages.reverse()); // Reverse to show oldest first
  }, (error) => {
    console.error("Error streaming messages:", error);
  });
};
