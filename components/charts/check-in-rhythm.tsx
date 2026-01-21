"use client"

import { useMemo } from "react"
import { format, subDays, parseISO, startOfDay, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarDays, Sparkles, Check } from "lucide-react"

interface MoodEntry {
  _id: string
  score: number
  note?: string
  timestamp: string
}

interface CheckInRhythmProps {
  moodData: MoodEntry[]
  isLoading?: boolean
  className?: string
}

export function CheckInRhythm({
  moodData,
  isLoading = false,
  className,
}: CheckInRhythmProps) {
  // Calculate check-in days for the past 30 days
  const rhythmData = useMemo(() => {
    const days = 30
    const result = []

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      const hasCheckIn = moodData.some((entry) => {
        const entryDate = startOfDay(parseISO(entry.timestamp))
        return entryDate.getTime() === date.getTime()
      })

      result.push({
        date: date.toISOString(),
        displayDate: format(date, "MMM d"),
        dayName: format(date, "EEE"),
        dayNumber: format(date, "d"),
        hasCheckIn,
        isToday: isToday(date),
      })
    }

    return result
  }, [moodData])

  // Stats
  const stats = useMemo(() => {
    const daysWithCheckIn = rhythmData.filter((d) => d.hasCheckIn).length
    const totalDays = rhythmData.length
    const percentage = Math.round((daysWithCheckIn / totalDays) * 100)

    // Calculate current streak (consecutive days from today or yesterday going back)
    let currentStreak = 0
    for (let i = rhythmData.length - 1; i >= 0; i--) {
      // Skip today if no check-in yet (don't break streak for today)
      if (rhythmData[i].isToday && !rhythmData[i].hasCheckIn) {
        continue
      }
      if (rhythmData[i].hasCheckIn) {
        currentStreak++
      } else {
        break
      }
    }

    return { daysWithCheckIn, totalDays, percentage, currentStreak }
  }, [rhythmData])

  const hasAnyCheckIns = stats.daysWithCheckIn > 0

  // Empty state
  if (!hasAnyCheckIns && !isLoading) {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-rose-500/5 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-rose-500/10" />
        <div className="relative p-6 rounded-3xl border border-amber-500/10 dark:border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/30">
              <CalendarDays className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-foreground">Check-in Rhythm</h3>
          </div>

          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-amber-500/60" />
            </div>
            <p className="text-muted-foreground text-sm max-w-[200px]">
              Your check-in rhythm will appear here as you log your mood
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-rose-500/5 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-rose-500/10" />

      <div className="relative p-6 rounded-3xl border border-amber-500/10 dark:border-amber-500/20 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/30">
              <CalendarDays className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Check-in Rhythm</h3>
              <p className="text-xs text-muted-foreground">Past 30 days</p>
            </div>
          </div>

          {/* Current streak badge */}
          {stats.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <span className="text-amber-500 dark:text-amber-400 text-xs font-bold">
                🔥 {stats.currentStreak}
              </span>
              <span className="text-xs text-muted-foreground">
                day{stats.currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-[100px] flex items-center justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-400/20 animate-pulse" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-white/40 to-transparent dark:from-white/20" />
            </div>
          </div>
        ) : (
          <>
            {/* Calendar grid */}
            <div className="grid grid-cols-10 gap-1.5 mb-5">
              {rhythmData.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative aspect-square rounded-lg flex items-center justify-center transition-all",
                    day.hasCheckIn
                      ? "bg-gradient-to-br from-amber-400 to-orange-400 dark:from-amber-500 dark:to-orange-500 shadow-sm"
                      : "bg-muted/50 dark:bg-muted/30",
                    day.isToday && "ring-2 ring-amber-500/50 ring-offset-1 ring-offset-background"
                  )}
                  title={`${day.displayDate}${day.hasCheckIn ? " - Checked in" : ""}`}
                >
                  {day.hasCheckIn && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
              ))}
            </div>

            {/* Summary stats - encouraging, not judgmental */}
            <div className="flex items-center justify-between text-xs pt-4 border-t border-amber-500/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-400 to-orange-400" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{stats.daysWithCheckIn}</span> days you checked in
                </span>
              </div>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {stats.percentage}% this month
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
