"use client"

import { useMemo } from "react"
import { format, subDays, parseISO, startOfDay } from "date-fns"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import { TrendingUp, Sparkles } from "lucide-react"

interface MoodEntry {
  _id: string
  score: number
  note?: string
  timestamp: string
}

interface MoodTrendsChartProps {
  data: MoodEntry[]
  isLoading?: boolean
  className?: string
}

// Friendly mood labels instead of scores
const getMoodLabel = (score: number): string => {
  if (score >= 70) return "Positive"
  if (score >= 50) return "Calm"
  if (score >= 30) return "Neutral"
  return "Low"
}

// Custom tooltip with friendly language
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const moodLabel = getMoodLabel(data.score)

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-primary/20 dark:border-primary/30">
      <p className="text-xs font-medium text-muted-foreground mb-1">
        {data.displayDate}
      </p>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full",
            data.score >= 70 && "bg-emerald-400",
            data.score >= 50 && data.score < 70 && "bg-teal-400",
            data.score >= 30 && data.score < 50 && "bg-amber-400",
            data.score < 30 && "bg-rose-400"
          )}
        />
        <span className="text-sm font-semibold text-foreground">
          {moodLabel}
        </span>
      </div>
      {data.hasMultiple && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Average of {data.entryCount} check-ins
        </p>
      )}
    </div>
  )
}

export function MoodTrendsChart({
  data,
  isLoading = false,
  className,
}: MoodTrendsChartProps) {
  // Transform data into daily averages for the past 14 days
  const chartData = useMemo(() => {
    const days = 14
    const result = []

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      const dayEntries = data.filter((entry) => {
        const entryDate = startOfDay(parseISO(entry.timestamp))
        return entryDate.getTime() === date.getTime()
      })

      const avgScore =
        dayEntries.length > 0
          ? Math.round(
              dayEntries.reduce((sum, e) => sum + e.score, 0) / dayEntries.length
            )
          : null

      result.push({
        date: date.toISOString(),
        displayDate: format(date, "MMM d"),
        shortDate: format(date, "d"),
        score: avgScore,
        hasMultiple: dayEntries.length > 1,
        entryCount: dayEntries.length,
      })
    }

    return result
  }, [data])

  // Check if we have any data
  const hasData = chartData.some((d) => d.score !== null)

  // Fill gaps with interpolated values for smooth visualization
  const smoothedData = useMemo(() => {
    if (!hasData) return chartData

    const result = chartData.map(d => ({ ...d, interpolated: false }))
    let lastValidIndex = -1

    for (let i = 0; i < result.length; i++) {
      if (result[i].score !== null) {
        // Fill any gaps between last valid and current
        if (lastValidIndex !== -1 && i - lastValidIndex > 1) {
          const startScore = result[lastValidIndex].score!
          const endScore = result[i].score!
          const gap = i - lastValidIndex

          for (let j = lastValidIndex + 1; j < i; j++) {
            const progress = (j - lastValidIndex) / gap
            result[j] = {
              ...result[j],
              score: Math.round(startScore + (endScore - startScore) * progress),
              interpolated: true,
            }
          }
        }
        lastValidIndex = i
      }
    }

    return result
  }, [chartData, hasData])

  // Empty state
  if (!hasData && !isLoading) {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-teal-500/5 to-cyan-500/5 dark:from-primary/10 dark:via-teal-500/10 dark:to-cyan-500/10" />
        <div className="relative p-6 rounded-3xl border border-primary/10 dark:border-primary/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/20 dark:from-primary/30 dark:to-teal-500/30">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Mood Journey</h3>
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary/60" />
            </div>
            <p className="text-muted-foreground text-sm max-w-[200px]">
              Start tracking your mood to see patterns emerge over time
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-teal-500/5 to-cyan-500/5 dark:from-primary/10 dark:via-teal-500/10 dark:to-cyan-500/10" />

      <div className="relative p-6 rounded-3xl border border-primary/10 dark:border-primary/20 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/20 dark:from-primary/30 dark:to-teal-500/30">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Mood Journey</h3>
              <p className="text-xs text-muted-foreground">Past 2 weeks</p>
            </div>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Positive</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Calm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Neutral</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[180px] w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-teal-400/20 animate-pulse" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-white/40 to-transparent dark:from-white/20" />
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={smoothedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="hsl(168, 55%, 45%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(168, 55%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="moodStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(168, 55%, 45%)" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="shortDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={false}
                  width={0}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="url(#moodStroke)"
                  strokeWidth={3}
                  fill="url(#moodGradient)"
                  connectNulls
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--primary))",
                    stroke: "white",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
