"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/contexts/session-context"
import { format, startOfDay, endOfDay } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/ui/container"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Icons
import {
  Activity,
  ArrowRight,
  Brain,
  Calendar,
  Clock,
  Heart,
  Loader2,
  MessageSquare,
  Sparkles,
  Quote as QuoteIcon,
  Zap,
  TrendingUp,
  RefreshCw,
  PhoneCall
} from "lucide-react"

// Feature Components
import { AnxietyGames } from "@/components/games/anxiety-games"
import { MoodForm } from "@/components/mood/mood-form"
import { ActivityLogger } from "@/components/activities/activity-logger"

// API
import { getActivities } from "@/lib/api/activity"
import { getMoodHistory } from "@/lib/api/mood"
import { getAllChatSessions } from "@/lib/api/chat"
import { getLatestRecommendation } from "@/lib/api/recommendation"
import { getUserStats } from "@/lib/api/user"

/* ---------------- Quotes Data ---------------- */
const supportiveQuotes = [
  { text: "You are stronger than you think, braver than you believe, and more capable than you imagine.", author: "A.A. Milne" },
  { text: "Healing is not linear. Some days will be harder than others, and that's okay.", author: "Unknown" },
  { text: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.", author: "Unknown" },
  { text: "It's okay to not be okay. What matters is that you're taking steps to feel better.", author: "Unknown" },
  { text: "Small steps in the right direction can turn out to be the biggest steps of your life.", author: "Unknown" },
  { text: "Be patient with yourself. Growth takes time, and healing takes courage.", author: "Unknown" },
  { text: "Every day may not be good, but there is something good in every day.", author: "Alice Morse Earle" },
]

export default function DashboardPage() {

  const router = useRouter()

  const handleSettings = () => {
    router.push("/settings")
  }
  const { user } = useSession()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [dailyQuote, setDailyQuote] = useState(supportiveQuotes[0])

  const [showMoodModal, setShowMoodModal] = useState(false)
  const [showActivityLogger, setShowActivityLogger] = useState(false)

  // Stats State
  const [moodScore, setMoodScore] = useState(0)
  const [todayActivities, setTodayActivities] = useState(0)
  const [todayTherapySessions, setTodayTherapySessions] = useState(0)
  const [streak, setStreak] = useState(0) // Initialize to 0 instead of mock 7
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [showCrisisModal, setShowCrisisModal] = useState(false)

  /* ---------------- Core Sync ---------------- */
  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsLoadingStats(true)
      const today = new Date()
      const dayStart = startOfDay(today)
      const dayEnd = endOfDay(today)

      // Parallel fetching for speed
      const [moods, activities, sessions, recommendation, userStats] = await Promise.all([
        getMoodHistory({ startDate: dayStart.toISOString(), endDate: dayEnd.toISOString() }),
        getActivities(),
        getAllChatSessions(),
        getLatestRecommendation("daily_insight"),
        getUserStats()
      ])

      if (recommendation.success && recommendation.data) {
        setAiInsight(recommendation.data.content)
      }

      if (userStats.success && userStats.data) {
        setStreak(userStats.data.streak)
      }

      // Process Mood & Crisis Detection
      if (moods.success && moods.data.length) {
        const avg = Math.round(
          moods.data.reduce((s: number, m: any) => s + (m.score || 0), 0) / moods.data.length
        )
        setMoodScore(avg)

        // Crisis Detection: Last 3 moods < 30
        const recentMoods = moods.data.slice(0, 3);
        const isCrisis = recentMoods.length >= 3 && recentMoods.every((m: any) => m.score < 30);

        // Simple check to avoid spamming
        if (isCrisis && !sessionStorage.getItem("crisis_shown")) {
          setShowCrisisModal(true);
          sessionStorage.setItem("crisis_shown", "true");
        }

        // Feature 4: Daily Mood Check
        // Check if there is a mood for today
        const hasLogToday = moods.data.some((m: any) => {
          const d = new Date(m.timestamp);
          return d >= dayStart && d <= dayEnd;
        });

        if (!hasLogToday && !sessionStorage.getItem("daily_check_skipped")) {
          // Small delay to let UI load
          setTimeout(() => setShowMoodModal(true), 1500);
        }

      } else {
        setMoodScore(0)
        // If no moods at all, definitely prompt
        if (!sessionStorage.getItem("daily_check_skipped")) {
          setTimeout(() => setShowMoodModal(true), 1500);
        }
      }

      // Process Activities
      if (activities.success) {
        const count = activities.data.filter((a: any) => {
          const d = new Date(a.timestamp)
          return d >= dayStart && d <= dayEnd
        }).length
        setTodayActivities(count)
      }

      // Process Sessions
      if (Array.isArray(sessions)) {
        const count = sessions.filter((s: any) => {
          const d = new Date(s.createdAt)
          return d >= dayStart && d <= dayEnd
        }).length
        setTodayTherapySessions(count)
      }

      setIsLoadingStats(false)
    } catch (e) {
      console.error(e)
      setIsLoadingStats(false)
    }
  }, [])

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const day = new Date().getDate()
    setDailyQuote(supportiveQuotes[day % supportiveQuotes.length])
    fetchDashboardStats()
    return () => clearInterval(timer)
  }, [fetchDashboardStats])

  /* ---------------- UI Config ---------------- */
  const wellnessStats = [
    {
      title: "Mood Score",
      value: moodScore ? `${moodScore}%` : "—",
      icon: Brain,
      color: "text-purple-500",
      bgClass: "bg-purple-500/10 border-purple-500/20",
      description: "Daily Average",
      trend: "+2%",
      showProgress: true,
      progressValue: moodScore,
    },
    {
      title: "Streak",
      value: `${streak} Days`,
      icon: Zap,
      color: "text-amber-500",
      bgClass: "bg-amber-500/10 border-amber-500/20",
      description: "Consistency",
      trend: "+1 day",
    },
    {
      title: "Sessions",
      value: `${todayTherapySessions}`,
      icon: Heart,
      color: "text-rose-500",
      bgClass: "bg-rose-500/10 border-rose-500/20",
      description: "Therapy Chats",
      trend: todayTherapySessions > 0 ? "Great job" : "Start one",
    },
    {
      title: "Activities",
      value: `${todayActivities}`,
      icon: Activity,
      color: "text-blue-500",
      bgClass: "bg-blue-500/10 border-blue-500/20",
      description: "Logged Actions",
      trend: todayActivities > 0 ? "Active" : "Log now",
    },
  ]

  const quickActions = [
    {
      title: "Track Mood",
      description: "Check-in with yourself",
      icon: Heart,
      iconColor: "text-rose-500",
      bgGradient: "hover:bg-rose-500/5",
      onClick: () => setShowMoodModal(true),
    },
    {
      title: "Log Activity",
      description: "Record your progress",
      icon: Activity,
      iconColor: "text-blue-500",
      bgGradient: "hover:bg-blue-500/5",
      onClick: () => setShowActivityLogger(true),
    },
    {
      title: "AI Therapy",
      description: "Chat with MindEase",
      icon: MessageSquare,
      iconColor: "text-white",
      bgGradient: "bg-gradient-to-br from-primary to-primary/80 text-white hover:shadow-lg hover:shadow-primary/20",
      isPrimary: true,
      onClick: () => router.push("/therapy/new"),
    },
    {
      title: "Emergency Aid",
      description: "Get immediate help",
      icon: PhoneCall,
      iconColor: "text-rose-500",
      bgGradient: "hover:bg-rose-500/5",
      onClick: () => router.push("/resources"),
    },
    {
      title: "Wellbeing Reports",
      description: "View AI reflections",
      icon: Sparkles,
      iconColor: "text-amber-500",
      bgGradient: "hover:bg-amber-500/5",
      onClick: () => router.push("/reflections"),
    },
  ]

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <Container className="relative z-10 pt-8 pb-12 space-y-8 md:space-y-12">

        {/* 1. Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{format(currentTime, "EEEE, MMMM do")}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{format(currentTime, "h:mm a")}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Good {parseInt(format(currentTime, "H")) < 12 ? "Morning" : parseInt(format(currentTime, "H")) < 17 ? "Afternoon" : "Evening"}, <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {user?.name || "Friend"}
              </span>
            </h1>
          </div>

          {isLoadingStats && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 border border-border/50 backdrop-blur-md shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Syncing...</span>
            </div>
          )}
        </motion.div>

        {/* 2. Daily Insight (Quote) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative group rounded-[2.5rem] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="relative p-8 md:p-10 border border-primary/10 backdrop-blur-sm bg-card/30">
            <div className="absolute top-6 right-8 opacity-20">
              <QuoteIcon className="w-16 h-16 text-primary rotate-12" />
            </div>
            <div className="max-w-2xl relative z-10">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {aiInsight ? "AI Insight" : "Daily Insight"}
              </h3>
              <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-foreground/90 mb-4">
                "{aiInsight || dailyQuote.text}"
              </p>
              <p className="text-sm font-medium text-muted-foreground border-l-2 border-primary/30 pl-3">
                {aiInsight ? "MindEase AI" : dailyQuote.author}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3. Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" /> Overview
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/stories")}>
                Read Stories
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/history")}>
                View History
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchDashboardStats}
                className="h-8 w-8 rounded-full p-0 hover:bg-muted"
              >
                <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoadingStats && "animate-spin")} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {wellnessStats.map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-card/40 rounded-[2rem] shadow-sm backdrop-blur-md transition-all group-hover:shadow-md group-hover:bg-card/60" />
                <div className={cn("absolute inset-0 border rounded-[2rem] opacity-50 transition-colors", stat.bgClass.split(' ')[1])} />

                <div className="relative p-6 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2.5 rounded-2xl", stat.bgClass.split(' ')[0])}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    {stat.trend && (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full border bg-background/50 backdrop-blur-sm",
                        stat.color
                      )}>
                        {stat.trend}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-1">{stat.value}</h3>
                    <p className="text-xs font-medium text-muted-foreground">{stat.description}</p>

                    {stat.showProgress && (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                          <span>Progress</span>
                          <span>{stat.progressValue}%</span>
                        </div>
                        <Progress value={stat.progressValue} className="h-1.5 bg-muted/50" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 4. Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, idx) => (
              <button
                key={action.title}
                onClick={action.onClick}
                className={cn(
                  "relative group overflow-hidden rounded-[2rem] p-6 text-left transition-all duration-300",
                  action.isPrimary
                    ? "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1"
                    : "bg-card/40 border border-border/50 hover:bg-card/60 hover:border-primary/20 backdrop-blur-md"
                )}
              >
                <div className={cn("absolute inset-0 transition-colors duration-300", action.bgGradient)} />

                <div className="relative z-10 flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    action.isPrimary ? "bg-white/20" : "bg-muted/50"
                  )}>
                    <action.icon className={cn("w-6 h-6", action.iconColor)} />
                  </div>
                  <div>
                    <h4 className={cn("font-bold text-lg", action.isPrimary ? "text-white" : "text-foreground")}>
                      {action.title}
                    </h4>
                    <p className={cn("text-xs", action.isPrimary ? "text-white/80" : "text-muted-foreground")}>
                      {action.description}
                    </p>
                  </div>
                  <div className={cn(
                    "ml-auto transition-transform duration-300 group-hover:translate-x-1",
                    action.isPrimary ? "text-white" : "text-muted-foreground"
                  )}>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 5. Anxiety Games Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <AnxietyGames />
        </motion.div>

      </Container>

      {/* Modals */}
      <Dialog open={showMoodModal} onOpenChange={(open) => {
        setShowMoodModal(open);
        if (!open) {
          sessionStorage.setItem("daily_check_skipped", "true");
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-[2rem] bg-card/95 backdrop-blur-xl border-primary/10">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-rose-500" />
            </div>
            <DialogTitle className="text-center text-xl">Track Your Mood</DialogTitle>
            <DialogDescription className="text-center">
              Taking a moment to reflect helps build emotional awareness.
            </DialogDescription>
          </DialogHeader>
          <MoodForm
            onSuccess={() => {
              setShowMoodModal(false)
              fetchDashboardStats()
            }}
          />
        </DialogContent>
      </Dialog>

      <ActivityLogger
        open={showActivityLogger}
        onOpenChange={setShowActivityLogger}
        onSuccess={() => {
          setShowActivityLogger(false)
          fetchDashboardStats()
        }}
      />

      {/* Crisis Modal */}
      <Dialog open={showCrisisModal} onOpenChange={setShowCrisisModal}>
        <DialogContent className="sm:max-w-md rounded-[2rem] bg-card/95 backdrop-blur-xl border-rose-500/20">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-rose-500" />
            </div>
            <DialogTitle className="text-center text-xl">We noticed you've been feeling low</DialogTitle>
            <DialogDescription className="text-center pt-2">
              It takes strength to face these feelings. You don't have to go through this alone.
              Would you like to explore some support resources?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white" onClick={() => router.push("/resources")}>
              View Resources
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setShowCrisisModal(false)}>
              I'm okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
