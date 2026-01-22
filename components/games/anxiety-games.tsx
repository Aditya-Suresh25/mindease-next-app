"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Music2, Sparkles, ChevronRight, Clock } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Game Components
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

interface AnxietyGamesProps {
  onGamePlayed?: (gameName: string, description: string) => Promise<void>;
  onViewAllActivities?: () => void;
}

export const AnxietyGames = ({ onGamePlayed, onViewAllActivities }: AnxietyGamesProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [dynamicGames, setDynamicGames] = useState(ACTIVITIES);
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const res = await getLatestRecommendation("activity_suggestion");
        if (res.success && res.data?.context?.recommendations) {
          const recs = res.data.context.recommendations;
          setAiReason(recs.reason);
          const suggestedIds = recs.suggestedActivities.map((sa: any) => sa.id);
          const personalizedGames = ACTIVITIES.filter(g => suggestedIds.includes(g.id))
            .map(game => {
              const suggestions = recs.suggestedActivities.find((sa: any) => sa.id === game.id);
              return { ...game, description: suggestions?.why || game.description };
            });
          if (personalizedGames.length > 0) setDynamicGames(personalizedGames);
        } else {
          setDynamicGames(ACTIVITIES.filter(g => ["breathing", "forest", "waves"].includes(g.id)));
        }
      } catch (err) {
        setDynamicGames(ACTIVITIES.filter(g => ["breathing", "forest", "waves"].includes(g.id)));
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const handleGameStart = async (gameId: string) => {
    setSelectedGame(gameId);
    setShowGame(true);
    if (onGamePlayed) {
      await onGamePlayed(gameId, dynamicGames.find((g) => g.id === gameId)?.description || "");
    }
  };

  const renderGame = () => {
    switch (selectedGame) {
      case "breathing": return <BreathingGame />;
      case "garden": return <ZenGarden />;
      case "forest": return <ForestGame />;
      case "waves": return <OceanWaves />;
      case "cloud-letter": return <CloudLetter />;
      case "aura-blender": return <AuraBlender />;
      case "lumina-path": return <LuminaPath />;
      case "rain-painter": return <RainPainter />;
      case "daily-spark": return <DailySpark />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Gamepad2 className="h-7 w-7 text-primary" />
            </div>
            Mindful Activities
          </h2>
          <p className="text-muted-foreground text-lg mt-1">
            Personalized interactive exercises to find your calm.
          </p>
        </div>
        {onViewAllActivities && (
          <Button onClick={onViewAllActivities} variant="ghost" className="text-primary hover:bg-primary/5 font-semibold group">
            View All Games <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {/* Personalized Banner - Spans 2 columns on desktop */}
          {aiReason && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={80} className="text-primary" />
              </div>
              <div className="relative z-10 flex gap-5 items-start">
                <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
                  <Sparkles size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-primary">AI Recommendation</h4>
                  <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
                    {aiReason}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Cards */}
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[180px] w-full rounded-3xl" />
            ))
          ) : (
            dynamicGames.map((game) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card 
                  className="h-full border-primary/5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-3xl cursor-pointer overflow-hidden bg-card/50 backdrop-blur-sm"
                  onClick={() => handleGameStart(game.id)}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-4 rounded-2xl ${game.bgColor} ${game.color} shadow-inner`}>
                        <game.icon className="h-7 w-7" />
                      </div>
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none px-3 py-1">
                        <Clock className="h-3 w-3 mr-1" /> {game.duration}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{game.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {game.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-primary/5 flex items-center justify-between text-primary font-bold text-sm">
                      <span>Begin Session</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showGame} onOpenChange={setShowGame}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-primary/20 rounded-[2.5rem]">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <DialogTitle className="text-2xl flex items-center gap-3">
              {dynamicGames.find((g) => g.id === selectedGame)?.icon && (
                <div className={`p-2 rounded-lg ${dynamicGames.find((g) => g.id === selectedGame)?.bgColor}`}>
                   {/* Icon logic would go here */}
                </div>
              )}
              {dynamicGames.find((g) => g.id === selectedGame)?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full overflow-y-auto p-8 flex items-center justify-center">
            {renderGame()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};