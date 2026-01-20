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

import { ACTIVITIES } from "@/lib/constants/activities";
import { getLatestRecommendation } from "@/lib/api/recommendation";
import { useEffect } from "react";

// ... existing imports

interface AnxietyGamesProps {
  onGamePlayed?: (gameName: string, description: string) => Promise<void>;
  onViewAllActivities?: () => void;
}

export const AnxietyGames = ({ onGamePlayed, onViewAllActivities }: AnxietyGamesProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [dynamicGames, setDynamicGames] = useState(ACTIVITIES); // Default to all or a subset?
  // Let's default to a safe subset if AI fails
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const res = await getLatestRecommendation("activity_suggestion");
        if (res.success && res.data && res.data.context && res.data.context.recommendations) {
          const recs = res.data.context.recommendations;
          if (recs && recs.suggestedActivities) {
            setAiReason(recs.reason);

            // Filter and map: matching backend IDs to frontend components
            // Backend sends: { id, name, type, ... }
            // Frontend has: ACTIVITIES with { id, title, icon, etc. }

            const suggestedIds = recs.suggestedActivities.map((sa: any) => sa.id);
            const personalizedGames = ACTIVITIES.filter(g => suggestedIds.includes(g.id))
              .map(game => {
                // Enhance with AI specific "why" if available
                const suggestions = recs.suggestedActivities.find((sa: any) => sa.id === game.id);
                return {
                  ...game,
                  description: suggestions?.why || game.description // Override desc with personalized "why"
                };
              });

            if (personalizedGames.length > 0) {
              setDynamicGames(personalizedGames);
            }
          }
        } else {
          // Fallback to a default set if no AI recommendation yet
          // e.g. Breathing, Forest, Waves
          const defaults = ACTIVITIES.filter(g => ["breathing", "forest", "waves"].includes(g.id));
          setDynamicGames(defaults);
        }
      } catch (err) {
        console.error("Failed to load activity recommendations", err);
        // Fallback
        const defaults = ACTIVITIES.filter(g => ["breathing", "forest", "waves"].includes(g.id));
        setDynamicGames(defaults);
      } finally {
        setIsLoading(false);
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
          dynamicGames.find((g) => g.id === gameId)?.description || ""
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
      <Card className="border-primary/10 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-primary" />
                Anxiety Relief Activities
              </CardTitle>
              <CardDescription>
                Interactive exercises to help reduce stress and anxiety
              </CardDescription>
            </div>
            {onViewAllActivities && (
              <Button 
                onClick={onViewAllActivities}
                variant="outline"
                className="shrink-0 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary font-medium gap-2"
              >
                <Gamepad2 className="h-4 w-4" />
                View All Activities
              </Button>
            )}
          </div>
        </CardHeader>

        {/* AI Insight Banner */}
        {aiReason && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-6 pb-2"
          >
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0 text-primary">
                <Music2 size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary mb-1">Recommended for You</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiReason}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <CardContent className="pt-4">
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