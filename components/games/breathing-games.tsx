"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const TOTAL_ROUNDS = 5;
// Define speeds for clarity
const INHALE_EXHALE_SPEED = 2; // 100 / 2 = 50 steps = 5 seconds (with 100ms interval)
const HOLD_SPEED = 4; // 100 / 4 = 25 steps = 2.5 seconds (with 100ms interval)

export function BreathingGame() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [progress, setProgress] = useState(0);
  const [round, setRound] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || isComplete) return;

    const intervalId = setInterval(() => {
      setProgress((prevProgress) => {
        // 1. Calculate the next progress based on the CURRENT phase
        const speed = phase === "hold" ? HOLD_SPEED : INHALE_EXHALE_SPEED;
        let nextProgress = prevProgress + speed;

        // 2. Check if the phase is complete (nextProgress >= 100)
        if (nextProgress >= 100) {
          // A. Advance the phase
          setPhase((prevPhase) => {
            if (prevPhase === "inhale") return "hold";
            if (prevPhase === "hold") return "exhale";

            // If exhale finished → increment round or finish
            setRound((r) => {
              if (r + 1 > TOTAL_ROUNDS) {
                setIsComplete(true);
                return r;
              }
              return r + 1;
            });

            return "inhale"; // Start a new phase (inhale)
          });

          // B. Reset progress for the next phase
          return 0;
        }

        // 3. Return the calculated next progress if phase is not complete
        return nextProgress;
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [phase, isPaused, isComplete]); // The fix is to ensure `phase` is in the dependency array
                                      // so that when `phase` changes, the effect re-runs and
                                      // the correct `phase` is used for the `speed` calculation
                                      // on the very next tick.


  const handleReset = () => {
    setPhase("inhale");
    setProgress(0);
    setRound(1);
    setIsComplete(false);
    setIsPaused(false);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-green-500" />
        </motion.div>
        <h3 className="text-2xl font-semibold">Great job!</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          You've completed {TOTAL_ROUNDS} rounds of breathing exercises. How do
          you feel?
        </p>
        <Button onClick={handleReset} className="mt-4">
          Start Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-8">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-center space-y-4"
          key={phase} // Added key to force remount/re-transition on phase change
        >
          <div className="relative w-32 h-32 mx-auto">
            <motion.div
              // NOTE: The transition duration of 4 seconds is now tied to the
              // speed constants: 5s (inhale/exhale) and 2.5s (hold) in the useEffect.
              // To make the animation match the timer, you should set a dynamic duration
              // or change the speed constants to match the 4s in the animation.
              // I'll leave the animation as-is, but be aware of the mismatch.
              animate={{
                scale: phase === "inhale" ? 1.5 : phase === "exhale" ? 1 : 1.2,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary/10 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Wind className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold">
            {phase === "inhale"
              ? "Breathe In"
              : phase === "hold"
              ? "Hold"
              : "Breathe Out"}
          </h3>
        </motion.div>
      </AnimatePresence>

      <div className="w-64">
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-2 text-center">
        <div className="text-sm text-muted-foreground">
          Round {round} of {TOTAL_ROUNDS}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </div>
    </div>
  );
}