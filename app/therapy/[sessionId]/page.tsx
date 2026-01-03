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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cooldown and Speech states
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  
  // Voice Selection States
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setMounted(true);
  }, [router]);

  // Handle Voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      setAvailableVoices(englishVoices);

      if (!selectedVoiceName && englishVoices.length > 0) {
        const preferred = englishVoices.find(v => 
          /female|samantha|zira|victoria|karen|google uk english female/i.test(v.name)
        );
        if (preferred) setSelectedVoiceName(preferred.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceName]);

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

  const handleToggleSpeech = (text: string, index: number) => {
    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    
    const voice = availableVoices.find(v => v.name === selectedVoiceName);
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    
    setIsSpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

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
    if (!message.trim() || isTyping || isCooldown || !sessionId) return;

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

      setIsCooldown(true);
      setCooldownTime(3);
      const timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err: any) {
      let errMsg = "I'm having trouble responding right now. Please try again in a moment.";
      if (err?.status === 429) errMsg = "AI quota exceeded. Please wait a moment.";
      setMessages(prev => [...prev, { role: "assistant", content: errMsg, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/20">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chat History</h2>
            <p className="text-xs text-muted-foreground/70 mt-1">{sessions.length} sessions</p>
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
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 px-3 py-4">
          {sessions.map(session => (
            <div
              key={session.sessionId}
              onClick={() => setSessionId(session.sessionId)}
              className={cn(
                "group relative w-full text-left p-3 rounded-lg transition-all duration-200 cursor-pointer border border-transparent",
                session.sessionId === sessionId ? "bg-primary/15 border-primary/30 shadow-sm" : "hover:bg-muted/30"
              )}
            >
              <div className="flex items-start gap-3">
                <MessageSquare className={cn("w-4 h-4 mt-0.5 shrink-0", session.sessionId === sessionId ? "text-primary" : "text-muted-foreground/60")} />
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{session.messages[0]?.content || "New Session"}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}</p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 h-8 w-8"
                onClick={e => handleDeleteSession(e, session.sessionId)}
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  if (!mounted || isLoading) {
    return (
      <main className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Creating your safe space...</p>
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
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 hover:bg-muted">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 bg-background">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-base md:text-lg font-semibold flex items-center gap-2 leading-tight">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Therapy Assistant
              </h1>
              <p className="text-xs text-muted-foreground">Here to support your well-being</p>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:flex text-xs font-normal">Encrypted</Badge>
        </header>

        <ScrollArea className="flex-1">
          <section className="flex flex-col px-4 md:px-6 py-6 max-w-4xl mx-auto w-full">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold">How are you feeling today?</h2>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.article
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn("flex w-full my-3", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className={cn("flex gap-3 max-w-[85%] md:max-w-[70%] items-end", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ring-1 ring-offset-1 ring-offset-background",
                      msg.role === "user" ? "bg-primary ring-primary text-primary-foreground" : "bg-muted ring-border text-muted-foreground"
                    )}>
                      {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                      <div className={cn(
                        "px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed",
                        msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/60 border border-border/50 rounded-tl-none"
                      )}>
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:m-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>

                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSpeech(msg.content, idx)}
                            className={cn(
                              "h-7 px-2 text-muted-foreground hover:text-primary transition-all text-xs",
                              isSpeaking === idx && "text-primary bg-primary/10"
                            )}
                          >
                            {isSpeaking === idx ? <VolumeX className="w-3.5 h-3.5 mr-1" /> : <Volume2 className="w-3.5 h-3.5 mr-1" />}
                            <span className="uppercase font-bold tracking-tight">
                              {isSpeaking === idx ? "Stop" : "Listen"}
                            </span>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                <Settings2 className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuLabel className="text-xs">Voice Selection</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <ScrollArea className="h-48">
                                {availableVoices.map((voice) => (
                                  <DropdownMenuItem 
                                    key={voice.name} 
                                    onClick={() => setSelectedVoiceName(voice.name)}
                                    className={cn("text-xs", selectedVoiceName === voice.name && "bg-primary/10 text-primary")}
                                  >
                                    {voice.name}
                                  </DropdownMenuItem>
                                ))}
                              </ScrollArea>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex gap-3 items-center my-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border ring-1 ring-border animate-pulse shadow-sm">
                  <Bot size={16} className="text-muted-foreground" />
                </div>
                <div className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </section>
        </ScrollArea>

        <footer className="border-t border-border/50 bg-background p-4 space-y-3">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className={cn(
              "relative flex items-end gap-2 bg-muted/40 rounded-2xl border border-border/50 px-4 py-2 transition-all focus-within:ring-1 focus-within:ring-primary/30",
              isCooldown && "opacity-60"
            )}>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSubmit(e as any))}
                placeholder={isCooldown ? "Processing..." : "Share what's on your mind..."}
                disabled={isCooldown}
                className="flex-1 bg-transparent border-0 focus:ring-0 py-2 text-sm max-h-40 resize-none leading-relaxed"
              />
              <Button
                type="submit"
                disabled={!message.trim() || isTyping || isCooldown}
                onClick={handleSubmit}
                className="h-9 px-4 shrink-0 rounded-lg shadow-sm"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 isCooldown ? <span className="text-xs font-mono">{cooldownTime}s</span> : 
                 <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-center text-[10px] md:text-xs text-muted-foreground/80">
              {isCooldown ? "Allowing a moment for reflection..." : "Your safety is important. In emergencies, contact local services."}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}