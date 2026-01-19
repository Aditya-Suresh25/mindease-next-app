"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Flower2, Wind, TreePine, Waves, Music2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BreathingGame } from "./breathing-games";
import { ZenGarden } from "./zen-garden";
import { ForestGame } from "./forest-game";
import { OceanWaves } from "./ocean-waves";
import { CloudLetter } from "./cloud-letter";
import { AuraBlender } from "./aura-blender";
import { LuminaPath } from "./lumina-path";
import { RainPainter } from "./rain-painter";
import { DailySpark } from "./daily-spark";

const games = [
  {
    id: "breathing",
    title: "Breathing Patterns",
    description: "Follow calming breathing exercises with visual guidance",
    icon: Wind,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    duration: "5 mins",
  },
  {
    id: "garden",
    title: "Zen Garden",
    description: "Create and maintain your digital peaceful space",
    icon: Flower2,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    duration: "10 mins",
  },
  {
    id: "forest",
    title: "Mindful Forest",
    description: "Take a peaceful walk through a virtual forest",
    icon: TreePine,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    duration: "15 mins",
  },
  {
    id: "waves",
    title: "Ocean Waves",
    description: "Match your breath with gentle ocean waves",
    icon: Waves,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    duration: "8 mins",
  },
  {
    id: "cloud-letter",
    title: "Cloud Letter",
    description: "Release your worries into drifting clouds",
    icon: Wind,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    duration: "5 mins",
  },
  {
    id: "aura-blender",
    title: "Aura Blender",
    description: "Mix colors to find your perfect balance",
    icon: Gamepad2, // Placeholder icon, maybe Palette would be better if available
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    duration: "5 mins",
  },
  {
    id: "lumina-path",
    title: "Lumina Path",
    description: "Find light in the darkness",
    icon: TreePine,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    duration: "10 mins",
  },
  {
    id: "rain-painter",
    title: "Rain Painter",
    description: "Clear the fog on a rainy day",
    icon: Waves,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    duration: "5 mins",
  },
  {
    id: "daily-spark",
    title: "Daily Spark",
    description: "Collect sparks of positivity",
    icon: Music2,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    duration: "5 mins",
  },
];

interface AnxietyGamesProps {
  onGamePlayed?: (gameName: string, description: string) => Promise<void>;
}

import { getLatestRecommendation } from "@/lib/api/recommendation";
import { useEffect } from "react";

// ... existing imports

export const AnxietyGames = ({ onGamePlayed }: AnxietyGamesProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [dynamicGames, setDynamicGames] = useState(games);
  const [aiReason, setAiReason] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await getLatestRecommendation("activity_suggestion");
        if (res.success && res.data && res.data.context && res.data.context.recommendations) {
          const recs = res.data.context.recommendations;
          if (recs && recs.suggestedActivities) {
            setAiReason(recs.reason);
            // Map AI activities to UI component structure
            const mappedGames = recs.suggestedActivities.map((act: any, index: number) => {
              // Map based on type/name to find suitable icon/color or default
              // Reuse existing icons based on checking keywords or type
              let icon = Wind;
              let color = "text-blue-500";
              let bgColor = "bg-blue-500/10";

              if (act.type === "grounding" || act.type === "forest") { icon = TreePine; color = "text-green-500"; bgColor = "bg-green-500/10"; }
              else if (act.type === "relaxation" || act.type === "garden") { icon = Flower2; color = "text-rose-500"; bgColor = "bg-rose-500/10"; }
              else if (act.type === "game" || act.type === "waves") { icon = Waves; color = "text-cyan-500"; bgColor = "bg-cyan-500/10"; }

              // If ID matches existing game, use its metadata but override description per AI?
              // Or just display as is. The prompt says "Reuse existing activity cards".
              // I will construct a game object.
              return {
                id: act.id || `ai-${index}`,
                title: act.name,
                description: act.why || act.description, // AI gives 'why'
                icon,
                color,
                bgColor,
                duration: `${act.durationMinutes || 5} mins`,
                isAi: true
              };
            });
            setDynamicGames(mappedGames);
          }
        }
      } catch (err) {
        console.error("Failed to load activity recommendations", err);
      }
    };
    fetchRecommendations();
  }, []);

  const handleGameStart = async (gameId: string) => {
    setSelectedGame(gameId);
    setShowGame(true);

    // Log the activity
    if (onGamePlayed) {
      try {
        await onGamePlayed(
          gameId,
          games.find((g) => g.id === gameId)?.description || ""
        );
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    }
  };

  const renderGame = () => {
    switch (selectedGame) {
      case "breathing":
        return <BreathingGame />;
      case "garden":
        return <ZenGarden />;
      case "forest":
        return <ForestGame />;
      case "waves":
        return <OceanWaves />;
      case "cloud-letter":
        return <CloudLetter />;
      case "aura-blender":
        return <AuraBlender />;
      case "lumina-path":
        return <LuminaPath />;
      case "rain-painter":
        return <RainPainter />;
      case "daily-spark":
        return <DailySpark />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            {aiReason ? "Recommended for You" : "Anxiety Relief Activities"}
          </CardTitle>
          <CardDescription>
            {aiReason || "Interactive exercises to help reduce stress and anxiety"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dynamicGames.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer ${selectedGame === game.id ? "ring-2 ring-primary" : ""
                    }`}
                  onClick={() => handleGameStart(game.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl ${game.bgColor} ${game.color}`}
                      >
                        <game.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{game.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {game.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Music2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {game.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {selectedGame && (
            <div className="mt-6 text-center">
              <Button className="gap-2" onClick={() => setSelectedGame(null)}>
                <Gamepad2 className="h-4 w-4" />
                Start {dynamicGames.find((g) => g.id === selectedGame)?.title}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showGame} onOpenChange={setShowGame}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {dynamicGames.find((g) => g.id === selectedGame)?.title}
            </DialogTitle>
          </DialogHeader>
          {renderGame()}
        </DialogContent>
      </Dialog>
    </>
  );
};