
"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth-hook";
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
import { Search, Send, Paperclip, Smile, Mic, Check, CheckCheck, Info, MoreVertical, Phone, Video, Loader2, UserPlus, Users } from "lucide-react";
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
import { getOrCreateChatDocument, getUsersForChat } from "@/lib/firebase/firestore"; // Import chat helper functions
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // For switching views


const PAGE_SIZE = 20;

export default function StudentChatPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [allUsers, setAllUsers] = useState<AppUser[]>([]); // List of all potential users to chat with
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [otherUser, setOtherUser] = useState<AppUser | null>(null); // User the student is currently chatting with

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastVisibleMessage, setLastVisibleMessage] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "users"

  // Fetch all other users for the "Users" tab
  useEffect(() => {
    if (!currentUser) return;
    setIsLoadingUsers(true);
    getUsersForChat(currentUser.uid)
      .then(fetchedUsers => {
        setAllUsers(fetchedUsers);
        setIsLoadingUsers(false);
      })
      .catch(error => {
        console.error("Error fetching users list:", error);
        setIsLoadingUsers(false);
      });
  }, [currentUser]);


  // Fetch existing conversations for the current student
  useEffect(() => {
    if (!currentUser) return;
    setIsLoadingConversations(true);

    const conversationsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("lastMessageTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
      const convsPromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const otherParticipantId = data.participants.find((pId: string) => pId !== currentUser.uid);
        let otherUserDetails: AppUser | null = null;

        if (otherParticipantId) {
          const userDoc = await getDoc(doc(db, "users", otherParticipantId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.uid && userData.displayName) {
              otherUserDetails = {
                id: userDoc.id,
                uid: userData.uid,
                name: userData.displayName || "User",
                photoURL: userData.photoURL,
                email: userData.email,
                role: userData.role,
                isOnline: userData.isOnline || false,
                lastSeen: userData.lastSeen ? (userData.lastSeen instanceof Timestamp ? userData.lastSeen.toDate() : undefined) : undefined,
              };
            } else { console.warn(`Other participant document ${userDoc.id} missing fields.`); }
          } else { console.warn(`Doc for other participant ID ${otherParticipantId} not found.`); }
        } else { console.warn(`Could not find other participant ID in chat ${docSnap.id}.`); }

        let lastMsgTs = new Date();
        if (data.lastMessageTimestamp instanceof Timestamp) {
          lastMsgTs = data.lastMessageTimestamp.toDate();
        } else if (data.lastMessageTimestamp) {
           console.warn(`Chat ${docSnap.id} has non-Timestamp lastMsgTs.`);
           try { lastMsgTs = new Date(data.lastMessageTimestamp); if (isNaN(lastMsgTs.getTime())) lastMsgTs = new Date(); } catch { lastMsgTs = new Date(); }
        }

        return {
          id: docSnap.id,
          participants: data.participants,
          lastMessageText: data.lastMessageText || "",
          lastMessageTimestamp: lastMsgTs,
          lastMessageSenderId: data.lastMessageSenderId,
          unreadCount: (data.lastMessageSenderId !== currentUser.uid && !data[`${currentUser.uid}_isRead`]) ? 1 : 0,
          otherUser: otherUserDetails,
        } as ChatConversation;
      });

      const resolvedConvs = await Promise.all(convsPromises);
      setConversations(resolvedConvs.filter(c => c.otherUser));
      setIsLoadingConversations(false);
    }, (error) => {
      console.error("Error fetching conversations:", error);
      setIsLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Select an existing conversation
  const handleSelectConversation = async (conversation: ChatConversation) => {
    if (!currentUser || !conversation.otherUser || !conversation.id) {
      console.warn("Cannot select conversation", { currentUser, conversation });
      return;
    }
    setActiveTab("chats"); // Switch back to chats view if selected from there
    setSelectedConversation(conversation);
    setOtherUser(conversation.otherUser);
    setIsLoadingMessages(true);
    setMessages([]);
    setLastVisibleMessage(null);
    setHasMoreMessages(true);

    const chatDocRef = doc(db, "chats", conversation.id);
    try {
      await setDoc(chatDocRef, { [`${currentUser.uid}_isRead`]: true }, { merge: true });
    } catch (error) {
      console.error(`Failed to mark chat ${conversation.id} as read`, error);
    }
  };

  // Start a new chat or select existing one with a user from the user list
  const handleSelectUserToChat = async (userToChat: AppUser) => {
    if (!currentUser) return;

    setIsLoadingMessages(true); // Show loading indicator while checking/creating chat
    setMessages([]);
    setOtherUser(userToChat); // Tentatively set the other user
    setSelectedConversation(null); // Clear existing selection initially

    try {
      const chatId = await getOrCreateChatDocument(currentUser.uid, userToChat.uid);
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (chatDocSnap.exists()) {
          const data = chatDocSnap.data();
           let lastMsgTs = new Date();
           if (data.lastMessageTimestamp instanceof Timestamp) {
             lastMsgTs = data.lastMessageTimestamp.toDate();
           } // Handle potential non-timestamp as before

           const existingConversation: ChatConversation = {
               id: chatId,
               participants: data.participants,
               lastMessageText: data.lastMessageText || "",
               lastMessageTimestamp: lastMsgTs,
               lastMessageSenderId: data.lastMessageSenderId,
               unreadCount: (data.lastMessageSenderId !== currentUser.uid && !data[`${currentUser.uid}_isRead`]) ? 1 : 0,
               otherUser: userToChat,
           };
           setSelectedConversation(existingConversation);
           // Mark as read if needed
           if (existingConversation.unreadCount && existingConversation.unreadCount > 0) {
               await setDoc(chatDocRef, { [`${currentUser.uid}_isRead`]: true }, { merge: true });
           }
      } else {
          // This case should ideally not happen if getOrCreateChatDocument works correctly,
          // but handle it defensively.
          console.error(`Chat document ${chatId} not found after creation attempt.`);
          // Maybe create a temporary conversation object or show an error
            const newConversation: ChatConversation = {
               id: chatId,
               participants: [currentUser.uid, userToChat.uid],
               lastMessageTimestamp: new Date(), // Initialize timestamp
               otherUser: userToChat,
               unreadCount: 0,
           };
           setSelectedConversation(newConversation);
      }
      setActiveTab("chats"); // Switch view to the chat window
    } catch (error) {
      console.error("Error getting or creating chat:", error);
      // Handle error (e.g., show toast)
      setIsLoadingMessages(false);
      setOtherUser(null); // Reset if failed
    }
     // Fetch messages will be triggered by the useEffect watching selectedConversation?.id
  };


  // Fetch initial messages for selected conversation
  useEffect(() => {
    if (!selectedConversation?.id || !currentUser) {
      // Clear messages if no conversation selected, ensure loading is false
      setMessages([]);
      setIsLoadingMessages(false);
      return;
    }

    setIsLoadingMessages(true); // Set loading true when conversation changes
    setMessages([]);
    setLastVisibleMessage(null);
    setHasMoreMessages(true);

    const messagesQuery = query(
      collection(db, "chats", selectedConversation.id, "messages"),
      orderBy("timestamp", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages: ChatMessage[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          let timestamp = new Date();
          if (data.timestamp instanceof Timestamp) {
            timestamp = data.timestamp.toDate();
          } else { console.warn(`Message ${docSnap.id} invalid timestamp.`); }
          return {
            id: docSnap.id,
            chatId: selectedConversation.id,
            senderId: data.senderId,
            text: data.text,
            timestamp: timestamp,
            isRead: data.isRead || false,
            status: data.status || 'sent',
          } as ChatMessage;
        })
        .reverse();

      setMessages(fetchedMessages);
      setLastVisibleMessage(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);
      setIsLoadingMessages(false); // Set loading false after messages are fetched
    }, (error) => {
      console.error("Error fetching messages:", error);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();

  }, [selectedConversation?.id, currentUser]); // Depend on conversation ID and user

  const loadMoreMessages = async () => {
     if (!selectedConversation?.id || !lastVisibleMessage || !hasMoreMessages || isLoadingMessages) return;
     setIsLoadingMessages(true);
     const moreMessagesQuery = query(
      collection(db, "chats", selectedConversation.id, "messages"),
      orderBy("timestamp", "desc"),
      startAfter(lastVisibleMessage),
      limit(PAGE_SIZE)
     );
     try {
         const snapshot = await getDocs(moreMessagesQuery);
         const newMessages = snapshot.docs
         .map(docSnap => {
              const data = docSnap.data();
               let timestamp = new Date();
              if (data.timestamp instanceof Timestamp) {
                 timestamp = data.timestamp.toDate();
              } else { console.warn(`Loaded message ${docSnap.id} has invalid timestamp.`); }
              return { id: docSnap.id, ...data, timestamp: timestamp, } as ChatMessage
         })
         .reverse();

         setMessages(prev => [...newMessages, ...prev]);
         setLastVisibleMessage(snapshot.docs[snapshot.docs.length - 1] || null);
         setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);
     } catch(error) {
         console.error("Error loading more messages:", error);
     } finally {
         setIsLoadingMessages(false);
     }
  };

  const handleSendMessage = async (e: FormEvent) => {
     e.preventDefault();
     if (!newMessage.trim() || !selectedConversation?.id || !currentUser || !otherUser || isSending) return;

     setIsSending(true);
     const chatId = selectedConversation.id;
     const messageData = {
      senderId: currentUser.uid,
      receiverId: otherUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
      status: 'sent',
     };

     try {
      await addDoc(collection(db, "chats", chatId, "messages"), messageData);
      const chatDocRef = doc(db, "chats", chatId);
      await setDoc(chatDocRef, {
        lastMessageText: newMessage,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: currentUser.uid,
        [`${otherUser.uid}_isRead`]: false,
        [`${currentUser.uid}_isRead`]: true,
      }, { merge: true });
      setNewMessage("");
     } catch (error) {
      console.error("Error sending message:", error);
     } finally {
      setIsSending(false);
     }
  };

  // Filter conversations and users based on search term
   const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser?.email?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
   );


  if (authLoading) {
     return <div className="flex h-full items-center justify-center p-6"><Skeleton className="w-full h-64" /></div>;
  }
  if (!currentUser) {
     return <div className="flex h-full items-center justify-center p-6">Please login to access chat.</div>;
  }

  const ChatMessageItem = ({ msg }: { msg: ChatMessage }) => {
     const isMyMessage = msg.senderId === currentUser?.uid;
     const sender = isMyMessage ? currentUser : otherUser;

     return (
         <div className={cn("flex mb-3", isMyMessage ? "justify-end" : "justify-start")}>
         {!isMyMessage && sender && (
             <Avatar className="h-8 w-8 mr-2 self-end">
                 <AvatarImage src={sender.photoURL || undefined} data-ai-hint="user avatar"/>
                 <AvatarFallback>{sender.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
             </Avatar>
         )}
         <div
             className={cn(
                 "max-w-[70%] p-3 rounded-xl text-sm shadow-md",
                 isMyMessage ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none border"
             )}
         >
             <p>{msg.text}</p>
             <div className={cn("text-xs mt-1.5 flex items-center", isMyMessage ? "text-primary-foreground/70 justify-end" : "text-muted-foreground/80 justify-start")}>
                  {msg.timestamp instanceof Date && !isNaN(msg.timestamp.getTime()) ? format(msg.timestamp, "HH:mm") : "..."}
                 {isMyMessage && msg.status && (
                     msg.status === 'read' ? <CheckCheck className="ml-1.5 h-4 w-4 text-blue-300" /> :
                     msg.status === 'delivered' ? <CheckCheck className="ml-1.5 h-4 w-4" /> :
                     <Check className="ml-1.5 h-4 w-4" />
                 )}
             </div>
         </div>
         {isMyMessage && sender && (
             <Avatar className="h-8 w-8 ml-2 self-end">
                 <AvatarImage src={sender.photoURL || undefined} data-ai-hint="user avatar"/>
                 <AvatarFallback>{sender.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
             </Avatar>
         )}
         </div>
     );
  };


  return (
    <div className="flex h-[calc(100vh-5rem)] bg-background">
      {/* Left Panel: Conversation List / User List */}
      <div className="w-1/4 min-w-[300px] max-w-[380px] border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground mb-2">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats or users"
              className="pl-10 bg-input rounded-full h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
           <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="chats" className="text-xs">Chats</TabsTrigger>
                <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
              </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-grow">
            {/* Chats Tab Content */}
            {activeTab === "chats" && (
                 isLoadingConversations ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                    </div>
                 ) : filteredConversations.length === 0 ? (
                    <p className="p-4 text-center text-muted-foreground">No active conversations.</p>
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
                            <AvatarFallback>{conv.otherUser.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                            <h3 className="font-medium text-sm text-foreground truncate">{conv.otherUser.name}</h3>
                            <p className={cn("text-xs truncate", conv.unreadCount && conv.unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground")}>
                                {conv.lastMessageSenderId === currentUser?.uid ? "You: " : ""}
                                {conv.lastMessageText}
                            </p>
                        </div>
                        <div className="text-xs text-muted-foreground/80 flex flex-col items-end ml-2 space-y-1">
                            <span>
                                {conv.lastMessageTimestamp instanceof Date && !isNaN(conv.lastMessageTimestamp.getTime())
                                ? formatDistanceToNowStrict(conv.lastMessageTimestamp, { addSuffix: false }) : '...'}
                            </span>
                            {conv.unreadCount && conv.unreadCount > 0 && (
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{conv.unreadCount}</span>
                            )}
                        </div>
                        </div>
                    )
                    ))
                 )
            )}

            {/* Users Tab Content */}
             {activeTab === "users" && (
                 isLoadingUsers ? (
                     <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                    </div>
                 ) : filteredUsers.length === 0 ? (
                     <p className="p-4 text-center text-muted-foreground">No users found.</p>
                 ) : (
                     filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50"
                            onClick={() => handleSelectUserToChat(user)}
                        >
                            <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={user.photoURL || undefined} data-ai-hint="user avatar"/>
                                <AvatarFallback>{user.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow overflow-hidden">
                                <h3 className="font-medium text-sm text-foreground truncate">{user.name}</h3>
                                <p className="text-xs text-muted-foreground capitalize">{user.role || 'User'}</p>
                            </div>
                            {/* Optionally add online status indicator */}
                        </div>
                    ))
                 )
             )}
        </ScrollArea>
      </div>

      {/* Right Panel: Chat Window */}
      <div className="flex-1 flex flex-col bg-secondary/30">
        {/* Conditional Rendering based on if a chat is selected */}
        {(selectedConversation || (isLoadingMessages && otherUser)) ? (
            <>
                {/* Chat Header - Show skeleton if loading but otherUser is known */}
                 <div className="flex items-center justify-between p-3 border-b border-border bg-card shadow-sm">
                    {otherUser ? (
                         <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={otherUser.photoURL || undefined} data-ai-hint="user avatar"/>
                                <AvatarFallback>{otherUser.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-foreground">{otherUser.name}</h3>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {otherUser.role || (otherUser.isOnline ? "Online" : (otherUser.lastSeen instanceof Date && !isNaN(otherUser.lastSeen.getTime()) ? `Last seen ${formatDistanceToNowStrict(otherUser.lastSeen, {addSuffix: true})}` : "Offline"))}
                                </p>
                            </div>
                         </div>
                    ) : (
                        <div className="flex items-center">
                             <Skeleton className="h-10 w-10 mr-3 rounded-full" />
                             <div className="space-y-1">
                                 <Skeleton className="h-4 w-24" />
                                 <Skeleton className="h-3 w-16" />
                             </div>
                        </div>
                    )}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Phone className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Video className="h-5 w-5"/></Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><MoreVertical className="h-5 w-5"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>View Info</DropdownMenuItem>
                            <DropdownMenuItem disabled className="text-destructive">Clear Chat</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                 </div>

                {/* Messages Area */}
                <ScrollArea className="flex-grow p-4 space-y-4" id="message-scroll-area">
                    {!isLoadingMessages && hasMoreMessages && messages.length >= PAGE_SIZE && (
                        <div className="text-center mb-4">
                            <Button variant="outline" size="sm" onClick={loadMoreMessages} disabled={isLoadingMessages}>Load older messages</Button>
                        </div>
                    )}
                    {isLoadingMessages && messages.length === 0 && (
                        <div className="p-4 space-y-3 flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4"/>
                            <p className="text-muted-foreground text-sm">Loading messages...</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <ChatMessageItem key={msg.id} msg={msg} />
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
                            disabled={isSending || isLoadingMessages}
                        />
                        <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-primary"><Mic className="h-5 w-5" /></Button>
                        <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 rounded-full w-11 h-11" disabled={isSending || !newMessage.trim() || isLoadingMessages}>
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" /> : <Send className="h-5 w-5 text-primary-foreground" />}
                        </Button>
                    </form>
                </div>
             </>
        ) : (
          // Placeholder when no chat is selected
          <div className="flex-grow flex flex-col items-center justify-center text-center p-10">
            <Info className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-1">Select a chat or user</h3>
            <p className="text-muted-foreground">Choose someone from the list on the left to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
