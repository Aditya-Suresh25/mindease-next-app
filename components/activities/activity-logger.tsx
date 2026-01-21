"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { logActivity as apiLogActivity, updateActivity } from "@/lib/api/activity"
import { toast } from "sonner"

const activityTypes = [
  { id: "meditation", name: "Meditation", icon: "🧘", color: "from-purple-400/20 to-blue-400/20" },
  { id: "exercise", name: "Exercise", icon: "💪", color: "from-orange-400/20 to-red-400/20" },
  { id: "walking", name: "Walking", icon: "🚶", color: "from-emerald-400/20 to-teal-400/20" },
  { id: "reading", name: "Reading", icon: "📚", color: "from-blue-400/20 to-indigo-400/20" },
  { id: "journaling", name: "Journaling", icon: "📝", color: "from-amber-400/20 to-yellow-400/20" },
  { id: "therapy", name: "Therapy", icon: "💭", color: "from-pink-400/20 to-rose-400/20" },
]

interface ActivityLoggerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialData?: {
    _id: string;
    type: string;
    name: string;
    duration?: number;
    description?: string;
  }
}

export function ActivityLogger({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: ActivityLoggerProps) {
  const [type, setType] = useState(initialData?.type ?? "")
  const [name, setName] = useState(initialData?.name ?? "")
  const [duration, setDuration] = useState(initialData?.duration?.toString() ?? "15")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && initialData) {
      setType(initialData.type || "")
      setName(initialData.name || "")
      setDuration(initialData.duration?.toString() || "15")
      setDescription(initialData.description || "")
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Activity name required")
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        type,
        name,
        description,
        duration: duration ? Number(duration) : undefined,
      }

      if (initialData) {
        await updateActivity(initialData._id, payload)
        toast.success("Activity updated")
      } else {
        await apiLogActivity(payload)
        toast.success("Activity logged")
      }

      if (!initialData) {
        setType("")
        setName("")
        setDuration("15")
        setDescription("")
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to save activity:", err)
      toast.error("Failed to save activity")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!initialData) {
      setType("")
      setName("")
      setDuration("15")
      setDescription("")
    }
    onOpenChange(false)
  }

  const getSelectedActivity = () => {
    return activityTypes.find(a => a.id === type) || activityTypes[0]
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-0">
        {/* Glassmorphism Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-xl" />
          <DialogHeader className="relative px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-white/10">
                <span className="text-xl">{getSelectedActivity().icon}</span>
              </div>
              <DialogTitle className="text-xl font-semibold">
                {initialData ? "Update Activity" : "Log Activity"}
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your wellness journey
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Activity Type Grid */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Activity Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {activityTypes.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => setType(activity.id)}
                  className={`
                    group relative flex flex-col items-center justify-center gap-1.5 rounded-lg p-2.5 
                    transition-all duration-200 overflow-hidden
                    ${type === activity.id
                      ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5'
                    }
                  `}
                >
                  {/* Glassmorphism background */}
                  <div className={`absolute inset-0 ${activity.color} opacity-50`} />
                  
                  <span className="relative text-xl">{activity.icon}</span>
                  <span className="relative text-xs font-medium">{activity.name}</span>
                  
                  {/* Selection indicator */}
                  {type === activity.id && (
                    <div className="absolute -bottom-0.5 h-0.5 w-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Name - Compact */}
          <div className="space-y-2">
            <Label htmlFor="activity-name" className="text-sm font-medium">
              What did you do?
            </Label>
            <Input
              id="activity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Meditation, Evening Walk"
              className="h-9 bg-white/5 border-white/10 focus:border-emerald-500/50"
              required
            />
          </div>

          {/* Duration - Compact with Quick Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Duration</Label>
              <span className="text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {duration} min
              </span>
            </div>
            
            <div className="space-y-2">
              {/* Quick duration buttons */}
              <div className="flex gap-1.5">
                {[5, 10, 15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins.toString())}
                    className={`
                      flex-1 py-1.5 rounded-md text-xs font-medium transition-all
                      ${duration === mins.toString()
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10'
                      }
                    `}
                  >
                    {mins} min
                  </button>
                ))}
              </div>

              {/* Range slider */}
              <div className="px-1">
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="
                    w-full h-1.5 bg-white/10 rounded-full appearance-none
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-gradient-to-r
                    [&::-webkit-slider-thumb]:from-emerald-400
                    [&::-webkit-slider-thumb]:to-teal-400
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-background
                    [&::-webkit-slider-thumb]:shadow-sm
                  "
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>30</span>
                  <span>60</span>
                  <span>90</span>
                  <span>120</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description - More Compact */}
          <div className="space-y-2">
            <Label htmlFor="activity-description" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="activity-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How did it feel? What did you learn?"
              className="min-h-[80px] bg-white/5 border-white/10 focus:border-emerald-500/50 text-sm"
              rows={2}
            />
          </div>

          {/* Buttons - Compact */}
          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-9 border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 h-9 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : initialData ? (
                "Update"
              ) : (
                "Log Activity"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}