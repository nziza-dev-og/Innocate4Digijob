
import type { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string; // Firestore document ID
  chatId: string;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
  receiverId?: string; // Only relevant for 1-on-1 chats maybe? Or ignore?
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
  id: string; // chat ID
  participants: string[]; // UIDs of participants
  type: 'one-on-one' | 'group'; // Differentiate chat types
  groupName?: string; // Only for group chats
  groupPhotoURL?: string; // Optional group avatar
  lastMessageText?: string;
  lastMessageTimestamp: Date; // JS Date
  firestoreLastMessageTimestamp?: Timestamp; // Original Firestore timestamp
  lastMessageSenderId?: string;
  unreadCount?: number; // for the current viewing user
  otherUser: AppUser | null; // Details of the other participant (null for group chats?)
  // For group chats, we might store participant details differently if needed directly on the conversation doc
  participantNames?: { [key: string]: string };
  participantPhotoURLs?: { [key: string]: string | null };
  [key: string]: any; // For dynamic fields like uid_isRead
}
