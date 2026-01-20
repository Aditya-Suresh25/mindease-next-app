"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Wind, Flower2, TreePine, Waves, Cloud, Palette, Sparkles, CloudRain, Zap, Clock, Battery, Play } from "lucide-react"
import { getAllActivityBlueprints, getActivitySuggestions } from "@/lib/api/activity"

// Game components
import { BreathingGame } from "@/components/games/breathing-games"
import { ZenGarden } from "@/components/games/zen-garden"
import { ForestGame } from "@/components/games/forest-game"
import { OceanWaves } from "@/components/games/ocean-waves"
import { CloudLetter } from "@/components/games/cloud-letter"
import { AuraBlender } from "@/components/games/aura-blender"
import { LuminaPath } from "@/components/games/lumina-path"
import { RainPainter } from "@/components/games/rain-painter"
import { DailySpark } from "@/components/games/daily-spark"

interface ActivityBlueprint {
  id: string
  name: string
  type: string
  description: string
  suitableMoodCategories: string[]
  durationMinutes: number
  energyLevel: string
  interactionType: string
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

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  relaxation: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  expression: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  grounding: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" },
  cognitive: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  game: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
}

const energyLevelColors: Record<string, string> = {
  low: "bg-green-500/20 text-green-600",
  medium: "bg-amber-500/20 text-amber-600",
  high: "bg-rose-500/20 text-rose-600",
}

export function AllActivities({ open, onOpenChange }: AllActivitiesProps) {
  const [activities, setActivities] = useState<ActivityBlueprint[]>([])
  const [suggestedIds, setSuggestedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [showGame, setShowGame] = useState(false)

  useEffect(() => {
    if (open) {
      fetchActivities()
    }
  }, [open])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      const [blueprintsRes, suggestionsRes] = await Promise.all([
        getAllActivityBlueprints(),
        getActivitySuggestions().catch(() => null),
      ])

      if (blueprintsRes.success) {
        setActivities(blueprintsRes.data)
      }

      if (suggestionsRes?.success) {
        setSuggestedIds(suggestionsRes.data.recommendations.map((r) => r.id))
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivityClick = (activityId: string) => {
    setSelectedActivity(activityId)
    setShowGame(true)
  }

  const renderGame = () => {
    switch (selectedActivity) {
      case "breathing":
        return <BreathingGame />
      case "garden":
        return <ZenGarden />
      case "forest":
        return <ForestGame />
      case "waves":
        return <OceanWaves />
      case "cloud-letter":
        return <CloudLetter />
      case "aura-blender":
        return <AuraBlender />
      case "lumina-path":
        return <LuminaPath />
      case "rain-painter":
        return <RainPainter />
      case "daily-spark":
        return <DailySpark />
      default:
        return null
    }
  }

  const getActivityName = () => {
    return activities.find((a) => a.id === selectedActivity)?.name || "Activity"
  }

  return (
    <>
      <Dialog open={open && !showGame} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-[2rem] bg-card/95 backdrop-blur-xl border-primary/10">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-center text-2xl">All Activities</DialogTitle>
            <DialogDescription className="text-center">
              Explore wellness activities designed to support your mental health journey
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {activities.map((activity, idx) => {
                const Icon = activityIcons[activity.id] || Sparkles
                const colors = typeColors[activity.type] || typeColors.game
                const isSuggested = suggestedIds.includes(activity.id)

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className={cn(
                        "relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group overflow-hidden",
                        colors.border,
                        isSuggested && "ring-2 ring-primary/50"
                      )}
                      onClick={() => handleActivityClick(activity.id)}
                    >
                      {isSuggested && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-primary text-primary-foreground text-[10px]">
                            Suggested for you
                          </Badge>
                        </div>
                      )}

                      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity", colors.bg)} />

                      <CardHeader className="relative pb-2">
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2.5 rounded-xl", colors.bg)}>
                            <Icon className={cn("w-5 h-5", colors.text)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold leading-tight">
                              {activity.name}
                            </CardTitle>
                            <Badge variant="outline" className={cn("mt-1 text-[10px] capitalize", colors.text)}>
                              {activity.type}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="relative pt-0 space-y-3">
                        <CardDescription className="text-sm line-clamp-2">
                          {activity.description}
                        </CardDescription>

                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{activity.durationMinutes} min</span>
                          </div>
                          <Badge className={cn("text-[10px]", energyLevelColors[activity.energyLevel])}>
                            <Battery className="w-3 h-3 mr-1" />
                            {activity.energyLevel} energy
                          </Badge>
                        </div>

                        <Button
                          size="sm"
                          className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          variant="outline"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Activity
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Game Dialog */}
      <Dialog open={showGame} onOpenChange={(open) => {
        setShowGame(open)
        if (!open) setSelectedActivity(null)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-card/95 backdrop-blur-xl border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-center">{getActivityName()}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {renderGame()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
