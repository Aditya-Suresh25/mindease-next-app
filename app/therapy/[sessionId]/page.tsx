"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteChatSessionApi } from "@/lib/api/chat";
import {
  Send,
  Bot,
  User,
  Loader2,
  PlusCircle,
  MessageSquare,
  Trash2,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import {
  createChatSession,
  sendChatMessage,
  getChatHistory,
  getAllChatSessions,
  ChatMessage,
  ChatSession,
} from "@/lib/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

export default function TherapyPage() {
  const params = useParams();
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(params.sessionId as string);

  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setMounted(true);
  }, [router]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [message]);

  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      try {
        if (!sessionId || sessionId === "new") {
          const newSessionId = await createChatSession();
          setSessionId(newSessionId);
          window.history.pushState({}, "", `/therapy/${newSessionId}`);
        } else {
          const history = await getChatHistory(sessionId);
          if (Array.isArray(history)) {
            setMessages(history.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })));
          }
        }
      } catch {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, [sessionId]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const all = await getAllChatSessions();
        setSessions(all);
      } catch {}
    };
    loadSessions();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isTyping]);

  const handleDeleteSession = async (e: React.MouseEvent, deleteId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this chat session?")) return;
    try {
      await deleteChatSessionApi(deleteId);
      setSessions(prev => prev.filter(s => s.sessionId !== deleteId));
      if (deleteId === sessionId) {
        setSessionId(null);
        setMessages([]);
        router.push("/therapy");
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping || !sessionId) return;

    const userMsg: ChatMessage = { role: "user", content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(sessionId, userMsg.content);
      const parsed = typeof response === "string" ? JSON.parse(response) : response;
      setMessages(prev => [...prev, {
        role: "assistant",
        content: parsed.response || parsed.message || "I'm here to listen.",
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      let errMsg = "I'm having trouble responding right now. Please try again in a moment.";
      const status = err?.status || 500;
      if (err?.body?.message) errMsg = err.body.message;
      
      if (status === 429) {
        errMsg = "I'm temporarily unavailable due to high demand. Please wait a moment and try again.";
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: errMsg,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/20">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Chat History
            </h2>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              const id = await createChatSession();
              setSessionId(id);
              setMessages([]);
              window.history.pushState({}, "", `/therapy/${id}`);
            }}
            aria-label="Start new chat session"
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 px-3 py-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 px-2">
              <MessageSquare className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/70">No sessions yet</p>
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={session.sessionId}
                onClick={() => setSessionId(session.sessionId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setSessionId(session.sessionId);
                    }
                }}
                className={cn(
                  "group relative w-full text-left p-3 rounded-lg transition-all duration-200 cursor-pointer",
                  "border border-transparent hover:border-border/50",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  session.sessionId === sessionId
                    ? "bg-primary/15 border-primary/30 shadow-sm"
                    : "hover:bg-muted/30"
                )}
                aria-current={session.sessionId === sessionId ? "page" : undefined}
                aria-label={`Chat session: ${session.messages[0]?.content.slice(0, 50) || 'New Session'}`}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare
                    className={cn(
                      "w-4 h-4 mt-0.5 shrink-0 transition-colors",
                      session.sessionId === sessionId
                        ? "text-primary"
                        : "text-muted-foreground/60"
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className="text-sm font-medium truncate leading-tight">
                      {session.messages[0]?.content.slice(0, 40) || "New Session"}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(session.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 h-8 w-8 transition-opacity"
                  onClick={e => handleDeleteSession(e, session.sessionId)}
                  aria-label={`Delete session`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive/70 hover:text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (!mounted || isLoading) {
    return (
      <main className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Creating your safe space...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden pt-16 lg:pt-0">
      <aside className="hidden lg:flex lg:flex-col w-80 border-r border-border/50 bg-muted/20">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col relative w-full bg-background lg:border-x border-border/50">
        <header
          className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20"
          role="banner"
        >
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 hover:bg-muted"
                  aria-label="Open chat history menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 bg-background">
                <SheetHeader className="sr-only">
                  <SheetTitle>Chat History</SheetTitle>
                  <SheetDescription>
                    View and manage your previous therapy sessions
                  </SheetDescription>
                </SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex flex-col gap-0.5">
              <h1 className="text-base md:text-lg font-semibold flex items-center gap-2 leading-tight">
                <span
                  className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                  aria-hidden="true"
                />
                Therapy Assistant
              </h1>
              <p className="text-xs text-muted-foreground">Here to support your well-being</p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="hidden sm:flex text-xs font-normal"
            aria-label="Connection status: encrypted"
          >
            Encrypted
          </Badge>
        </header>

        <ScrollArea className="flex-1 overflow-hidden">
          <section
            className="flex flex-col px-4 md:px-6 py-6 max-w-4xl mx-auto w-full"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6"
              >
                <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20">
                  <Bot className="w-10 h-10 text-primary" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-semibold">How are you feeling today?</h2>
                  <p className="text-muted-foreground max-w-sm text-sm md:text-base leading-relaxed">
                    I'm here to listen without judgment and provide support. Share what's on your mind.
                  </p>
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.article
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex w-full my-3", msg.role === "user" ? "justify-end" : "justify-start")}
                  role="article"
                  aria-label={`${msg.role === 'user' ? 'Your message' : 'Assistant message'}`}
                >
                  <div
                    className={cn(
                      "flex gap-3 max-w-[85%] md:max-w-[70%] items-end",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ring-1 ring-offset-1 ring-offset-background",
                        msg.role === "user"
                          ? "bg-primary ring-primary text-primary-foreground"
                          : "bg-muted ring-border text-muted-foreground"
                      )}
                      aria-hidden="true"
                    >
                      {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div
                      className={cn(
                        "px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted/60 border border-border/50 rounded-tl-none"
                      )}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:m-0 prose-p:leading-relaxed prose-li:m-0 prose-a:text-primary hover:prose-a:underline">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.article
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-center my-3"
                role="status"
                aria-label="Assistant is typing"
              >
                <div
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border ring-1 ring-border animate-pulse shadow-sm"
                  aria-hidden="true"
                >
                  <Bot size={16} className="text-muted-foreground" />
                </div>
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.article>
            )}

            <div ref={messagesEndRef} />
          </section>
        </ScrollArea>

        <footer className="border-t border-border/50 bg-background p-4 space-y-3">
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto space-y-2"
            role="region"
            aria-label="Message input"
          >
            <div className="relative flex items-end gap-2 bg-muted/40 rounded-2xl border border-border/50 px-4 py-2 transition-all focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50">
              <label htmlFor="message-input" className="sr-only">
                Message the therapy assistant
              </label>
              <textarea
                ref={textareaRef}
                id="message-input"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                placeholder="Share what's on your mind..."
                className="flex-1 bg-transparent border-0 focus:ring-0 py-2 text-sm max-h-40 resize-none leading-relaxed"
                aria-label="Message input"
              />
              <Button
                type="submit"
                disabled={!message.trim() || isTyping}
                size="icon"
                className="h-9 w-9 shrink-0 rounded-lg shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label={isTyping ? "Waiting for response" : "Send message"}
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground/80">
                Your safety is important. In emergencies, please contact local emergency services.
              </p>
            </div>
          </form>
        </footer>
      </main>
    </div>
  );
}