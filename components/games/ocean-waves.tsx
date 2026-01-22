"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Waves, Volume2, VolumeX, Play, Pause, ShipWheel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const BREATH_DURATION = 8; // seconds for one breath cycle

export function OceanWaves() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const waveControls = useAnimation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/music/waves.mp3");
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
      waveControls.stop();
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

  useEffect(() => {
    if (isPlaying) {
      waveControls.start({
        y: [0, -25, 0],
        scale: [1, 1.1, 1],
        transition: {
          duration: BREATH_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });
    } else {
      waveControls.stop();
    }
  }, [isPlaying, waveControls]);

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
    <div className="flex flex-col items-center justify-between h-[100dvh] sm:h-[500px] w-full py-12 px-6 bg-gradient-to-b from-blue-50/50 to-background sm:justify-center sm:space-y-12">
      
      {/* --- TOP INFO --- */}
      <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60">Tidal Rhythms</span>
          <h2 className="text-xl font-bold text-slate-900">Ocean Immersion</h2>
      </div>

      {/* --- ANIMATED CENTERPIECE --- */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.4, scale: 1.4 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: BREATH_DURATION, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-blue-400 rounded-full blur-[60px]"
            />
          )}
        </AnimatePresence>
        
        <motion.div
          animate={waveControls}
          className="relative z-10 p-14 rounded-[3.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl flex items-center justify-center"
        >
          <Waves className={cn(
            "w-24 h-24 sm:w-32 sm:h-32 transition-all duration-1000",
            isPlaying ? "text-blue-600 drop-shadow-lg" : "text-blue-900/10"
          )} />
          
          {/* Subtle Breath Indicator */}
          <motion.div 
            animate={{ opacity: isPlaying ? [0.2, 0.5, 0.2] : 0 }}
            transition={{ duration: BREATH_DURATION, repeat: Infinity }}
            className="absolute bottom-6 text-[8px] font-black uppercase tracking-[0.2em] text-blue-600"
          >
            {currentTime % BREATH_DURATION < BREATH_DURATION / 2 ? "Inhale" : "Exhale"}
          </motion.div>
        </motion.div>
      </div>

      {/* --- MOBILE-OPTIMIZED PLAYER --- */}
      <div className="w-full max-w-sm space-y-8">
        
        {/* Progress Timeline */}
        <div className="space-y-3">
            <Progress value={progress} className="h-2 rounded-full bg-blue-100" />
            <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(timeLeft)}</span>
            </div>
        </div>

        {/* Master Controls */}
        <div className="space-y-8">
            <div className="flex items-center justify-center gap-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVolume(Math.max(0, volume - 15))}
                    className="h-12 w-12 rounded-full text-blue-600/40 active:bg-blue-50"
                >
                    <VolumeX className="h-6 w-6" />
                </Button>

                <Button
                    onClick={togglePlay}
                    className="h-20 w-20 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 transition-all active:scale-90"
                >
                    {isPlaying ? (
                        <Pause className="h-10 w-10 fill-current" />
                    ) : (
                        <Play className="h-10 w-10 fill-current ml-1" />
                    )}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVolume(Math.min(100, volume + 15))}
                    className="h-12 w-12 rounded-full text-blue-600/40 active:bg-blue-50"
                >
                    <Volume2 className="h-6 w-6" />
                </Button>
            </div>

            {/* Tactile Volume Slider */}
            <div className="flex items-center gap-5 px-4 py-2 bg-white/50 rounded-2xl border border-white/80 shadow-inner">
                <ShipWheel className="w-5 h-5 text-blue-600/30" />
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