"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

import {
    Select,SelectContent,SelectItem,SelectTrigger,SelectValue
} from "@/components/ui/select"
import { DialogTitle } from "@radix-ui/react-dialog"
import { Button } from "../ui/button"


const activityTypes = [
  { id: "meditation", name: "Meditation" },
  { id: "exercise", name: "Exercise" },
  { id: "walking", name: "Walking" },
  { id: "reading", name: "Reading" },
  { id: "journaling", name: "Journaling" },
  { id: "therapy", name: "Therapy Session" },
];

interface ActivityLoggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityLogger({open,onOpenChange}:ActivityLoggerProps){
    const [type,setType] = useState("");
    const [name,setName] = useState("")
    const [duration,setDuration] = useState("")
    const [description,setDescription] = useState("")
    const [isLoading,setIsLoading] = useState(false)

    const handleSubmit = (e:React.FormEvent) => {
        setTimeout(() => {
            console.log({
                type,
                name,
                duration,
                description
            })

            //Reset fields
            setType("")
            setName("")
            setDuration("")
            setDescription("")
            setIsLoading(false)

            alert("Alert logged (mock)!")
            onOpenChange(false) //Close modal
        },1000)
    }

    return(
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Activity</DialogTitle>
                    <DialogDescription>Record your wellness activity</DialogDescription>
                </DialogHeader>
                <form action="" onSubmit={handleSubmit}>
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
            <div className="flex justify-end gap-2">
            <Button type="button" variant={"ghost"}>Cancel</Button>
            <Button type="submit" disabled>Save Activity</Button>
          </div>
          </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}