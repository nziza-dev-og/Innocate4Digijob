
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
    // Ensure 'audience' field exists for this query to work best.
    // Documents without 'audience' might not be returned by 'in' or '==' filters.
    // If no specific filter, fetch both 'student' and 'public' events.
    if (audienceFilter && ['student', 'public'].includes(audienceFilter)) {
       q = query(q, where('audience', '==', audienceFilter));
    } else {
       // Fetch events visible to students/public if no specific filter or an invalid one is provided
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
      return events;
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

// Get or create a chat document for ONE-ON-ONE chats
export const getOrCreateChatDocument = async (userId1: string, userId2: string): Promise<string> => {
  const chatId = getOrCreateChatId(userId1, userId2);
  const chatDocRef = doc(db, "chats", chatId);
  const chatDocSnap = await getDoc(chatDocRef);

  if (!chatDocSnap.exists()) {
    const user1DocSnap = await getDoc(doc(db, "users", userId1));
    const user2DocSnap = await getDoc(doc(db, "users", userId2));

    if (!user1DocSnap.exists() || !user2DocSnap.exists()) {
        console.error(`One or both user documents not found for IDs: ${userId1}, ${userId2}`);
        throw new Error("One or both users do not exist in Firestore.");
    }

    await setDoc(chatDocRef, {
      participants: [userId1, userId2],
      type: 'one-on-one', // Indicate chat type
      participantNames: {
        [userId1]: user1DocSnap.data()?.displayName || "User 1",
        [userId2]: user2DocSnap.data()?.displayName || "User 2",
      },
      participantPhotoURLs: {
        [userId1]: user1DocSnap.data()?.photoURL || null,
        [userId2]: user2DocSnap.data()?.photoURL || null,
      },
      createdAt: serverTimestamp(),
      lastMessageTimestamp: serverTimestamp(),
      [`${userId1}_isRead`]: true, // Initially read for both as no messages exist
      [`${userId2}_isRead`]: true,
    });
  }
  return chatId;
};


// Send a chat message (works for both 1-on-1 and group)
export const sendChatMessage = async (chatId: string, senderId: string, text: string, participantIds: string[]): Promise<void> => {
  if (!text.trim()) throw new Error("Message text cannot be empty.");
  if (!chatId || !senderId || !participantIds || participantIds.length === 0) throw new Error("Missing required IDs for sending chat message.");

  const messagesColRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesColRef, {
    senderId,
    // No receiverId needed for group chats, simplifies logic
    text,
    timestamp: serverTimestamp(),
    status: 'sent', // Initial status
  });

  // Update the parent chat document
  const chatDocRef = doc(db, "chats", chatId);
  const updateData: any = {
    lastMessageText: text,
    lastMessageTimestamp: serverTimestamp(),
    lastMessageSenderId: senderId,
  };
  // Mark as unread for all *other* participants
  participantIds.forEach(pid => {
      if (pid !== senderId) {
          updateData[`${pid}_isRead`] = false;
      } else {
          updateData[`${pid}_isRead`] = true; // Sender has read their own message
      }
  });

  await updateDoc(chatDocRef, updateData);
};


// Get users for chat list (excluding current user)
export const getUsersForChat = async (currentUserId: string): Promise<ChatAppUser[]> => {
  if (!currentUserId) {
      console.error("Current user ID is required to fetch users for chat.");
      return [];
  }
  const usersCollectionRef = collection(db, 'users');
  // Ensure we only query if currentUserId is valid
  const q = query(usersCollectionRef, where('uid', '!=', currentUserId)); // Exclude self

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


// Stream chat messages (works for both 1-on-1 and group)
export const getChatMessagesStream = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
  msgLimit: number = 20
) => {
   if (!chatId) {
      console.error("Chat ID is required to stream messages.");
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
      if (data.timestamp instanceof Timestamp) {
            messages.push({
                id: doc.id,
                chatId: chatId,
                senderId: data.senderId,
                text: data.text,
                timestamp: data.timestamp.toDate(),
                status: data.status,
            } as ChatMessage);
        } else {
             console.warn(`Message ${doc.id} in chat ${chatId} has invalid or pending timestamp.`);
             messages.push({
                 id: doc.id,
                 chatId: chatId,
                 senderId: data.senderId,
                 text: data.text,
                 timestamp: new Date(),
                 status: data.status,
             } as ChatMessage);
        }
    });
    callback(messages.reverse()); // Reverse to show oldest first
  }, (error) => {
    console.error("Error streaming messages:", error);
    callback([]);
  });

   return unsubscribe; // Return the actual unsubscribe function
};

// --- GROUP CHAT FUNCTIONS (Placeholder - Requires UI and more logic) ---

// // Create a new group chat
// export const createGroupChat = async (groupName: string, initialParticipantIds: string[]): Promise<string> => {
//   if (!groupName.trim()) throw new Error("Group name cannot be empty.");
//   if (initialParticipantIds.length < 2) throw new Error("Group chat requires at least 2 participants.");

//   const groupChatColRef = collection(db, "chats"); // Or a dedicated "groupChats" collection

//   // Fetch participant details for denormalization
//   const participantDocs = await Promise.all(initialParticipantIds.map(id => getDoc(doc(db, "users", id))));
//   const participantNames: { [key: string]: string } = {};
//   const participantPhotoURLs: { [key: string]: string | null } = {};
//   participantDocs.forEach(docSnap => {
//       if (docSnap.exists()) {
//           const data = docSnap.data();
//           participantNames[docSnap.id] = data.displayName || "User";
//           participantPhotoURLs[docSnap.id] = data.photoURL || null;
//       }
//   });

//   const docRef = await addDoc(groupChatColRef, {
//     groupName: groupName,
//     participants: initialParticipantIds,
//     participantNames,
//     participantPhotoURLs,
//     type: 'group', // Indicate chat type
//     createdAt: serverTimestamp(),
//     lastMessageTimestamp: serverTimestamp(),
//     // Initialize read status for all participants
//     ...initialParticipantIds.reduce((acc, pid) => ({ ...acc, [`${pid}_isRead`]: true }), {}),
//     // createdBy: auth.currentUser?.uid, // Optional: track who created the group
//   });
//   return docRef.id;
// };

// // Add participant to group chat (requires permission checks in real app)
// export const addParticipantToGroup = async (chatId: string, userIdToAdd: string): Promise<void> => {
//     const chatDocRef = doc(db, "chats", chatId);
//     const chatDocSnap = await getDoc(chatDocRef);
//     const userDocSnap = await getDoc(doc(db, "users", userIdToAdd));

//     if (!chatDocSnap.exists() || !userDocSnap.exists()) {
//         throw new Error("Chat or user does not exist.");
//     }
//     if (chatDocSnap.data()?.type !== 'group') {
//         throw new Error("Cannot add participant to a non-group chat.");
//     }

//     const currentParticipants = chatDocSnap.data()?.participants || [];
//     if (currentParticipants.includes(userIdToAdd)) {
//         console.log("User already in group.");
//         return; // Already a participant
//     }

//     const userData = userDocSnap.data();
//     await updateDoc(chatDocRef, {
//         participants: [...currentParticipants, userIdToAdd],
//         [`participantNames.${userIdToAdd}`]: userData.displayName || "User",
//         [`participantPhotoURLs.${userIdToAdd}`]: userData.photoURL || null,
//         [`${userIdToAdd}_isRead`]: true, // New user starts as read
//     });
// };

// // Remove participant from group chat (requires permission checks)
// export const removeParticipantFromGroup = async (chatId: string, userIdToRemove: string): Promise<void> => {
//     const chatDocRef = doc(db, "chats", chatId);
//     const chatDocSnap = await getDoc(chatDocRef);

//     if (!chatDocSnap.exists()) {
//         throw new Error("Chat does not exist.");
//     }
//      if (chatDocSnap.data()?.type !== 'group') {
//         throw new Error("Cannot remove participant from a non-group chat.");
//     }

//     const currentParticipants = chatDocSnap.data()?.participants || [];
//     if (!currentParticipants.includes(userIdToRemove)) {
//         console.log("User not in group.");
//         return; // Not a participant
//     }

//     // Use dot notation for nested field removal within maps
//     const updates: any = {
//         participants: currentParticipants.filter((pid: string) => pid !== userIdToRemove),
//         [`participantNames.${userIdToRemove}`]: deleteField(), // Requires importing deleteField from 'firebase/firestore'
//         [`participantPhotoURLs.${userIdToRemove}`]: deleteField(),
//         [`${userIdToRemove}_isRead`]: deleteField(),
//     };

//     await updateDoc(chatDocRef, updates);
//     // Note: Need to import `deleteField` from firebase/firestore for this to work.
// };
