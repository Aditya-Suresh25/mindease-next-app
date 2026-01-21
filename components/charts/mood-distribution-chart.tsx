"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import { Heart, Sparkles } from "lucide-react"

interface MoodEntry {
  _id: string
  score: number
  note?: string
  timestamp: string
}

interface MoodDistributionChartProps {
  data: MoodEntry[]
  isLoading?: boolean
  className?: string
}

// Friendly mood categories
const moodCategories = [
  { name: "Positive", min: 70, max: 100, color: "#34d399", lightColor: "#d1fae5" },
  { name: "Calm", min: 50, max: 69, color: "#5eead4", lightColor: "#ccfbf1" },
  { name: "Neutral", min: 30, max: 49, color: "#fbbf24", lightColor: "#fef3c7" },
  { name: "Low", min: 0, max: 29, color: "#f9a8d4", lightColor: "#fce7f3" },
]

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-violet-500/20">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm font-semibold text-foreground">{data.name}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {data.value} check-in{data.value !== 1 ? "s" : ""} ({data.percentage}%)
      </p>
    </div>
  )
}

export function MoodDistributionChart({
  data,
  isLoading = false,
  className,
}: MoodDistributionChartProps) {
  // Calculate distribution
  const chartData = useMemo(() => {
    const distribution = moodCategories.map((cat) => ({
      ...cat,
      value: data.filter((m) => m.score >= cat.min && m.score <= cat.max).length,
    }))

    const total = distribution.reduce((sum, d) => sum + d.value, 0)

    return distribution.map((d) => ({
      ...d,
      percentage: total > 0 ? Math.round((d.value / total) * 100) : 0,
    }))
  }, [data])

  const hasData = data.length > 0
  const totalEntries = data.length

  // Find the dominant mood
  const dominantMood = useMemo(() => {
    if (!hasData) return null
    const sorted = [...chartData].sort((a, b) => b.value - a.value)
    return sorted[0].value > 0 ? sorted[0] : null
  }, [chartData, hasData])

  // Empty state
  if (!hasData && !isLoading) {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-pink-500/5 dark:from-violet-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
        <div className="relative p-6 rounded-3xl border border-violet-500/10 dark:border-violet-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/30 dark:to-purple-500/30">
              <Heart className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            </div>
            <h3 className="font-semibold text-foreground">How You've Felt</h3>
          </div>

          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-violet-500/60" />
            </div>
            <p className="text-muted-foreground text-sm max-w-[180px]">
              Your mood patterns will appear here as you check in
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-pink-500/5 dark:from-violet-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />

      <div className="relative p-6 rounded-3xl border border-violet-500/10 dark:border-violet-500/20 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/30 dark:to-purple-500/30">
            <Heart className="w-4 h-4 text-violet-500 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">How You've Felt</h3>
            <p className="text-xs text-muted-foreground">
              {totalEntries} check-in{totalEntries !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[180px] flex items-center justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-400/20 animate-pulse" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-white/40 to-transparent dark:from-white/20" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Donut chart */}
            <div className="relative w-[140px] h-[140px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData
                      .filter((d) => d.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center content */}
              {dominantMood && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground">Mostly</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: dominantMood.color }}
                  >
                    {dominantMood.name}
                  </span>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2.5">
              {chartData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs text-foreground font-medium flex-1">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {cat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
