
"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth, type AppUser as AuthAppUser } from "@/hooks/use-auth-hook";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  getDocs,
  Timestamp,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { Search, Send, Paperclip, Smile, Mic, Check, CheckCheck, Info, MoreVertical, Phone, Video } from "lucide-react";
import type { ChatMessage, ChatConversation, AppUser } from "@/types/chat";
import { formatDistanceToNowStrict, format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;


export default function AdminChatPage() {
  const { user: adminUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastVisibleMessage, setLastVisibleMessage] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);


  // Fetch all users (potential chat partners, excluding admin self if listed)
  useEffect(() => {
    if (!adminUser) return;
    setIsLoadingUsers(true);
    const usersCollectionRef = collection(db, "users");
    // Query to get users who are not the current admin
    const q = query(usersCollectionRef, where("uid", "!=", adminUser.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedUsers: AppUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedUsers.push({
          id: doc.id, // Firestore document ID, which is user.uid
          uid: data.uid,
          name: data.displayName || "Unnamed User",
          email: data.email,
          photoURL: data.photoURL,
          role: data.role,
          lastSeen: data.lastSeen ? (data.lastSeen as Timestamp).toDate() : undefined,
          isOnline: data.isOnline || false,
        });
      });
      setUsers(fetchedUsers);
      setIsLoadingUsers(false);
    }, (error) => {
        console.error("Error fetching users:", error);
        setIsLoadingUsers(false);
    });

    return () => unsubscribe();
  }, [adminUser]);
  
  // Fetch conversations for the admin
 useEffect(() => {
    if (!adminUser) return;

    const conversationsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", adminUser.uid),
      orderBy("lastMessageTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
      const convsPromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const otherParticipantId = data.participants.find((pId: string) => pId !== adminUser.uid);
        let otherUserDetails: AppUser | null = null;

        if (otherParticipantId) {
          const userDoc = await getDoc(doc(db, "users", otherParticipantId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            otherUserDetails = {
              id: userDoc.id,
              uid: userData.uid,
              name: userData.displayName || "User",
              photoURL: userData.photoURL,
              role: userData.role,
              isOnline: userData.isOnline || false,
              lastSeen: userData.lastSeen ? (userData.lastSeen as Timestamp).toDate() : undefined,
            };
          }
        }
        
        return {
          id: docSnap.id,
          participants: data.participants,
          lastMessageText: data.lastMessageText || "",
          lastMessageTimestamp: data.lastMessageTimestamp ? (data.lastMessageTimestamp as Timestamp).toDate() : new Date(),
          lastMessageSenderId: data.lastMessageSenderId,
          // Basic unread logic, needs improvement: check if last msg sender is not admin & if admin has seen it
          unreadCount: (data.lastMessageSenderId !== adminUser.uid && !data[`${adminUser.uid}_isRead`]) ? 1 : 0, 
          otherUser: otherUserDetails,
        } as ChatConversation;
      });
      
      const resolvedConvs = await Promise.all(convsPromises);
      setConversations(resolvedConvs.filter(c => c.otherUser)); // Only show convos where other user details are fetched
    });

    return () => unsubscribe();
  }, [adminUser]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);


  const getOrCreateChatId = (adminId: string, userId: string): string => {
    const ids = [adminId, userId].sort();
    return ids.join("_");
  };

  const handleSelectConversation = async (conversation: ChatConversation) => {
    if (!adminUser || !conversation.otherUser) return;
    setSelectedConversation(conversation);
    setSelectedUser(conversation.otherUser); // Set selected user from conversation
    setIsLoadingMessages(true);
    setMessages([]); // Clear previous messages
    setLastVisibleMessage(null); // Reset pagination
    setHasMoreMessages(true);

    // Mark messages as read by admin for this chat
    // This is a simplified version. A robust solution would update on server or use cloud functions.
    const chatDocRef = doc(db, "chats", conversation.id);
    await setDoc(chatDocRef, { [`${adminUser.uid}_isRead`]: true }, { merge: true });
  };
  
  // Fetch initial messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !hasMoreMessages || isLoadingMessages) return; // isLoadingMessages check to prevent refetch on send

    const messagesQuery = query(
      collection(db, "chats", selectedConversation.id, "messages"),
      orderBy("timestamp", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages: ChatMessage[] = snapshot.docs
        .map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                chatId: selectedConversation.id,
                senderId: data.senderId,
                text: data.text,
                timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(), // Handle null timestamp if writing directly
                isRead: data.isRead || false, // Assuming an isRead field
                status: data.status || 'sent', // 'sent', 'delivered', 'read'
            } as ChatMessage;
        })
        .reverse(); // Reverse to show oldest first

      setMessages(fetchedMessages);
      setLastVisibleMessage(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);
      setIsLoadingMessages(false);
      scrollToBottom();
    }, (error) => {
        console.error("Error fetching messages:", error);
        setIsLoadingMessages(false);
    });
    return () => unsubscribe();

  }, [selectedConversation, adminUser]); // Removed hasMoreMessages, isLoadingMessages to allow real-time updates

  const loadMoreMessages = async () => {
    if (!selectedConversation || !lastVisibleMessage || !hasMoreMessages) return;
    setIsLoadingMessages(true);
    const moreMessagesQuery = query(
      collection(db, "chats", selectedConversation.id, "messages"),
      orderBy("timestamp", "desc"),
      startAfter(lastVisibleMessage),
      limit(PAGE_SIZE)
    );
    const snapshot = await getDocs(moreMessagesQuery);
    const newMessages = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate(),
      } as ChatMessage))
      .reverse();

    setMessages(prev => [...newMessages, ...prev]); // Prepend older messages
    setLastVisibleMessage(snapshot.docs[snapshot.docs.length - 1]);
    setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);
    setIsLoadingMessages(false);
  };


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !adminUser || !selectedUser) return;

    const chatId = selectedConversation.id;
    const messageData = {
      senderId: adminUser.uid,
      receiverId: selectedUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
      status: 'sent', 
    };

    try {
      // Add message to subcollection
      await addDoc(collection(db, "chats", chatId, "messages"), messageData);
      
      // Update last message on chat document
      const chatDocRef = doc(db, "chats", chatId);
      await setDoc(chatDocRef, {
        lastMessageText: newMessage,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: adminUser.uid,
        [`${selectedUser.uid}_isRead`]: false, // Mark as unread for the recipient
        [`${adminUser.uid}_isRead`]: true, // Mark as read for sender (admin)
      }, { merge: true });

      setNewMessage("");
      // scrollToBottom will be triggered by useEffect on messages change
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error (e.g., show toast)
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return <div className="flex h-full items-center justify-center p-6"><Skeleton className="w-1/2 h-12" /></div>;
  }
  if (!adminUser) {
    return <div className="flex h-full items-center justify-center p-6">Please login to access chat.</div>;
  }

  const ChatMessageItem = ({ msg, isAdminMsg }: { msg: ChatMessage; isAdminMsg: boolean }) => (
    <div className={cn("flex mb-3", isAdminMsg ? "justify-end" : "justify-start")}>
      {!isAdminMsg && selectedUser && (
        <Avatar className="h-8 w-8 mr-2 self-end">
          <AvatarImage src={selectedUser.photoURL || undefined} data-ai-hint="user avatar"/>
          <AvatarFallback>{selectedUser.name?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] p-3 rounded-xl text-sm shadow-md",
          isAdminMsg
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border"
        )}
      >
        <p>{msg.text}</p>
        <div className={cn("text-xs mt-1.5 flex items-center", isAdminMsg ? "text-primary-foreground/70 justify-end" : "text-muted-foreground/80 justify-start")}>
          {format(msg.timestamp, "HH:mm")}
          {isAdminMsg && msg.status && (
            msg.status === 'read' ? <CheckCheck className="ml-1.5 h-4 w-4 text-blue-300" /> :
            msg.status === 'delivered' ? <CheckCheck className="ml-1.5 h-4 w-4" /> :
            <Check className="ml-1.5 h-4 w-4" />
          )}
        </div>
      </div>
       {isAdminMsg && adminUser && (
        <Avatar className="h-8 w-8 ml-2 self-end">
          <AvatarImage src={adminUser.photoURL || undefined} data-ai-hint="admin avatar"/>
          <AvatarFallback>{adminUser.displayName?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );


  return (
    <div className="flex h-[calc(100vh-var(--admin-header-height,4rem))] bg-background"> {/* Adjust height based on actual header */}
      {/* Left Panel: User List */}
      <div className="w-1/4 min-w-[300px] max-w-[380px] border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground mb-1">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by chats and people" 
                className="pl-10 bg-input rounded-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {isLoadingUsers && conversations.length === 0 ? (
            <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">No conversations found.</p>
          ) : (
            filteredConversations.map((conv) => (
              conv.otherUser && (
                <div
                  key={conv.id}
                  className={cn(
                    "flex items-center p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50",
                    selectedConversation?.id === conv.id && "bg-primary/10"
                  )}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={conv.otherUser.photoURL || undefined} data-ai-hint="user avatar"/>
                    <AvatarFallback>{conv.otherUser.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <h3 className="font-medium text-sm text-foreground truncate">{conv.otherUser.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{
                        conv.lastMessageSenderId === adminUser?.uid ? "You: " : ""
                    }{conv.lastMessageText}</p>
                  </div>
                  <div className="text-xs text-muted-foreground/80 flex flex-col items-end ml-2 space-y-1">
                    <span>{formatDistanceToNowStrict(conv.lastMessageTimestamp, { addSuffix: false })}</span>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                         <span className="bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              )
            ))
          )}
        </ScrollArea>
      </div>

      {/* Right Panel: Chat Window */}
      <div className="flex-1 flex flex-col bg-secondary/30">
        {selectedConversation && selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-card shadow-sm">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={selectedUser.photoURL || undefined} data-ai-hint="user avatar"/>
                  <AvatarFallback>{selectedUser.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedUser.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedUser.isOnline ? "Online" : (selectedUser.lastSeen ? `Last seen ${formatDistanceToNowStrict(selectedUser.lastSeen, {addSuffix: true})}` : "Offline")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Phone className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Video className="h-5 w-5"/></Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><MoreVertical className="h-5 w-5"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Block User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Chat</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-grow p-4 space-y-4" id="message-scroll-area">
              {isLoadingMessages && messages.length === 0 && (
                 <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) =>(
                        <div key={i} className={cn("flex w-full", i % 2 === 0 ? "justify-start" : "justify-end")}>
                             <Skeleton className="h-12 w-1/2 rounded-lg" />
                        </div>
                    ))}
                </div>
              )}
              {!isLoadingMessages && hasMoreMessages && messages.length >= PAGE_SIZE && (
                <div className="text-center">
                    <Button variant="outline" size="sm" onClick={loadMoreMessages}>Load older messages</Button>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} msg={msg} isAdminMsg={msg.senderId === adminUser?.uid} />
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Message Input Area */}
            <div className="p-3 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-primary"><Paperclip className="h-5 w-5" /></Button>
                 <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-primary"><Smile className="h-5 w-5" /></Button>
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow h-11 rounded-full bg-input focus:ring-1 focus:ring-primary"
                  autoComplete="off"
                />
                <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-primary"><Mic className="h-5 w-5" /></Button>
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 rounded-full w-11 h-11">
                  <Send className="h-5 w-5 text-primary-foreground" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-10">
            <Info className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-1">Select a conversation</h3>
            <p className="text-muted-foreground">Choose a user from the list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

```
  </change>
  <change>
    <file>src/types/chat.d.ts</file>
    <description>Create a new type definition file for chat-related interfaces (ChatMessage, ChatConversation, AppUser for chat context).</description>
    <content><![CDATA[
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
