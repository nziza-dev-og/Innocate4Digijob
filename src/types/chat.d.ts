import type { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string; // Firestore document ID
  chatId: string;
  senderId: string;
  senderName?: string; 
  senderPhotoURL?: string;
  receiverId?: string; // Optional, good for direct reference
  text: string;
  timestamp: Date; // JS Date for client-side use
  firestoreTimestamp?: Timestamp; // Original Firestore timestamp
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'read'; // For message status indicators
}

export interface AppUser { // User profile information for chat context
  id: string; // Firestore document ID (usually user.uid)
  uid: string;
  name: string;
  email?: string;
  photoURL?: string | null;
  role?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface ChatConversation {
  id: string; // chat ID (e.g., combination of user UIDs or Firestore generated)
  participants: string[]; // UIDs of participants
  lastMessageText?: string;
  lastMessageTimestamp: Date; // JS Date
  firestoreLastMessageTimestamp?: Timestamp; // Original Firestore timestamp
  lastMessageSenderId?: string;
  unreadCount?: number; // for the current viewing user
  otherUser: AppUser | null; // Details of the other participant
  [key: string]: any; // For dynamic fields like uid_isRead
}