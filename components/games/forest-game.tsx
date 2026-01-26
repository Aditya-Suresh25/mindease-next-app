"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TreePine, Volume2, VolumeX, Play, Pause, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ForestGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/music/forest.mp3");
    audioRef.current = audio;
    audio.volume = volume / 100;

    const handleLoadedMetadata = () => {
      setDuration(Math.floor(audio.duration));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const timeLeft = duration - currentTime;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-between h-full min-h-[400px] w-full py-8 px-6 bg-gradient-to-b from-green-50/50 to-background sm:justify-center sm:gap-8">
      
      {/* --- TOP INFO --- */}
      <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600/60">Nature Sounds</span>
          <h2 className="text-lg font-bold">Forest Ambience</h2>
      </div>

      {/* --- ANIMATED ICON --- */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
              className="absolute inset-0 bg-green-500/10 rounded-full blur-3xl"
            />
          )}
        </AnimatePresence>
        
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.05, 1] : 1,
            rotate: isPlaying ? [0, 2, -2, 0] : 0,
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 p-12 rounded-[3rem] bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl"
        >
          <TreePine className={cn(
            "w-24 h-24 sm:w-32 sm:h-32 transition-colors duration-1000",
            isPlaying ? "text-green-600" : "text-green-900/20"
          )} />
        </motion.div>
      </div>

      {/* --- PLAYER CONTROLS --- */}
      <div className="w-full max-w-sm space-y-8">
        
        {/* Progress Section */}
        <div className="space-y-3">
            <Progress value={progress} className="h-2 rounded-full bg-green-100" />
            <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>

        {/* Play & Volume Section */}
        <div className="space-y-8">
            <div className="flex items-center justify-center gap-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVolume(Math.max(0, volume - 10))}
                    className="h-12 w-12 rounded-full text-muted-foreground"
                >
                    <VolumeX className="h-5 w-5" />
                </Button>

                <Button
                    onClick={togglePlay}
                    className="h-20 w-20 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/20 transition-all active:scale-90"
                >
                    {isPlaying ? (
                        <Pause className="h-8 w-8 fill-current" />
                    ) : (
                        <Play className="h-8 w-8 fill-current ml-1" />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVolume(Math.min(100, volume + 10))}
                    className="h-12 w-12 rounded-full text-muted-foreground"
                >
                    <Volume2 className="h-5 w-5" />
                </Button>
            </div>

            {/* Volume Slider - Thicker for Mobile */}
            <div className="flex items-center gap-4 px-2">
                <Music className="w-4 h-4 text-green-600/40" />
                <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="flex-1 cursor-pointer"
                />
            </div>
        </div>
      </div>
    </div>
  );
}