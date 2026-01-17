"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DialogTitle } from "@radix-ui/react-dialog"
import { Button } from "../ui/button"
import { logActivity as apiLogActivity, updateActivity } from "@/lib/api/activity"

const activityTypes = [
  { id: "meditation", name: "Meditation" },
  { id: "exercise", name: "Exercise" },
  { id: "walking", name: "Walking" },
  { id: "reading", name: "Reading" },
  { id: "journaling", name: "Journaling" },
  { id: "therapy", name: "Therapy Session" },
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
  const [duration, setDuration] = useState(initialData?.duration?.toString() ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when dialog opens/closes or initialData changes
  // Ideally use useEffect to sync with initialData if it changes while open
  // But typically it's set before opening.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      } else {
        await apiLogActivity(payload)
      }

      // Reset fields if creating new, but maybe not if editing?
      if (!initialData) {
        setType("")
        setName("")
        setDuration("")
        setDescription("")
      }

      onSuccess?.()          // notify dashboard
      onOpenChange(false)    // close modal
    } catch (err) {
      console.error("Failed to save activity:", err)
      alert("Failed to save activity. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>
            Record your wellness activity
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Morning Meditation, Evening Walk, etc."
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="15"
            />
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How did it go?"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
