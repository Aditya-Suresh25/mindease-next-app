"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  Brain,
  BrainCircuit,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  Loader2,
  MessageSquare,
  Sparkles,
  Trophy,
  Quote as QuoteIcon,
  TrendingUp,
  Zap,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { format, startOfDay, endOfDay } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AnxietyGames } from "@/components/games/anxiety-games"
import { MoodForm } from "@/components/mood/mood-form"
import { ActivityLogger } from "@/components/activities/activity-logger"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/contexts/session-context"
import { getActivities } from "@/lib/api/activity"
import { getMoodHistory } from "@/lib/api/mood"
import { getAllChatSessions } from "@/lib/api/chat"

/* ---------------- Quotes ---------------- */

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
  const { user } = useSession()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [dailyQuote, setDailyQuote] = useState(supportiveQuotes[0])

  const [showMoodModal, setShowMoodModal] = useState(false)
  const [showActivityLogger, setShowActivityLogger] = useState(false)

  const [moodScore, setMoodScore] = useState(0)
  const [todayActivities, setTodayActivities] = useState(0)
  const [todayTherapySessions, setTodayTherapySessions] = useState(0)
  const [streak, setStreak] = useState(7) // Example streak value
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  /* ---------------- Core Sync ---------------- */

  const fetchDashboardStats = useCallback(async () => {
    try {
      setIsLoadingStats(true)

      const today = new Date()
      const dayStart = startOfDay(today)
      const dayEnd = endOfDay(today)

      const moods = await getMoodHistory({
        startDate: dayStart.toISOString(),
        endDate: dayEnd.toISOString(),
      })

      if (moods.success && moods.data.length) {
        const avg = Math.round(
          moods.data.reduce((s: number, m: any) => s + (m.score || 0), 0) /
            moods.data.length
        )
        setMoodScore(avg)
      } else {
        setMoodScore(0)
      }

      const activities = await getActivities()
      if (activities.success) {
        const count = activities.data.filter((a: any) => {
          const d = new Date(a.timestamp)
          return d >= dayStart && d <= dayEnd
        }).length
        setTodayActivities(count)
      }

      const sessions = await getAllChatSessions()
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

  /* ---------------- UI Data ---------------- */

  const wellnessStats = [
    {
      title: "Mood Score",
      value: moodScore ? `${moodScore}%` : "—",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-purple-600/5",
      borderColor: "border-purple-500/20",
      description: "Today's average",
      trend: "+2%",
      showProgress: true,
      progressValue: moodScore,
    },
    {
      title: "Activity Streak",
      value: `${streak} days`,
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-gradient-to-br from-yellow-500/10 to-yellow-600/5",
      borderColor: "border-yellow-500/20",
      description: "Keep going!",
      trend: "+1 day",
    },
    {
      title: "Therapy Sessions",
      value: `${todayTherapySessions}`,
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-gradient-to-br from-rose-500/10 to-rose-600/5",
      borderColor: "border-rose-500/20",
      description: "Completed today",
      trend: todayTherapySessions > 0 ? "Active" : "Start one",
    },
    {
      title: "Activities Logged",
      value: `${todayActivities}`,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
      borderColor: "border-blue-500/20",
      description: "Wellness activities",
      trend: todayActivities > 0 ? "Good job!" : "Log one",
    },
  ]

  const quickActions = [
    {
      title: "Track Mood",
      description: "How are you feeling right now?",
      icon: Heart,
      iconColor: "text-rose-500",
      bgColor: "hover:bg-rose-500/10 hover:border-rose-500/30",
      onClick: () => setShowMoodModal(true),
    },
    {
      title: "Log Activity",
      description: "Meditation, walk, therapy",
      icon: Activity,
      iconColor: "text-blue-500",
      bgColor: "hover:bg-blue-500/10 hover:border-blue-500/30",
      onClick: () => setShowActivityLogger(true),
    },
    {
      title: "Start Chat",
      description: "Talk with your AI companion",
      icon: MessageSquare,
      iconColor: "text-emerald-500",
      bgColor: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 hover:shadow-lg",
      buttonVariant: "default" as const,
      onClick: () => router.push("/therapy/new"),
    },
  ]

  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Container className="pt-6 pb-8 space-y-6 md:space-y-8">
        {/* Header with Time & Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                  <Clock className="h-3 w-3" />
                  {format(currentTime, "hh:mm a")}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                  <Calendar className="h-3 w-3" />
                  {format(currentTime, "EEE, MMM d")}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Welcome back,{" "}
                <span className="text-primary">{user?.name || "User"}</span>!
              </h1>
              <p className="text-muted-foreground">
                Ready for another day of growth and self-care?
              </p>
            </div>
            {isLoadingStats && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating stats...
              </div>
            )}
          </div>
        </motion.div>

        {/* Daily Quote Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
            <CardContent className="p-6 relative">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <QuoteIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium italic leading-relaxed">
                    "{dailyQuote.text}"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    — {dailyQuote.author}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Session Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Session
                  </CardTitle>
                  <CardDescription>
                    Take a moment for your mental wellbeing
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Recommended
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Button
                      variant={action.buttonVariant || "outline"}
                      className={cn(
                        "w-full h-28 flex flex-col items-center justify-center gap-3 p-4 transition-all duration-200",
                        action.bgColor,
                        !action.buttonVariant && "hover:shadow-md"
                      )}
                      onClick={action.onClick}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        !action.buttonVariant && action.iconColor?.replace('text-', 'bg-') + '/10'
                      )}>
                        <action.icon className={cn(
                          "h-6 w-6",
                          action.buttonVariant ? "text-white" : action.iconColor
                        )} />
                      </div>
                      <div className="space-y-1">
                        <span className="font-semibold text-sm">
                          {action.title}
                        </span>
                        <p className="text-xs text-muted-foreground leading-tight">
                          {action.description}
                        </p>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground gap-1"
                  onClick={() => router.push("/therapy")}
                >
                  View all sessions
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Today's Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Today's Overview
                  </CardTitle>
                  <CardDescription>
                    Your progress for {format(new Date(), "MMMM d, yyyy")}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1.5">
                  Daily Summary
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wellnessStats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 * index }}
                  >
                    <Card className={cn(
                      "border h-full transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                      stat.borderColor,
                      stat.bgColor
                    )}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "p-2 rounded-lg",
                                stat.bgColor
                              )}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">
                                {stat.title}
                              </span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight">
                              {stat.value}
                            </p>
                          </div>
                          {stat.trend && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                stat.trend.includes('+') ? "bg-green-500/10 text-green-700 border-green-500/20" :
                                stat.trend.includes('Good') ? "bg-blue-500/10 text-blue-700 border-blue-500/20" :
                                "bg-muted text-muted-foreground"
                              )}
                            >
                              {stat.trend}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          {stat.description}
                        </p>
                        {stat.showProgress && stat.progressValue && (
                          <>
                            <Separator className="my-3" />
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{stat.progressValue}%</span>
                              </div>
                              <Progress value={stat.progressValue} className="h-2" />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs gap-1"
                  onClick={fetchDashboardStats}
                  disabled={isLoadingStats}
                >
                  {isLoadingStats ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      Refresh stats
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Anxiety Games Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <AnxietyGames />
        </motion.div>
      </Container>

      {/* Mood Modal */}
      <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Track Your Mood
            </DialogTitle>
            <DialogDescription>
              How are you feeling right now? Your mood helps us personalize your experience.
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

      {/* Activity Logger */}
      <ActivityLogger
        open={showActivityLogger}
        onOpenChange={setShowActivityLogger}
        onSuccess={() => {
          setShowActivityLogger(false)
          fetchDashboardStats()
        }}
      />
    </div>
  )
}