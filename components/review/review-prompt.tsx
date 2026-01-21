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
  X
} from "lucide-react";

interface ReviewPromptProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function ReviewPrompt({ isOpen, onComplete }: ReviewPromptProps) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [consentToPublish, setConsentToPublish] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 500;
  const minLength = 10;

  const handleSubmit = async () => {
    if (reviewText.trim().length < minLength) {
      setError(`Please share at least ${minLength} characters`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const result = await submitReview(reviewText.trim(), consentToPublish, rating);

    setIsSubmitting(false);

    if (result.success) {
      setShowThankYou(true);
      // Show thank you message briefly, then complete
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      // If there's an error, still allow logout to proceed
      setError(result.error || "Unable to save feedback, but you can still log out.");
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    // Dismiss the prompt to update the cooldown timer
    await dismissReviewPrompt();
    setIsSubmitting(false);
    onComplete();
  };

  const handleClose = async () => {
    // Don't update cooldown on close, just proceed with logout
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[480px] bg-card/95 backdrop-blur-xl border-primary/10"
        showCloseButton={false}
      >
        <AnimatePresence mode="wait">
          {showThankYou ? (
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
              <p className="text-muted-foreground text-sm">
                Your feedback means a lot to us.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>

              <DialogHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">
                      Before you go...
                    </DialogTitle>
                  </div>
                </div>
                <DialogDescription className="text-sm leading-relaxed">
                  We'd love to hear how MindEase has felt for you recently. 
                  Did it help you pause, reflect, or feel a little more supported?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Star Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    How would you rate your experience?
                  </Label>
                  <StarRating
                    value={rating}
                    onChange={setRating}
                    size="lg"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    {rating ? ["", "Not for me", "Could be better", "Pretty good", "Really helpful", "Life-changing"][rating] : "Tap a star to rate (optional)"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review" className="text-sm font-medium">
                    Share a brief reflection (optional)
                  </Label>
                  <Textarea
                    id="review"
                    placeholder="e.g., 'MindEase helped me take a moment to breathe when I felt overwhelmed...'"
                    value={reviewText}
                    onChange={(e) => {
                      setReviewText(e.target.value);
                      setError(null);
                    }}
                    maxLength={maxLength}
                    disabled={isSubmitting}
                    className="min-h-[100px] resize-none bg-background/50 border-primary/10 focus:border-primary/30"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1-3 sentences is perfect</span>
                    <span className={reviewText.length > maxLength - 50 ? "text-amber-500" : ""}>
                      {reviewText.length}/{maxLength}
                    </span>
                  </div>
                </div>

                {reviewText.trim().length >= minLength && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <Switch
                      id="consent"
                      checked={consentToPublish}
                      onCheckedChange={setConsentToPublish}
                      disabled={isSubmitting}
                    />
                    <div className="space-y-1">
                      <Label 
                        htmlFor="consent" 
                        className="text-sm font-medium cursor-pointer"
                      >
                        Allow anonymous display
                      </Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your reflection may appear on our site as a testimonial from 
                        "A MindEase user" or your first name only. Your email and identity 
                        will never be shown.
                      </p>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <DialogFooter className="flex-row gap-2 sm:gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none text-muted-foreground hover:text-foreground"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || reviewText.trim().length < minLength}
                  className="flex-1 sm:flex-none gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Share Feedback
                    </>
                  )}
                </Button>
              </DialogFooter>

              <p className="text-[10px] text-center text-muted-foreground mt-4 leading-relaxed">
                Your feedback helps us improve. We never ask about specific outcomes or diagnoses.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
