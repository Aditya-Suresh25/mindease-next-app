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
          window.history.pushState({}, "", `/therapy/${newId}`);
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
    if (!message.trim() || isTyping || !sessionId) return;
    setUserScrolledUp(false);
    const userMsg: ChatMessage = { role: "user", content: message, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setIsTyping(true);
    try {
     const response = await sendChatMessage(sessionId, userMsg.content);
    const parsed = typeof response === "string" ? JSON.parse(response) : response;
    
    setMessages((prev) => [...prev, { 
      role: "assistant", 
      content: parsed.response || parsed.message || "I'm listening.", 
      timestamp: new Date() 
    }]);
    // FORCE SIDEBAR REFRESH: This ensures the 'New Session' name updates 
    // to the first message content in the sidebar immediately.
    setRefreshSidebar(prev => prev + 1);
    } catch { 
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble responding right now.", timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl border-r border-border/40">
      <div className="p-4 border-b border-border/40 flex items-center justify-between bg-background/50">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">History</h2>
        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={async () => {
          const id = await createChatSession(); setSessionId(id); setMessages([]); window.history.pushState({}, "", `/therapy/${id}`);
        }}><PlusCircle size={18} /></Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map((s) => (
            <div key={s.sessionId} onClick={() => setSessionId(s.sessionId)} className={cn("p-3 rounded-xl cursor-pointer transition-all border border-transparent", s.sessionId === sessionId ? "bg-primary/10 border-primary/20" : "hover:bg-muted/50")}>
              <p className="text-sm font-medium truncate text-foreground/90">{s.messages[0]?.content || "New Session"}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  if (!mounted || isLoading) return null;

  return (
    <div className="fixed inset-0 z-[60] flex bg-background text-foreground overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-r border-border/40 shrink-0">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0 bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 z-[100]">
                <SheetHeader className="sr-only"><SheetTitle>History</SheetTitle></SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" /> MindEase Assistant
            </h1>
          </div>
          <Badge variant="outline" className="hidden sm:flex text-[10px] border-primary/20 text-primary bg-primary/5 px-2">Private Session</Badge>
        </header>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth" onScroll={handleScroll}>
          <div className="flex flex-col px-4 md:px-6 py-10 w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto min-h-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-20 opacity-40">
                <Sparkles size={48} className="text-primary mb-4" />
                <h2 className="text-2xl font-bold">How are you feeling?</h2>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.article key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex w-full my-4", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("flex gap-4 max-w-[85%] lg:max-w-[75%] items-start", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1", msg.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border")}>
                      {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className={cn("px-5 py-3.5 rounded-3xl text-sm md:text-base leading-relaxed", msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md" : "bg-secondary text-secondary-foreground border border-border/40 rounded-tl-sm shadow-sm")}>
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {msg.role === "assistant" && (
  <div className="flex items-center gap-2 pt-2 transition-opacity duration-300">
    {/* Listen Button: Forced Contrast */}
    <Button
      variant="secondary"
      size="sm"
      onClick={() => handleToggleSpeech(msg.content, idx)}
      className={cn(
        "h-8 px-3 text-[10px] font-bold rounded-full border shadow-sm transition-all",
        isSpeaking === idx 
          ? "bg-primary text-primary-foreground border-primary scale-105" 
          : "bg-background text-foreground border-border hover:border-primary/50"
      )}
    >
      {isSpeaking === idx ? (
        <VolumeX size={14} className="mr-1.5" />
      ) : (
        <Volume2 size={14} className="mr-1.5" />
      )}
      {isSpeaking === idx ? "STOP" : "LISTEN"}
    </Button>

    {/* Voice Settings: Elevated Z-Index and Contrast */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full border-border/60 bg-background hover:text-primary hover:border-primary/50 shadow-sm"
        >
          <Settings2 size={14} />
        </Button>
      </DropdownMenuTrigger>
      
      {/* Portals help the dropdown "jump" out of the scroll container */}
      <DropdownMenuContent 
        align="start" 
        side="bottom"
        className="w-64 z-[110] bg-popover/95 backdrop-blur-xl border-border shadow-2xl rounded-2xl p-1"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1.5">
          System Voices
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        
        <ScrollArea className="h-48 pr-2 custom-scrollbar">
          <div className="space-y-0.5 p-1">
            {availableVoices.length > 0 ? (
              availableVoices.map((voice) => (
                <DropdownMenuItem
                  key={voice.name}
                  onClick={() => setSelectedVoiceName(voice.name)}
                  className={cn(
                    "text-xs rounded-lg cursor-pointer px-2 py-2 transition-colors",
                    selectedVoiceName === voice.name 
                      ? "bg-primary/20 text-primary font-semibold" 
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="truncate">{voice.name}</span>
                    <span className="text-[9px] opacity-50 uppercase">{voice.lang}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No voices detected
              </div>
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)}
                    </div>
                  </div>
                </motion.article>
              ))
            )}
            {isTyping && <div className="flex gap-2 items-center text-xs text-muted-foreground animate-pulse p-4"><Loader2 size={12} className="animate-spin" /> Assistant is typing...</div>}
            <div ref={messagesEndRef} className="h-20 shrink-0" />
          </div>
        </div>

        {/* Floating Scroll Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-36 left-0 right-0 flex justify-center z-30 pointer-events-none">
              <Button size="sm" onClick={scrollToBottom} className="rounded-full shadow-xl pointer-events-auto bg-primary text-primary-foreground hover:scale-105 transition-transform px-4 border-2 border-background">
                <ArrowDown className="w-4 h-4 mr-2" /> Latest Messages
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Footer */}
        <footer className="p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent shrink-0 z-20">
          <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <div className="relative flex items-end gap-2 bg-card border border-border/50 rounded-[2rem] p-2 pl-5 focus-within:ring-2 focus-within:ring-primary/20 shadow-lg">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit(e as any))}
                placeholder="Message MindEase..."
                className="flex-1 bg-transparent border-0 focus:ring-0 py-3 text-sm md:text-base max-h-48 resize-none leading-relaxed placeholder:text-muted-foreground/50"
                rows={1}
              />
              <Button type="submit" size="icon" disabled={!message.trim() || isTyping} onClick={handleSubmit} className={cn("h-10 w-10 shrink-0 rounded-full transition-all", message.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground/60 mt-3 font-medium">Safe Space: Encryption Enabled</p>
          </div>
        </footer>
      </main>
    </div>
  );
}