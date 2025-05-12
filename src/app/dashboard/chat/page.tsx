
"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { Search, Send, Paperclip, Smile, Mic, Check, CheckCheck, Info, MoreVertical, Phone, Video, Loader2 } from "lucide-react";
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
import { getOrCreateChatId } from "@/lib/firebase/firestore"; // Import shared function

const PAGE_SIZE = 20;


export default function StudentChatPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [otherUser, setOtherUser] = useState<AppUser | null>(null); // User the student is chatting with (usually admin)

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastVisibleMessage, setLastVisibleMessage] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isSending, setIsSending] = useState(false); // State for sending indicator

  // Fetch conversations for the current student
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
        // Find the participant who is NOT the current student
        const otherParticipantId = data.participants.find((pId: string) => pId !== currentUser.uid);
        let otherUserDetails: AppUser | null = null;

        if (otherParticipantId) {
          const userDoc = await getDoc(doc(db, "users", otherParticipantId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            otherUserDetails = {
              id: userDoc.id,
              uid: userData.uid,
              name: userData.displayName || "User", // Display name or fallback
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
          // Unread count: check if last message sender is not current user and current user hasn't read it
          unreadCount: (data.lastMessageSenderId !== currentUser.uid && !data[`${currentUser.uid}_isRead`]) ? 1 : 0,
          otherUser: otherUserDetails, // Store the fetched details
        } as ChatConversation;
      });

      const resolvedConvs = await Promise.all(convsPromises);
      // Filter out conversations where the other user couldn't be found (e.g., deleted account)
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

  const handleSelectConversation = async (conversation: ChatConversation) => {
    if (!currentUser || !conversation.otherUser) return;
    setSelectedConversation(conversation);
    setOtherUser(conversation.otherUser); // Set the user being chatted with
    setIsLoadingMessages(true);
    setMessages([]); // Clear previous messages
    setLastVisibleMessage(null); // Reset pagination
    setHasMoreMessages(true);

    // Mark messages as read by the current user for this chat
    const chatDocRef = doc(db, "chats", conversation.id);
    await setDoc(chatDocRef, { [`${currentUser.uid}_isRead`]: true }, { merge: true });
  };

  // Fetch initial messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !currentUser) return;

    // Reset message loading state only when conversation changes
    setIsLoadingMessages(true);
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
        .map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                chatId: selectedConversation.id,
                senderId: data.senderId,
                text: data.text,
                timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                isRead: data.isRead || false, // Consider adding isRead tracking per message
                status: data.status || 'sent',
            } as ChatMessage;
        })
        .reverse(); // Reverse to show oldest first

      setMessages(fetchedMessages);
      setLastVisibleMessage(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);
      setIsLoadingMessages(false);
      // No need to scroll here, useEffect [messages] handles it
    }, (error) => {
        console.error("Error fetching messages:", error);
        setIsLoadingMessages(false);
    });

    return () => unsubscribe();

  }, [selectedConversation?.id, currentUser]); // Depend only on conversation ID and user

  const loadMoreMessages = async () => {
    if (!selectedConversation || !lastVisibleMessage || !hasMoreMessages || isLoadingMessages) return;
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
    if (!newMessage.trim() || !selectedConversation || !currentUser || !otherUser || isSending) return;

    setIsSending(true);
    const chatId = selectedConversation.id;
    const messageData = {
      senderId: currentUser.uid,
      receiverId: otherUser.uid, // Include receiver ID
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
        lastMessageSenderId: currentUser.uid,
        [`${otherUser.uid}_isRead`]: false, // Mark as unread for the recipient (admin/teacher)
        [`${currentUser.uid}_isRead`]: true, // Mark as read for sender (student)
      }, { merge: true });

      setNewMessage("");
      // scrollToBottom will be triggered by useEffect on messages change
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error (e.g., show toast)
    } finally {
      setIsSending(false);
    }
  };

  // Filter conversations based on search term (applied to the other user's name/email)
  const [searchTerm, setSearchTerm] = useState("");
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return <div className="flex h-full items-center justify-center p-6"><Skeleton className="w-full h-64" /></div>;
  }
  if (!currentUser) {
    return <div className="flex h-full items-center justify-center p-6">Please login to access chat.</div>;
  }

  const ChatMessageItem = ({ msg }: { msg: ChatMessage }) => {
    const isMyMessage = msg.senderId === currentUser?.uid;
    const sender = isMyMessage ? currentUser : otherUser; // Determine sender based on message

    return (
        <div className={cn("flex mb-3", isMyMessage ? "justify-end" : "justify-start")}>
        {!isMyMessage && sender && (
            <Avatar className="h-8 w-8 mr-2 self-end">
            <AvatarImage src={sender.photoURL || undefined} data-ai-hint="user avatar"/>
            <AvatarFallback>{sender.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
        )}
        <div
            className={cn(
            "max-w-[70%] p-3 rounded-xl text-sm shadow-md",
            isMyMessage
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-card text-card-foreground rounded-bl-none border"
            )}
        >
            <p>{msg.text}</p>
            <div className={cn("text-xs mt-1.5 flex items-center", isMyMessage ? "text-primary-foreground/70 justify-end" : "text-muted-foreground/80 justify-start")}>
            {format(msg.timestamp, "HH:mm")}
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
            <AvatarFallback>{sender.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
        )}
        </div>
    );
   };


  return (
    // Match admin chat layout structure for consistency
    <div className="flex h-[calc(100vh-var(--student-header-height,5rem))] bg-background"> {/* Adjust height based on actual header */}
      {/* Left Panel: Conversation List */}
      <div className="w-1/4 min-w-[300px] max-w-[380px] border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground mb-1">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search chats"
                className="pl-10 bg-input rounded-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          {isLoadingConversations ? (
            <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">No conversations yet.</p>
          ) : (
            filteredConversations.map((conv) => (
              conv.otherUser && ( // Ensure other user details exist
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
        {selectedConversation && otherUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-card shadow-sm">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={otherUser.photoURL || undefined} data-ai-hint="user avatar"/>
                  <AvatarFallback>{otherUser.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{otherUser.name}</h3>
                   {/* Display role or online status */}
                   <p className="text-xs text-muted-foreground capitalize">
                      {otherUser.role || (otherUser.isOnline ? "Online" : (otherUser.lastSeen ? `Last seen ${formatDistanceToNowStrict(otherUser.lastSeen, {addSuffix: true})}` : "Offline"))}
                   </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 {/* Actions like call, video call, etc. can be added here if needed */}
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Phone className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Video className="h-5 w-5"/></Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><MoreVertical className="h-5 w-5"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Info</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Clear Chat</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-grow p-4 space-y-4" id="message-scroll-area">
              {isLoadingMessages && messages.length === 0 && (
                 <div className="p-4 space-y-3 flex flex-col items-center">
                     <Loader2 className="h-8 w-8 animate-spin text-primary mb-4"/>
                     <p className="text-muted-foreground text-sm">Loading messages...</p>
                </div>
              )}
              {!isLoadingMessages && hasMoreMessages && messages.length >= PAGE_SIZE && (
                <div className="text-center">
                    <Button variant="outline" size="sm" onClick={loadMoreMessages} disabled={isLoadingMessages}>Load older messages</Button>
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
                  disabled={isSending}
                />
                <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-primary"><Mic className="h-5 w-5" /></Button>
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 rounded-full w-11 h-11" disabled={isSending || !newMessage.trim()}>
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" /> : <Send className="h-5 w-5 text-primary-foreground" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-10">
            <Info className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-1">Select a conversation</h3>
            <p className="text-muted-foreground">Choose someone from the list to start chatting.</p>
            {/* Optionally add a button to start a new chat if needed */}
            {/* <Button className="mt-4">Start New Chat</Button> */}
          </div>
        )}
      </div>
    </div>
  );
}
