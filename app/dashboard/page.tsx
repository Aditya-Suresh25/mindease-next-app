"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/contexts/session-context"
import { format, startOfDay, endOfDay, subDays } from "date-fns"
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
  MessageSquare,
  Sparkles,
  Zap,
  TrendingUp,
  RefreshCw,
  PhoneCall
} from "lucide-react"

// Feature Components
import { AnxietyGames } from "@/components/games/anxiety-games"
import { MoodForm } from "@/components/mood/mood-form"
import { ActivityLogger } from "@/components/activities/activity-logger"
import { AllActivities } from "@/components/activities/all-activities"
import { DailyQuote } from "@/components/quote/daily-quote"

// Charts
import {
  MoodTrendsChart,
  MoodDistributionChart,
  ActivityEngagementChart,
  CheckInRhythm,
} from "@/components/charts"

// Loader
import { SoothingLoader, SoothingDots } from "@/components/ui/soothing-loader"

// API
import { getActivities } from "@/lib/api/activity"
import { getMoodHistory } from "@/lib/api/mood"
import { getAllChatSessions } from "@/lib/api/chat"
import { getLatestRecommendation } from "@/lib/api/recommendation"
import { getUserStats } from "@/lib/api/user"

export default function DashboardPage() {

  const router = useRouter()

  const handleSettings = () => {
    router.push("/settings")
  }
  const { user } = useSession()

  const [currentTime, setCurrentTime] = useState(new Date())

  const [showMoodModal, setShowMoodModal] = useState(false)
  const [showActivityLogger, setShowActivityLogger] = useState(false)
  const [showAllActivities, setShowAllActivities] = useState(false)
  
  // Navigation loading states for slow actions
  const [isNavigatingToTherapy, setIsNavigatingToTherapy] = useState(false)
  const [isNavigatingToReflections, setIsNavigatingToReflections] = useState(false)

  // Stats State
  const [moodScore, setMoodScore] = useState(0)
  const [todayActivities, setTodayActivities] = useState(0)
  const [todayTherapySessions, setTodayTherapySessions] = useState(0)
  const [streak, setStreak] = useState(0) // Initialize to 0 instead of mock 7
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [showCrisisModal, setShowCrisisModal] = useState(false)

  // Historical data for visualizations
  const [moodHistory, setMoodHistory] = useState<any[]>([])
  const [activityHistory, setActivityHistory] = useState<any[]>([])
  const [isLoadingCharts, setIsLoadingCharts] = useState(true)

  /* ---------------- Core Sync ---------------- */
  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsLoadingStats(true)
      setIsLoadingCharts(true)
      const today = new Date()
      const dayStart = startOfDay(today)
      const dayEnd = endOfDay(today)
      
      // Extended range for charts (30 days for rhythm, 14 for trends)
      const extendedStart = startOfDay(subDays(today, 30))

      // Parallel fetching for speed
      const [todayMoods, extendedMoods, activities, sessions, recommendation, userStats] = await Promise.all([
        getMoodHistory({ startDate: dayStart.toISOString(), endDate: dayEnd.toISOString() }),
        getMoodHistory({ startDate: extendedStart.toISOString(), endDate: dayEnd.toISOString() }),
        getActivities(),
        getAllChatSessions(),
        getLatestRecommendation("daily_insight"),
        getUserStats()
      ])
      
      // Store historical data for charts
      if (extendedMoods.success && extendedMoods.data) {
        setMoodHistory(extendedMoods.data)
      }
      
      if (activities.success && activities.data) {
        setActivityHistory(activities.data)
      }
      
      setIsLoadingCharts(false)
      
      // Use todayMoods for today's stats
      const moods = todayMoods

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
      setIsLoadingCharts(false)
    }
  }, [])

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    fetchDashboardStats()
    return () => clearInterval(timer)
  }, [fetchDashboardStats])

  /* ---------------- UI Config ---------------- */
  const wellnessStats = [
    {
      title: "Mood Score",
      value: moodScore ? `${moodScore}%` : "—",
      icon: Brain,
      color: "text-violet-500 dark:text-violet-400",
      gradientFrom: "from-violet-500/25",
      gradientTo: "to-purple-500/15",
      borderColor: "border-violet-500/25 dark:border-violet-400/35",
      iconBg: "bg-violet-500/20 dark:bg-violet-500/30",
      description: "Daily Average",
      trend: "+2%",
      showProgress: true,
      progressValue: moodScore,
    },
    {
      title: "Streak",
      value: `${streak} Days`,
      icon: Zap,
      color: "text-amber-500 dark:text-amber-400",
      gradientFrom: "from-amber-500/25",
      gradientTo: "to-orange-500/15",
      borderColor: "border-amber-500/25 dark:border-amber-400/35",
      iconBg: "bg-amber-500/20 dark:bg-amber-500/30",
      description: "Consistency",
      trend: "+1 day",
    },
    {
      title: "Sessions",
      value: `${todayTherapySessions}`,
      icon: Heart,
      color: "text-rose-500 dark:text-rose-400",
      gradientFrom: "from-rose-500/25",
      gradientTo: "to-pink-500/15",
      borderColor: "border-rose-500/25 dark:border-rose-400/35",
      iconBg: "bg-rose-500/20 dark:bg-rose-500/30",
      description: "Therapy Chats",
      trend: todayTherapySessions > 0 ? "Great job" : "Start one",
    },
    {
      title: "Activities",
      value: `${todayActivities}`,
      icon: Activity,
      color: "text-teal-500 dark:text-teal-400",
      gradientFrom: "from-teal-500/25",
      gradientTo: "to-cyan-500/15",
      borderColor: "border-teal-500/25 dark:border-teal-400/35",
      iconBg: "bg-teal-500/20 dark:bg-teal-500/30",
      description: "Logged Actions",
      trend: todayActivities > 0 ? "Active" : "Log now",
    },
  ]

  const quickActions = [
    {
      title: "Track Mood",
      description: "Check-in with yourself",
      icon: Heart,
      iconColor: "text-rose-500 dark:text-rose-400",
      gradientFrom: "from-rose-500/15",
      gradientTo: "to-pink-500/10",
      hoverGradient: "hover:from-rose-500/25 hover:to-pink-500/15",
      borderColor: "border-rose-300/60 dark:border-rose-500/35",
      iconBg: "bg-rose-100 dark:bg-rose-500/30",
      onClick: () => setShowMoodModal(true),
    },
    {
      title: "Log Activity",
      description: "Record your progress",
      icon: Activity,
      iconColor: "text-teal-500 dark:text-teal-400",
      gradientFrom: "from-teal-500/15",
      gradientTo: "to-cyan-500/10",
      hoverGradient: "hover:from-teal-500/25 hover:to-cyan-500/15",
      borderColor: "border-teal-300/60 dark:border-teal-500/35",
      iconBg: "bg-teal-100 dark:bg-teal-500/30",
      onClick: () => setShowActivityLogger(true),
    },
    {
      title: "AI Therapy",
      description: "Chat with MindEase",
      icon: MessageSquare,
      iconColor: "text-white",
      isPrimary: true,
      isLoading: isNavigatingToTherapy,
      loadingMessage: "Preparing your safe space…",
      onClick: () => {
        setIsNavigatingToTherapy(true)
        router.push("/therapy/new")
      },
    },
    {
      title: "Emergency Aid",
      description: "Get immediate help",
      icon: PhoneCall,
      iconColor: "text-orange-500 dark:text-orange-400",
      gradientFrom: "from-orange-500/15",
      gradientTo: "to-amber-500/10",
      hoverGradient: "hover:from-orange-500/25 hover:to-amber-500/15",
      borderColor: "border-orange-300/60 dark:border-orange-500/35",
      iconBg: "bg-orange-100 dark:bg-orange-500/30",
      onClick: () => router.push("/resources"),
    },
    {
      title: "Wellbeing Reports",
      description: "View AI reflections",
      icon: Sparkles,
      iconColor: "text-violet-500 dark:text-violet-400",
      gradientFrom: "from-violet-500/15",
      gradientTo: "to-purple-500/10",
      hoverGradient: "hover:from-violet-500/25 hover:to-purple-500/15",
      borderColor: "border-violet-300/60 dark:border-violet-500/35",
      iconBg: "bg-violet-100 dark:bg-violet-500/30",
      isLoading: isNavigatingToReflections,
      loadingMessage: "Gathering your insights…",
      onClick: () => {
        setIsNavigatingToReflections(true)
        router.push("/reflections")
      },
    },
  ]

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 dark:to-primary/10 relative overflow-hidden">

      {/* Ambient Background - Softer, more calming */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-teal-400/8 to-cyan-400/5 dark:from-teal-500/10 dark:to-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-bl from-violet-400/8 to-purple-400/5 dark:from-violet-500/10 dark:to-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-tr from-rose-400/6 to-pink-400/4 dark:from-rose-500/8 dark:to-pink-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[30%] right-[10%] w-[400px] h-[400px] bg-gradient-to-tl from-amber-400/6 to-orange-400/4 dark:from-amber-500/8 dark:to-orange-500/5 rounded-full blur-[100px]" />
      </div>

      <Container className="relative z-10 pt-8 pb-12 space-y-10 md:space-y-14">

        {/* 1. Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-teal-500/10 dark:from-primary/15 dark:to-teal-500/15 border border-primary/20 dark:border-primary/30 backdrop-blur-sm shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground/80">{format(currentTime, "EEEE, MMMM do")}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 border border-violet-500/20 dark:border-violet-500/30 backdrop-blur-sm shadow-sm">
                <Clock className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                <span className="text-xs font-medium text-foreground/80">{format(currentTime, "h:mm a")}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Good {parseInt(format(currentTime, "H")) < 12 ? "Morning" : parseInt(format(currentTime, "H")) < 17 ? "Afternoon" : "Evening"}, <br />
              <span className="bg-gradient-to-r from-primary via-teal-500 to-cyan-500 dark:from-primary dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {user?.name || "Friend"}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              Take a moment to check in with yourself. Your wellbeing matters. 💚
            </p>
          </div>

          {isLoadingStats && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-teal-500/10 border border-primary/20 backdrop-blur-md shadow-sm">
              <SoothingDots />
              <span className="text-xs font-medium text-foreground/70">Preparing your space…</span>
            </div>
          )}
        </motion.div>


        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <DailyQuote 
            isAuthenticated={!!user} 
            variant="card"
          />
        </motion.div>

        {/* 3. Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-lg font-semibold flex items-center gap-2.5 text-foreground">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-teal-500/20 dark:from-primary/30 dark:to-teal-500/30">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              Today's Overview
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/stories")}
                className="rounded-xl border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-foreground/80 hover:text-foreground transition-all"
              >
                Read Stories
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/history")}
                className="rounded-xl border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/5 text-foreground/80 hover:text-foreground transition-all"
              >
                View History
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchDashboardStats}
                className="h-9 w-9 rounded-xl p-0 hover:bg-primary/10 transition-all"
              >
                <RefreshCw className={cn("w-4 h-4 text-primary", isLoadingStats && "animate-spin")} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {wellnessStats.map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="group relative"
              >
                {/* Card background with gradient */}
                <div className={cn(
                  "absolute inset-0 rounded-3xl transition-all duration-300",
                  "bg-gradient-to-br",
                  stat.gradientFrom,
                  stat.gradientTo,
                  "dark:opacity-90"
                )} />
                <div className={cn(
                  "absolute inset-0 rounded-3xl",
                  "bg-white/80 dark:bg-gray-800/70",
                  "border",
                  stat.borderColor,
                  "shadow-sm group-hover:shadow-md transition-all duration-300"
                )} />

                <div className="relative p-6 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110",
                      stat.iconBg
                    )}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    {stat.trend && (
                      <span className={cn(
                        "text-[10px] font-semibold px-2.5 py-1 rounded-full",
                        "bg-white dark:bg-gray-700",
                        "border border-current/30",
                        "shadow-sm",
                        stat.color
                      )}>
                        {stat.trend}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-1 text-foreground">{stat.value}</h3>
                    <p className="text-xs font-medium text-muted-foreground">{stat.description}</p>

                    {stat.showProgress && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                          <span>Progress</span>
                          <span>{stat.progressValue}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/50 dark:bg-gray-800/50 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              "bg-gradient-to-r from-violet-500 to-purple-500"
                            )}
                            style={{ width: `${stat.progressValue}%` }}
                          />
                        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
            {quickActions.map((action, idx) => (
              <button
                key={action.title}
                onClick={action.onClick}
                disabled={action.isLoading}
                className={cn(
                  "relative group overflow-hidden rounded-2xl p-5 text-left transition-all duration-300",
                  action.isLoading && "pointer-events-none",
                  action.isPrimary
                    ? "col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary via-teal-500 to-cyan-500 dark:from-primary dark:via-teal-400 dark:to-cyan-500 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 hover:scale-[1.02]"
                    : cn(
                        "bg-white/80 dark:bg-gray-800/70",
                        "border",
                        action.borderColor,
                        "hover:bg-white dark:hover:bg-gray-800/90",
                        "hover:shadow-md hover:-translate-y-0.5 transition-all"
                      )
                )}
              >
                {/* Loading overlay */}
                {action.isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 backdrop-blur-sm rounded-2xl",
                      action.isPrimary 
                        ? "bg-primary/20" 
                        : "bg-white/60 dark:bg-gray-800/60"
                    )}
                  >
                    <SoothingDots size="md" />
                    <span className={cn(
                      "text-xs font-medium",
                      action.isPrimary ? "text-white" : "text-muted-foreground"
                    )}>
                      {action.loadingMessage || "Loading…"}
                    </span>
                  </motion.div>
                )}
                
                {/* Subtle gradient overlay for non-primary buttons */}
                {!action.isPrimary && (
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-30 dark:opacity-40 rounded-2xl",
                    action.gradientFrom,
                    action.gradientTo
                  )} />
                )}

                <div className="relative z-10 flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110",
                    action.isPrimary 
                      ? "bg-white/25 shadow-inner" 
                      : cn(action.iconBg, "border border-current/10")
                  )}>
                    <action.icon className={cn("w-6 h-6", action.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-bold text-base md:text-lg truncate",
                      action.isPrimary ? "text-white" : "text-foreground"
                    )}>
                      {action.title}
                    </h4>
                    <p className={cn(
                      "text-xs truncate",
                      action.isPrimary ? "text-white/90" : "text-muted-foreground"
                    )}>
                      {action.description}
                    </p>
                  </div>
                  <div className={cn(
                    "transition-transform duration-300 group-hover:translate-x-1",
                    action.isPrimary ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Shine effect on primary button */}
                {action.isPrimary && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 5. Wellness Insights - Data Visualizations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-lg font-semibold flex items-center gap-2.5 text-foreground">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/30 dark:to-purple-500/30">
                <Sparkles className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              </div>
              Your Wellness Insights
            </h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Patterns over time — not scores, just reflections
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            {/* Mood Trends Chart */}
            <MoodTrendsChart
              data={moodHistory}
              isLoading={isLoadingCharts}
            />

            {/* Mood Distribution */}
            <MoodDistributionChart
              data={moodHistory}
              isLoading={isLoadingCharts}
            />

            {/* Activity Engagement */}
            <ActivityEngagementChart
              data={activityHistory}
              isLoading={isLoadingCharts}
            />

            {/* Check-in Rhythm */}
            <CheckInRhythm
              moodData={moodHistory}
              isLoading={isLoadingCharts}
            />
          </div>
        </motion.div>

        {/* 6. Anxiety Games Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="pt-4"
        >
          <AnxietyGames onViewAllActivities={() => setShowAllActivities(true)} />
        </motion.div>

      </Container>

      {/* Modals */}
      <Dialog open={showMoodModal} onOpenChange={(open) => {
        setShowMoodModal(open);
        if (!open) {
          sessionStorage.setItem("daily_check_skipped", "true");
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-gradient-to-b from-white to-rose-50/50 dark:from-gray-900 dark:to-rose-950/30 backdrop-blur-xl border-rose-200/50 dark:border-rose-500/20 shadow-xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-foreground">How are you feeling?</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Taking a moment to reflect helps build emotional awareness and self-compassion.
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

      <AllActivities
        open={showAllActivities}
        onOpenChange={setShowAllActivities}
      />

      {/* Crisis Modal */}
      <Dialog open={showCrisisModal} onOpenChange={setShowCrisisModal}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-gradient-to-b from-white to-rose-50/50 dark:from-gray-900 dark:to-rose-950/30 backdrop-blur-xl border-rose-300/50 dark:border-rose-500/30 shadow-xl">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30 mb-3">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-foreground">We're here for you</DialogTitle>
            <DialogDescription className="text-center pt-2 text-muted-foreground leading-relaxed">
              We noticed you've been feeling low lately. It takes courage to acknowledge these feelings. 
              You don't have to face this alone — support is available.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25 rounded-xl py-5 font-semibold transition-all hover:shadow-xl" 
              onClick={() => router.push("/resources")}
            >
              View Support Resources
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl py-5" 
              onClick={() => setShowCrisisModal(false)}
            >
              I'm okay for now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
