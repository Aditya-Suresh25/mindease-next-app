"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Loader2, Wind, Flower2, TreePine, Waves, Cloud, Palette, 
  Sparkles, CloudRain, Zap, Clock, Play, Search, X 
} from "lucide-react"

// --- API Imports ---
import { getAllActivityBlueprints, getActivitySuggestions } from "@/lib/api/activity"

// --- Game Components ---
import { BreathingGame } from "@/components/games/breathing-games"
import { ZenGarden } from "@/components/games/zen-garden"
import { ForestGame } from "@/components/games/forest-game"
import { OceanWaves } from "@/components/games/ocean-waves"
import { CloudLetter } from "@/components/games/cloud-letter"
import { AuraBlender } from "@/components/games/aura-blender"
import { LuminaPath } from "@/components/games/lumina-path"
import { RainPainter } from "@/components/games/rain-painter"
import { DailySpark } from "@/components/games/daily-spark"

// --- Types ---
interface ActivityBlueprint {
  id: string
  name: string
  type: string
  description: string
  suitableMoodCategories: string[]
  durationMinutes: number
}

interface AllActivitiesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const activityIcons: Record<string, React.ElementType> = {
  breathing: Wind,
  garden: Flower2,
  forest: TreePine,
  waves: Waves,
  "cloud-letter": Cloud,
  "aura-blender": Palette,
  "lumina-path": Sparkles,
  "rain-painter": CloudRain,
  "daily-spark": Zap,
}

const MOODS = [
  { emoji: "😔", label: "Anxious", category: "relaxation" },
  { emoji: "🧘", label: "Restless", category: "grounding" },
  { emoji: "⚡", label: "Energetic", category: "expression" },
  { emoji: "☁️", label: "Foggy", category: "cognitive" },
]

export function AllActivities({ open, onOpenChange }: AllActivitiesProps) {
  const [activities, setActivities] = useState<ActivityBlueprint[]>([])
  const [suggestedIds, setSuggestedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [showGame, setShowGame] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    if (open) fetchActivities()
  }, [open])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      const [blueprintsRes, suggestionsRes] = await Promise.all([
        getAllActivityBlueprints(),
        getActivitySuggestions().catch(() => null),
      ])
      if (blueprintsRes?.success) setActivities(blueprintsRes.data)
      if (suggestionsRes?.success) {
        setSuggestedIds(suggestionsRes.data.recommendations.map((r: any) => r.id))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === "all" || activity.type === activeTab
      return matchesSearch && matchesTab
    })
  }, [activities, searchQuery, activeTab])

  const renderGame = () => {
    switch (selectedActivity) {
      case "breathing": return <BreathingGame />
      case "garden": return <ZenGarden />
      case "forest": return <ForestGame />
      case "waves": return <OceanWaves />
      case "cloud-letter": return <CloudLetter />
      case "aura-blender": return <AuraBlender />
      case "lumina-path": return <LuminaPath />
      case "rain-painter": return <RainPainter />
      case "daily-spark": return <DailySpark />
      default: return null
    }
  }

  return (
    <>
      <Dialog open={open && !showGame} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[100vw] sm:max-w-[90vw] h-[100dvh] sm:h-[85vh] p-0 border-none sm:border bg-background overflow-hidden flex flex-col">
          
          {/* --- COMPACT MOBILE HEADER --- */}
          <header className="px-4 pt-6 pb-4 space-y-4 shrink-0 bg-background border-b border-border/50 z-30">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic text-primary leading-none">MindEase</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Wellness Center</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-9 w-9 bg-muted/50">
                <X size={18} />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Find a session..." 
                className="pl-10 h-11 rounded-2xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Scrollable Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide snap-x">
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-4 py-2 rounded-full border text-xs font-bold transition-all shrink-0 snap-start",
                  activeTab === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                )}
              >
                All
              </button>
              {MOODS.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setActiveTab(mood.category === activeTab ? "all" : mood.category)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all shrink-0 snap-start",
                    activeTab === mood.category ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                  )}
                >
                  <span className="text-base">{mood.emoji}</span>
                  <span className="text-xs font-bold">{mood.label}</span>
                </button>
              ))}
            </div>
          </header>

          {/* --- DENSE ACTIVITY GRID --- */}
          <main className="flex-1 overflow-y-auto p-4 bg-muted/10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Syncing Sanctuary...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-24">
                <AnimatePresence mode="popLayout">
                  {filteredActivities.map((activity, idx) => (
                    <ActivityCard 
                      key={activity.id} 
                      activity={activity} 
                      isSuggested={suggestedIds.includes(activity.id)}
                      onClick={() => {
                        setSelectedActivity(activity.id)
                        setShowGame(true)
                      }}
                      idx={idx}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && filteredActivities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <Search size={32} className="mb-2" />
                <p className="text-sm font-medium">No sessions found</p>
              </div>
            )}
          </main>
        </DialogContent>
      </Dialog>

      {/* --- FULLSCREEN PLAYER --- */}
      <Dialog open={showGame} onOpenChange={setShowGame}>
        <DialogContent className="max-w-none w-screen h-[100dvh] p-0 border-none rounded-none bg-black overflow-hidden flex flex-col z-[100]">
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent z-[110]">
            <Button variant="ghost" size="icon" onClick={() => setShowGame(false)} className="text-white bg-white/10 hover:bg-white/20 rounded-full h-10 w-10">
              <X className="h-6 w-6" />
            </Button>
            <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md px-4 py-1">
              Live Session
            </Badge>
            <div className="w-10" />
          </div>
          <div className="flex-1 touch-none">
            {renderGame()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ActivityCard({ activity, isSuggested, onClick, idx }: any) {
  const Icon = activityIcons[activity.id] || Sparkles
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      <Card className="h-full border-border/50 bg-card overflow-hidden rounded-[1.5rem] shadow-sm active:shadow-inner transition-shadow">
        <CardContent className="p-3.5 flex flex-col h-full gap-3">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            {isSuggested && (
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="AI Recommended" />
            )}
          </div>
          
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold leading-tight line-clamp-2">{activity.name}</h3>
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">
              {activity.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground/70">
              <Clock size={10} className="text-primary" />
              {activity.durationMinutes}M
            </div>
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Play size={10} className="fill-current ml-0.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}