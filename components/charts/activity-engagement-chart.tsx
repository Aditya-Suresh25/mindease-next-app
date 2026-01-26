"use client"

import { useMemo } from "react"
import { format, subDays, parseISO, startOfDay, isSameDay } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { cn } from "@/lib/utils"
import { Activity, Sparkles, TrendingUp } from "lucide-react"

interface ActivityEntry {
  _id: string
  type: string
  name: string
  description?: string
  duration?: number
  timestamp: string
}

interface ActivityEngagementChartProps {
  data: ActivityEntry[]
  isLoading?: boolean
  className?: string
}

// 🎨 Improved Color Palette: Distinct, modern, and accessible
const activityConfig: Record<string, { label: string; color: string }> = {
  mindfulness: { label: "Mindfulness", color: "#818cf8" }, // Indigo
  exercise: { label: "Movement", color: "#fb7185" },     // Rose
  social: { label: "Connection", color: "#fbbf24" },     // Amber
  creative: { label: "Creativity", color: "#2dd4bf" },   // Teal
  relaxation: { label: "Rest", color: "#60a5fa" },       // Blue
  learning: { label: "Learning", color: "#a3e635" },     // Lime
  journaling: { label: "Journaling", color: "#c084fc" }, // Purple
  therapy: { label: "Therapy", color: "#f472b6" },       // Pink
  walking: { label: "Walking", color: "#34d399" },       // Emerald
  default: { label: "Other", color: "#94a3b8" },         // Slate
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  // Sort payload by value (highest count first) for better readability
  const sortedPayload = [...payload].sort((a, b) => b.value - a.value)
  const total = sortedPayload.reduce((acc: number, curr: any) => acc + curr.value, 0)

  return (
    <div className="bg-popover/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-border ring-1 ring-black/5">
      <p className="text-xs font-semibold text-muted-foreground mb-2 pb-2 border-b border-border/50">
        {label}
      </p>
      <div className="space-y-1.5 min-w-[140px]">
        {sortedPayload.map((entry: any, index: number) => {
          if (entry.value === 0) return null
          return (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-foreground font-medium capitalize">
                  {entry.name}
                </span>
              </div>
              <span className="font-bold text-foreground">{entry.value}</span>
            </div>
          )
        })}
        <div className="pt-2 mt-2 border-t border-border/50 flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">Total</span>
          <span className="text-xs font-bold text-foreground">{total}</span>
        </div>
      </div>
    </div>
  )
}

export function ActivityEngagementChart({
  data,
  isLoading = false,
  className,
}: ActivityEngagementChartProps) {
  
  // 1. Transform data into daily breakdowns with counts per type
  const { chartData, activeTypes } = useMemo(() => {
    const days = 14
    const result = []
    const typesFound = new Set<string>()

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      
      // Filter activities for this specific day
      const dayActivities = data.filter((entry) => 
        isSameDay(parseISO(entry.timestamp), date)
      )

      // Initialize the day object
      const dayData: any = {
        date: date.toISOString(),
        displayDate: format(date, "MMM d"),
        shortDate: format(date, "d"),
        total: dayActivities.length,
      }

      // Count distinct types for this day
      dayActivities.forEach((activity) => {
        const typeKey = activity.type.toLowerCase()
        // Use mapped key or fallback to activity type ID
        const key = activityConfig[typeKey] ? typeKey : 'default'
        
        dayData[key] = (dayData[key] || 0) + 1
        typesFound.add(key)
      })

      result.push(dayData)
    }

    return { 
      chartData: result, 
      activeTypes: Array.from(typesFound) 
    }
  }, [data])

  const hasData = data.length > 0

  // Empty State
  if (!hasData && !isLoading) {
    return (
      <div className={cn("relative h-full min-h-[300px]", className)}>
        <div className="h-full rounded-3xl bg-card border border-border shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent" />
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary/60" />
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-1">No activities yet</h3>
          <p className="text-muted-foreground text-sm max-w-[200px]">
            Start logging your daily wellness activities to see your progress chart here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-full", className)}>
      <div className="h-full rounded-3xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg leading-none">Activity Flow</h3>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">Last 14 Days Overview</p>
              </div>
            </div>
            {/* Quick Stat */}
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1.5 text-emerald-500 mb-0.5">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">Total Logged</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{data.length}</span>
            </div>
          </div>

          {/* Dynamic Legend */}
          {activeTypes.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
              {activeTypes.map((type) => {
                const config = activityConfig[type] || activityConfig.default
                return (
                  <div key={type} className="flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-transparent" 
                      style={{ backgroundColor: config.color }} 
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chart Section */}
        <div className="flex-1 w-full min-h-[200px] px-2 pb-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                barSize={28}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="hsl(var(--border))" 
                  opacity={0.5} 
                />
                <XAxis
                  dataKey="shortDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'hsl(var(--muted)/0.2)', radius: 8 }} 
                />
                
                {/* Generate Stacked Bars dynamically.
                  The order here determines the stacking order.
                */}
                {activeTypes.map((type, index) => {
                  const config = activityConfig[type] || activityConfig.default
                  const isLast = index === activeTypes.length - 1
                  const radius: [number, number, number, number] = isLast ? [6, 6, 0, 0] : [0, 0, 0, 0]

                  return (
                    <Bar
                      key={type}
                      dataKey={type}
                      name={config.label}
                      stackId="a" // This connects them into a single bar
                      fill={config.color}
                      radius={[2, 2, 2, 2]} // Small radius on segments looks nicer
                      strokeWidth={1}
                      stroke="hsl(var(--card))" // Gives a tiny gap effect between stacks
                    />
                  )
                })}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-400/20 animate-pulse" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-white/40 to-transparent dark:from-white/20" />
      </div>
    </div>
  )
}