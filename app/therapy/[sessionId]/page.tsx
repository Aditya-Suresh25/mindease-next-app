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
  Volume2,
  VolumeX,
  Settings2,
  ArrowDown,
  Sparkles,
  Shield,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import { RecommendationCard } from "@/components/chat/recommendation-card";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Voice States
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);

  // Suggestions State
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Cooldown State
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Update suggestions when a new message arrives with metadata
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.metadata?.suggestedResponses) {
        setSuggestions(lastMsg.metadata.suggestedResponses);
      } else {
        setSuggestions([]);
      }
    }
  }, [messages]);

  const handleSuggestionClick = (text: string) => {
    if (cooldown > 0) return;
    setMessage(text);
    setSuggestions([]);
    // Optional: auto-submit could go here if we wanted to trigger handleSubmit immediately
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setMounted(true);
  }, [router]);

  // Load voices logic
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
      setAvailableVoices(englishVoices);

      if (!selectedVoiceName && englishVoices.length > 0) {
        const preferred = englishVoices.find((v) =>
          /female|samantha|victoria|google uk english female/i.test(v.name)
        );
        if (preferred) setSelectedVoiceName(preferred.name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoiceName]);

  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      try {
        if (!sessionId || sessionId === "new") {
          const newId = await createChatSession();
          setSessionId(newId);
          // Use replaceState to update URL without adding to history stack, so 'Back' works better
          window.history.replaceState({}, "", `/therapy/${newId}`);
          setRefreshSidebar(prev => prev + 1); // <--- Add this to refresh sidebar immediately
        } else {
          const history = await getChatHistory(sessionId);
          if (Array.isArray(history)) {
            setMessages(history.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
          }
        }
      } catch { setMessages([]); } finally { setIsLoading(false); }
    };
    initChat();
  }, [sessionId]);

  // 1. Add a refresh trigger state
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  // 2. Updated Fetcher: Watch for sessionId changes and manual refreshes
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const all = await getAllChatSessions();
        // Sort newest updated first
        const sorted = all.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setSessions(sorted);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      }
    };
    loadSessions();
  }, [messages.length, sessionId, refreshSidebar]);
  // Added messages.length and sessionId as triggers

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUserScrolledUp(false);
  };

  useEffect(() => {
    if (!userScrolledUp) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping, userScrolledUp]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const fromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollButton(fromBottom > 150);
    if (fromBottom > 150) setUserScrolledUp(true);
  };

  const handleToggleSpeech = (text: string, index: number) => {
    if (isSpeaking === index) { window.speechSynthesis.cancel(); setIsSpeaking(null); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    const voice = availableVoices.find((v) => v.name === selectedVoiceName);
    if (voice) utterance.voice = voice;
    utterance.onend = () => setIsSpeaking(null);
    setIsSpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping || !sessionId || cooldown > 0) return;
    setUserScrolledUp(false);
    const userMsg: ChatMessage = { role: "user", content: message, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setIsTyping(true);
    try {
      const response = await sendChatMessage(sessionId, userMsg.content);
      const parsed = typeof response === "string" ? JSON.parse(response) : response;

      // Handle Cooldown
      if (parsed.cooldown) {
        setCooldown(parsed.cooldown);
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: parsed.response || parsed.message || "I'm listening.",
        timestamp: new Date(),
        metadata: {
          analysis: parsed.analysis,
          technique: parsed.metadata?.technique || "general_support",
          goal: parsed.metadata?.goal || "support",
          progress: parsed.metadata?.progress || [],
          ...parsed.metadata
        }
      }]);
      // FORCE SIDEBAR REFRESH: This ensures the 'New Session' name updates 
      // to the first message content in the sidebar immediately.
      setRefreshSidebar(prev => prev + 1);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble responding right now.", timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  // Redesigned Sidebar Content
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Chat History</h2>
        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-colors" onClick={async () => {
          const id = await createChatSession(); setSessionId(id); setMessages([]); window.history.pushState({}, "", `/therapy/${id}`);
        }}>
          <PlusCircle size={18} />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {sessions.map((s) => (
            <div
              key={s.sessionId}
              onClick={() => setSessionId(s.sessionId)}
              className={cn(
                "p-3 rounded-xl cursor-pointer transition-all duration-200 border group backdrop-blur-sm",
                s.sessionId === sessionId
                  ? "bg-primary/10 border-primary/20 shadow-sm"
                  : "hover:bg-white/5 border-transparent hover:border-white/10"
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <p className={cn("text-xs md:text-sm font-medium truncate flex-1 transition-colors", s.sessionId === sessionId ? "text-primary" : "text-foreground/80 group-hover:text-foreground")}>
                  {s.messages[0]?.content || "New Session"}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium">
                {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
  if (!mounted || isLoading) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden font-sans border-t border-border/10">
      {/* Sidebar Desktop - Liquid Glass */}
      <aside className="hidden lg:flex flex-col w-80 border-r border-border/10 shrink-0 bg-white/10 dark:bg-black/10 backdrop-blur-xl">
        <SidebarContentComponent
          sessions={sessions}
          setSessionId={setSessionId}
          currentSessionId={sessionId}
          onCreateSession={async () => {
            const id = await createChatSession();
            setSessionId(id);
            setMessages([]);
            window.history.pushState({}, "", `/therapy/${id}`);
          }}
        />
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0 bg-background/50">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        {/* Header - Transparent/Glass */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border/10 bg-white/5 dark:bg-black/5 backdrop-blur-md z-20 shrink-0 sticky top-0">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 text-muted-foreground hover:text-primary">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 z-[100] border-r-0 bg-transparent">
                <div className="h-full bg-background/80 backdrop-blur-xl border-r border-border/10">
                  <SidebarContentComponent
                    sessions={sessions}
                    setSessionId={setSessionId}
                    currentSessionId={sessionId}
                    onCreateSession={async () => {
                      const id = await createChatSession();
                      setSessionId(id);
                      setMessages([]);
                      window.history.pushState({}, "", `/therapy/${id}`);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold flex items-center gap-3 tracking-tight">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              MindEase Assistant
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex text-[10px] border-primary/20 text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">Private</Badge>
          </div>
        </header>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar" onScroll={handleScroll}>
          <div className="flex flex-col px-4 md:px-8 py-10 w-full max-w-4xl mx-auto min-h-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-20 opacity-40">
                <div className="w-16 h-16 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Sparkles size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground/80">How are you feeling today?</h2>
                <p className="text-muted-foreground mt-2">I'm here to listen and help.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                const showTimestamp = idx === messages.length - 1 || idx % 2 === 0;

                // Parse potential recommendation from metadata
                const meta = msg.metadata as any;
                const recommendation = meta?.recommendation || (msg.role === "assistant" && msg.content.includes("suggest") && msg.content.length < 150 ? {
                  // Fallback logic
                } : null);

                return (
                  <motion.article
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex w-full mb-8 relative group", isUser ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("flex gap-4 max-w-[85%] lg:max-w-[75%] items-end", isUser ? "flex-row-reverse" : "flex-row")}>
                      {/* Avatar with Ring */}
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm mb-1 ring-2 ring-background transition-transform duration-300 group-hover:scale-105",
                        isUser ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" : "bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-white/10 text-primary"
                      )}>
                        {isUser ? <User size={16} /> : <Bot size={16} />}
                      </div>

                      <div className="flex flex-col gap-1.5 min-w-0">
                        {/* Name & Time */}
                        <div className={cn("flex items-center gap-2 text-[10px] text-muted-foreground px-1 uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300", isUser ? "justify-end" : "justify-start")}>
                          <span>{isUser ? "You" : "Assistant"}</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span>{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</span>
                        </div>

                        {/* Liquid Bubble */}
                        <div className={cn(
                          "px-6 py-4 text-sm md:text-[15px] leading-relaxed relative shadow-lg backdrop-blur-md transition-all duration-300",
                          isUser
                            ? "bg-primary text-primary-foreground rounded-[24px] rounded-br-[4px] shadow-primary/20"
                            : "bg-white/80 dark:bg-white/5 border border-white/20 dark:border-white/10 text-foreground rounded-[24px] rounded-bl-[4px] shadow-sm"
                        )}>
                          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>

                        {/* Recommendation Card Integration */}
                        {msg.metadata?.analysis?.recommendedApproach?.includes("breathing") && (
                          <RecommendationCard
                            type="activity"
                            title="Breathing Exercise"
                            description="Take a moment to center yourself."
                            link="/dashboard"
                            actionLabel="Start Now"
                          />
                        )}

                        {/* Crisis / SOS Alert */}
                        {msg.metadata?.analysis?.isCrisis && (
                          <div className="w-full max-w-md mt-4 mb-2 overflow-hidden rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/50 shadow-lg shadow-red-500/20">
                            <div className="bg-red-500 px-4 py-2">
                              <h4 className="font-bold text-white flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Immediate Help Available
                              </h4>
                            </div>
                            <div className="p-4 space-y-3">
                              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                                You are not alone. If you&apos;re in crisis, please reach out to these mental health helplines:
                              </p>
                              <div className="space-y-2">
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="w-full justify-start gap-2 h-10 bg-red-600 hover:bg-red-700" 
                                  onClick={() => window.open("tel:14416")}
                                >
                                  <PhoneCall size={16} /> Tele-MANAS: 14416
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="w-full justify-start gap-2 h-10 bg-red-600 hover:bg-red-700" 
                                  onClick={() => window.open("tel:9152987821")}
                                >
                                  <PhoneCall size={16} /> iCall: 9152987821
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="w-full justify-start gap-2 h-10 bg-red-600 hover:bg-red-700" 
                                  onClick={() => window.open("tel:18005990019")}
                                >
                                  <PhoneCall size={16} /> Vandrevala Foundation: 1800-599-0019
                                </Button>
                              </div>
                              <div className="pt-2 border-t border-red-200 dark:border-red-800">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full justify-center gap-2 h-10 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-semibold" 
                                  onClick={() => window.open("https://telemanas.mohfw.gov.in/", "_blank")}
                                >
                                  <ArrowRight size={16} /> Visit Tele-MANAS Website
                                </Button>
                              </div>
                              <p className="text-xs text-red-600/70 dark:text-red-400/70 text-center">
                                24/7 Free Mental Health Support
                              </p>
                            </div>
                          </div>
                        )}

                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleSpeech(msg.content, idx)}
                              className={cn("h-7 w-7 rounded-full hover:bg-muted/50 transition-colors", isSpeaking === idx && "text-primary bg-primary/10 opacity-100")}
                              title="Listen"
                            >
                              {isSpeaking === idx ? <VolumeX size={14} /> : <Volume2 size={14} />}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                )
              })
            )}
            {isTyping && (
              <div className="flex gap-3 items-center ml-2 mb-8">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                  <Loader2 size={14} className="animate-spin text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground/60 font-medium tracking-wide">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} className="h-24 shrink-0" />
          </div>
        </div>

        {/* Floating Scroll Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute bottom-32 left-0 right-0 flex justify-center z-30 pointer-events-none">
              <Button size="sm" onClick={scrollToBottom} className="rounded-full shadow-xl pointer-events-auto bg-primary/90 text-primary-foreground hover:scale-105 transition-transform px-5 border border-white/10 backdrop-blur-md">
                <ArrowDown className="w-4 h-4 mr-2" /> Recent Messages
              </Button>
            </motion.div>
          )}
        </AnimatePresence>



        // ...

        {/* Input Footer - Floating Glass Bar */}
        <footer className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-20">
          <div className="max-w-4xl mx-auto relative">
            {/* Suggestions Pills */}
            <AnimatePresence>
              {suggestions.length > 0 && !isTyping && cooldown === 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none justify-center">
                  {suggestions.map((suggestion, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="whitespace-nowrap px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs md:text-sm font-medium rounded-full border border-primary/20 backdrop-blur-md transition-colors shadow-sm"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-[2.5rem] blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-end gap-3 bg-card/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2rem] p-2 pl-6 shadow-2xl transition-all focus-within:ring-1 focus-within:ring-primary/20">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit(e as any))}
                  placeholder={cooldown > 0 ? `You can continue in ${cooldown} seconds` : "Type your message..."}
                  disabled={cooldown > 0}
                  className="flex-1 bg-transparent border-0 focus:ring-0 py-4 text-[15px] max-h-48 resize-none leading-relaxed placeholder:text-muted-foreground/40 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={1}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || isTyping || cooldown > 0}
                  onClick={handleSubmit}
                  className={cn("h-11 w-11 shrink-0 rounded-full transition-all duration-300 shadow-lg mb-0.5 mr-0.5", message.trim() && !cooldown ? "bg-primary text-primary-foreground hover:scale-105 hover:shadow-primary/25" : "bg-muted/50 text-muted-foreground hover:bg-muted/80")}
                >
                  {cooldown > 0 ? (
                    <span className="text-[10px] font-bold">{cooldown}</span>
                  ) : isTyping ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send size={18} className={cn(message.trim() && "ml-0.5")} />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground/40 mt-3 font-medium tracking-wide">
              <Shield className="w-3 h-3 inline-block mr-1 opacity-50" />
              End-to-end encrypted • Private Session
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Helper to redesign Sidebar
function SidebarContentComponent({ sessions, setSessionId, currentSessionId, onCreateSession }: any) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Chat History</h2>
        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-colors" onClick={onCreateSession}>
          <PlusCircle size={18} />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {sessions.map((s: any) => (
            <div
              key={s.sessionId}
              onClick={() => setSessionId(s.sessionId)}
              className={cn(
                "p-3 rounded-xl cursor-pointer transition-all duration-200 border group backdrop-blur-sm",
                s.sessionId === currentSessionId
                  ? "bg-primary/10 border-primary/20 shadow-sm"
                  : "hover:bg-white/5 border-transparent hover:border-white/10"
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <p className={cn("text-sm font-medium truncate flex-1 transition-colors", s.sessionId === currentSessionId ? "text-primary" : "text-foreground/80 group-hover:text-foreground")}>
                  {s.messages[0]?.content || "New Session"}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium">
                {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}