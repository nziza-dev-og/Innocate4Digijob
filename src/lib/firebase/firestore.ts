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
  deleteField, // Import deleteField
} from 'firebase/firestore';
import type { SchoolEvent, SchoolEventFormData } from '@/types/event';
import type { ChatMessage, ChatConversation, AppUser as ChatAppUser } from '@/types/chat';


// Event Collection Reference
const eventsCollectionRef = collection(db, 'events');

// Create a new event
export const addEvent = async (eventData: SchoolEventFormData): Promise<string> => {
  if (!db || !auth) {
    console.error("Firebase (db or auth) is not initialized. Cannot add event.");
    throw new Error("Firebase (db or auth) is not initialized.");
  }
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("User not authenticated. Cannot add event.");
    throw new Error('User not authenticated');
  }

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
    date: Timestamp.fromDate(eventDate),
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
    audience: eventData.audience || 'admin',
    ticketsLeft: eventData.totalTickets !== undefined ? eventData.totalTickets : undefined,
  });
  return docRef.id;
};

// Get events (optionally filtered by creator or audience)
export const getEvents = async (adminOnly: boolean = true, audienceFilter?: string): Promise<SchoolEvent[]> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot get events.");
    return [];
  }
  const currentUser = auth ? auth.currentUser : null;
  let q: Query<DocumentData> = collection(db, 'events'); 

  if (adminOnly) {
    if (currentUser) {
      q = query(q, where('createdBy', '==', currentUser.uid));
    } else {
      console.warn("Attempted to fetch admin-only events without a logged-in user or auth not initialized.");
      return [];
    }
  } else {
    if (audienceFilter && ['student', 'public'].includes(audienceFilter)) {
       q = query(q, where('audience', '==', audienceFilter));
    } else {
       q = query(q, where('audience', 'in', ['student', 'public']));
    }
  }

  q = query(q, orderBy('date', 'asc'));

  try {
      const querySnapshot = await getDocs(q);
      const events: SchoolEvent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date instanceof Timestamp) {
            events.push({
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            } as SchoolEvent);
        } else {
            console.warn(`Event with id ${doc.id} has invalid date format:`, data.date);
        }
      });
      return events;
  } catch (error) {
      console.error("Error fetching events:", error);
      if (error instanceof Error && error.message.includes("invalid data")) {
          console.error("Firestore query error likely due to invalid filter value. Check query parameters.");
      }
      return []; 
  }
};


// Update an event
export const updateEvent = async (eventId: string, eventData: Partial<SchoolEventFormData>): Promise<void> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot update event.");
    throw new Error("Firestore is not initialized.");
  }
  const eventDocRef = doc(db, 'events', eventId);
  const updateData: any = { ...eventData };

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
        delete updateData.date; 
      }
  }

  await updateDoc(eventDocRef, updateData);
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<void> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot delete event.");
    throw new Error("Firestore is not initialized.");
  }
  const eventDocRef = doc(db, 'events', eventId);
  await deleteDoc(eventDocRef);
};


// CHAT FUNCTIONS

export const getOrCreateChatId = (userId1: string, userId2: string): string => {
  if (!userId1 || !userId2) {
      console.error("Both user IDs must be provided to create a chat ID.");
      throw new Error("Invalid user IDs for chat.");
  }
  const ids = [userId1, userId2].sort();
  return ids.join('_');
};

export const getOrCreateChatDocument = async (userId1: string, userId2: string): Promise<string> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot get/create chat document.");
    throw new Error("Firestore is not initialized.");
  }
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
      type: 'one-on-one', 
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
      [`${userId1}_isRead`]: true, 
      [`${userId2}_isRead`]: true,
    });
  }
  return chatId;
};


export const sendChatMessage = async (chatId: string, senderId: string, text: string, participantIds: string[]): Promise<void> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot send chat message.");
    throw new Error("Firestore is not initialized.");
  }
  if (!text.trim()) throw new Error("Message text cannot be empty.");
  if (!chatId || !senderId || !participantIds || participantIds.length === 0) throw new Error("Missing required IDs for sending chat message.");

  const messagesColRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesColRef, {
    senderId,
    text,
    timestamp: serverTimestamp(),
    status: 'sent',
  });

  const chatDocRef = doc(db, "chats", chatId);
  const updateData: any = {
    lastMessageText: text,
    lastMessageTimestamp: serverTimestamp(),
    lastMessageSenderId: senderId,
  };
  participantIds.forEach(pid => {
      if (pid !== senderId) {
          updateData[`${pid}_isRead`] = false;
      } else {
          updateData[`${pid}_isRead`] = true; 
      }
  });

  await updateDoc(chatDocRef, updateData);
};


export const getUsersForChat = async (currentUserId: string): Promise<ChatAppUser[]> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot get users for chat.");
    return [];
  }
  if (!currentUserId) {
      console.error("Current user ID is required to fetch users for chat.");
      return [];
  }
  const usersCollectionRef = collection(db, 'users');
  const q = query(usersCollectionRef, where('uid', '!=', currentUserId)); 

  try {
    const querySnapshot = await getDocs(q);
    const users: ChatAppUser[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid && data.displayName) {
            users.push({
                id: doc.id, 
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


export const getChatMessagesStream = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
  msgLimit: number = 20
) => {
   if (!db) {
      console.error("Firestore is not initialized. Cannot get chat messages stream.");
      callback([]);
      return () => {}; 
   }
   if (!chatId) {
      console.error("Chat ID is required to stream messages.");
      callback([]);
      return () => {}; 
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
    callback(messages.reverse()); 
  }, (error) => {
    console.error("Error streaming messages:", error);
    callback([]);
  });

   return unsubscribe; 
};

// Create a new group chat
export const createGroupChat = async (groupName: string, initialParticipantIds: string[], createdBy: string): Promise<string> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot create group chat.");
    throw new Error("Firestore is not initialized.");
  }
  if (!groupName.trim()) throw new Error("Group name cannot be empty.");
  if (initialParticipantIds.length < 1) throw new Error("Group chat requires at least 1 participant (creator)."); // Min 1 (creator)
  if (!initialParticipantIds.includes(createdBy)){
    initialParticipantIds.push(createdBy); // Ensure creator is part of the group
  }


  const groupChatColRef = collection(db, "chats");

  const participantDocs = await Promise.all(initialParticipantIds.map(id => getDoc(doc(db, "users", id))));
  const participantNames: { [key: string]: string } = {};
  const participantPhotoURLs: { [key: string]: string | null } = {};
  let allParticipantsExist = true;

  participantDocs.forEach(docSnap => {
      if (docSnap.exists()) {
          const data = docSnap.data();
          participantNames[docSnap.id] = data.displayName || "User";
          participantPhotoURLs[docSnap.id] = data.photoURL || null;
      } else {
          console.warn(`User with ID ${docSnap.id} not found during group creation.`);
          allParticipantsExist = false; // Or handle more gracefully
      }
  });

  if (!allParticipantsExist) {
      throw new Error("One or more participants not found.");
  }
  
  const chatDocRef = doc(groupChatColRef); // Auto-generate ID for new group chat

  await setDoc(chatDocRef, {
    id: chatDocRef.id, // Store the ID within the document
    groupName: groupName,
    participants: initialParticipantIds,
    participantNames,
    participantPhotoURLs,
    type: 'group', 
    createdAt: serverTimestamp(),
    lastMessageTimestamp: serverTimestamp(),
    createdBy: createdBy,
    admins: [createdBy], // Creator is admin by default
    ...initialParticipantIds.reduce((acc, pid) => ({ ...acc, [`${pid}_isRead`]: true }), {}),
  });
  return chatDocRef.id;
};

// Add participant to group chat
export const addParticipantToGroup = async (chatId: string, userIdToAdd: string, addedByUid: string): Promise<void> => {
    if (!db) {
      console.error("Firestore is not initialized. Cannot add participant.");
      throw new Error("Firestore is not initialized.");
    }
    const chatDocRef = doc(db, "chats", chatId);
    const chatDocSnap = await getDoc(chatDocRef);
    const userDocSnap = await getDoc(doc(db, "users", userIdToAdd));

    if (!chatDocSnap.exists() || !userDocSnap.exists()) {
        throw new Error("Chat or user to add does not exist.");
    }
    const chatData = chatDocSnap.data();
    if (chatData?.type !== 'group') {
        throw new Error("Cannot add participant to a non-group chat.");
    }
    // Basic admin check (creator or listed admin)
    if (!chatData.admins || !chatData.admins.includes(addedByUid)) {
        throw new Error("Only group admins can add participants.");
    }

    const currentParticipants = chatData?.participants || [];
    if (currentParticipants.includes(userIdToAdd)) {
        console.log("User already in group.");
        return; 
    }

    const userData = userDocSnap.data();
    await updateDoc(chatDocRef, {
        participants: [...currentParticipants, userIdToAdd],
        [`participantNames.${userIdToAdd}`]: userData?.displayName || "User",
        [`participantPhotoURLs.${userIdToAdd}`]: userData?.photoURL || null,
        [`${userIdToAdd}_isRead`]: true, 
    });
};

// Remove participant from group chat
export const removeParticipantFromGroup = async (chatId: string, userIdToRemove: string, removedByUid: string): Promise<void> => {
    if (!db) {
      console.error("Firestore is not initialized. Cannot remove participant.");
      throw new Error("Firestore is not initialized.");
    }
    const chatDocRef = doc(db, "chats", chatId);
    const chatDocSnap = await getDoc(chatDocRef);

    if (!chatDocSnap.exists()) {
        throw new Error("Chat does not exist.");
    }
    const chatData = chatDocSnap.data();
     if (chatData?.type !== 'group') {
        throw new Error("Cannot remove participant from a non-group chat.");
    }
    // Basic admin check
    if (!chatData.admins || !chatData.admins.includes(removedByUid)) {
        throw new Error("Only group admins can remove participants.");
    }
     if (userIdToRemove === chatData.createdBy && chatData.participants.length > 1) {
        throw new Error("Creator cannot be removed if other participants exist. Transfer ownership or disband.");
    }


    const currentParticipants = chatData?.participants || [];
    if (!currentParticipants.includes(userIdToRemove)) {
        console.log("User not in group.");
        return; 
    }
    
    const updates: any = {
        participants: currentParticipants.filter((pid: string) => pid !== userIdToRemove),
        [`participantNames.${userIdToRemove}`]: deleteField(), 
        [`participantPhotoURLs.${userIdToRemove}`]: deleteField(),
        [`${userIdToRemove}_isRead`]: deleteField(),
    };
     // If removed user was an admin, remove them from admins array
    if (chatData.admins && chatData.admins.includes(userIdToRemove)) {
        updates.admins = chatData.admins.filter((adminId: string) => adminId !== userIdToRemove);
        // Ensure there's always at least one admin if participants remain
        if (updates.admins.length === 0 && updates.participants.length > 0) {
            updates.admins = [chatData.createdBy]; // Fallback to creator
        }
    }

    await updateDoc(chatDocRef, updates);
};


// Fetch group chat details
export const getGroupChatDetails = async (chatId: string): Promise<ChatConversation | null> => {
  if (!db) {
    console.error("Firestore is not initialized. Cannot get group chat details.");
    return null;
  }
  const chatDocRef = doc(db, "chats", chatId);
  const chatDocSnap = await getDoc(chatDocRef);

  if (chatDocSnap.exists() && chatDocSnap.data()?.type === 'group') {
    const data = chatDocSnap.data();
    return {
      id: chatDocSnap.id,
      participants: data.participants,
      type: 'group',
      groupName: data.groupName,
      groupPhotoURL: data.groupPhotoURL,
      lastMessageText: data.lastMessageText,
      lastMessageTimestamp: data.lastMessageTimestamp instanceof Timestamp ? data.lastMessageTimestamp.toDate() : new Date(),
      lastMessageSenderId: data.lastMessageSenderId,
      participantNames: data.participantNames,
      participantPhotoURLs: data.participantPhotoURLs,
      createdBy: data.createdBy,
      admins: data.admins,
      otherUser: null, // No single "otherUser" for group chat display in list
    } as ChatConversation;
  }
  return null;
};
