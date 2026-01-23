"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StarRating } from "@/components/ui/star-rating";
import { submitReview, dismissReviewPrompt } from "@/lib/api/review";
import { 
  Heart, 
  Sparkles, 
  CheckCircle2,
  Loader2,
  X,
  ShieldCheck,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewPromptProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function ReviewPrompt({ isOpen, onComplete }: ReviewPromptProps) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true); // Default to true for wellness
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 500;
  const minLength = 10;

  const handleSubmit = async () => {
    if (reviewText.trim().length > 0 && reviewText.trim().length < minLength) {
      setError(`Your reflection is a bit short. Please share at least ${minLength} characters.`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Send isAnonymous: when toggle is ON, user wants privacy (anonymous)
    // consentToPublish is always true when submitting (user consents to share)
    const result = await submitReview(reviewText.trim(), true, rating, isAnonymous);

    setIsSubmitting(false);

    if (result.success) {
      setShowThankYou(true);
      setTimeout(() => {
        onComplete();
      }, 2200);
    } else {
      setError(result.error || "Something went wrong, but your peace is more important. You can still proceed.");
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    await dismissReviewPrompt();
    setIsSubmitting(false);
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[500px] bg-card/98 backdrop-blur-2xl border-primary/5 shadow-2xl overflow-hidden rounded-[2rem]"
        showCloseButton={false}
      >
        {/* Top decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

        <AnimatePresence mode="wait">
          {showThankYou ? (
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Reflection Saved</h3>
              <p className="text-muted-foreground text-sm max-w-[280px]">
                Thank you for helping us grow. Wishing you a peaceful journey ahead.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onComplete}
                disabled={isSubmitting}
                className="absolute -right-2 -top-2 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>

              <DialogHeader className="space-y-3 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center rotate-3">
                    <Heart className="w-6 h-6 text-primary fill-primary/10" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold tracking-tight">
                      Pause & Reflect
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      How has your journey with MindEase been?
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Star Rating Section */}
                <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Your Overall Feeling
                  </Label>
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    size="lg"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs font-medium text-primary/80 animate-in fade-in slide-in-from-left-1">
                    {rating ? ["", "Needs work", "Getting there", "Feeling better", "Very helpful", "Truly transformative"][rating] : "Select a star to rate"}
                  </p>
                </div>

                {/* Text Area */}
                <div className="space-y-3">
                  <Label htmlFor="review" className="text-sm font-semibold">
                    A brief reflection <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    id="review"
                    placeholder="MindEase helped me find a moment of calm today..."
                    value={reviewText}
                    onChange={(e) => {
                      setReviewText(e.target.value);
                      setError(null);
                    }}
                    maxLength={maxLength}
                    disabled={isSubmitting}
                    className="min-h-[120px] rounded-xl border-muted bg-background/50 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                {/* --- ENHANCED ANONYMITY TOGGLE --- */}
                <motion.div 
                  layout
                  className={cn(
                    "relative group p-4 rounded-2xl border transition-all duration-300",
                    isAnonymous 
                      ? "bg-primary/[0.03] border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.05)]" 
                      : "bg-muted/20 border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        isAnonymous ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <Label htmlFor="anonymity" className="text-sm font-bold cursor-pointer">
                        Privacy Mode
                      </Label>
                    </div>
                    <Switch
                      id="anonymity"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                      disabled={isSubmitting}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  <div className="pl-7">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isAnonymous 
                        ? "Active: Your name will be displayed as 'A MindEase User'." 
                        : "Inactive: Your full name will be shown with your feedback."}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-primary/60 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      Your email and identity details are always private.
                    </div>
                  </div>
                </motion.div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs font-medium text-destructive bg-destructive/5 p-2 rounded-lg border border-destructive/10"
                  >
                    {error}
                  </motion.div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-3 pt-8">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl text-muted-foreground"
                >
                  Maybe later
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] rounded-xl shadow-lg shadow-primary/10 py-6 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  {isSubmitting ? "Saving..." : "Save Reflection"}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}