"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea"; // ✅ Import Textarea
import { Label } from "@/components/ui/label"; // ✅ Import Label for accessibility
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { trackMood, updateMood } from "@/lib/api/mood";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MoodFormProps {
  onSuccess?: () => void;
  initialData?: {
    _id: string;
    score: number;
    note?: string;
  };
}

export function MoodForm({ onSuccess, initialData }: MoodFormProps) {
  const [moodScore, setMoodScore] = useState(initialData?.score ?? 50);
  const [notes, setNotes] = useState(initialData?.note ?? ""); // ✅ New state for notes
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, loading } = useSession();
  const router = useRouter();

  const emotions = [
    { value: 0, label: "😔", description: "Very Low" },
    { value: 25, label: "😕", description: "Low" },
    { value: 50, label: "😊", description: "Neutral" },
    { value: 75, label: "😃", description: "Good" },
    { value: 100, label: "🤗", description: "Great" },
  ];

  const currentEmotion =
    emotions.find((em) => Math.abs(moodScore - em.value) < 15) || emotions[2];

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Authentication required. Please log in to track your mood");
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);

      if (initialData) {
        await updateMood(initialData._id, {
          score: moodScore,
          note: notes.trim(),
        });
        toast.success("Mood updated", {
          description: "Your feelings matter. Keep reflecting. 🌿",
        });
      } else {
        // ✅ Included notes in the API call
        await trackMood({
          score: moodScore,
          note: notes.trim()
        });
        toast.success("Mood tracked", {
          description: "Taking a moment to reflect is self-care. 🌸",
        });
      }

      onSuccess?.();
    } catch (error) {
      toast.error("Couldn't save mood", {
        description: "Please try again in a moment. 🌿",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Emotion display */}
      <div className="text-center space-y-2">
        <div className="text-4xl">{currentEmotion.label}</div>
        <div className="text-sm text-muted-foreground">
          {currentEmotion.description}
        </div>
      </div>

      {/* Emotion slider */}
      <div className="space-y-4">
        <div className="flex justify-between px-2">
          {emotions.map((em) => (
            <div
              key={em.value}
              className={`cursor-pointer transition-opacity ${Math.abs(moodScore - em.value) < 15 ? "opacity-100" : "opacity-50"
                }`}
              onClick={() => setMoodScore(em.value)}
            >
              <div className="text-2xl">{em.label}</div>
            </div>
          ))}
        </div>

        <Slider
          value={[moodScore]}
          onValueChange={(value) => setMoodScore(value[0])}
          min={0}
          max={100}
          step={1}
          className="py-2"
        />
      </div>

      {/* ✅ Notes Input Section */}
      <div className="space-y-2">
        <Label htmlFor="mood-notes" className="text-sm font-medium">
          Add a note (optional)
        </Label>
        <Textarea
          id="mood-notes"
          placeholder="What's making you feel this way?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none"
          rows={3}
        />
      </div>

      {/* Submit button */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || loading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : loading ? (
          "Loading..."
        ) : (
          "Save Mood"
        )}
      </Button>
    </div>
  );
}