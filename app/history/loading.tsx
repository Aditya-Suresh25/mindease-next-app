"use client"

import { SoothingLoader } from "@/components/ui/soothing-loader"

export default function HistoryLoading() {
  return (
    <SoothingLoader 
      isLoading={true} 
      variant="fullscreen" 
      size="lg"
      message="Loading history…"
    />
  )
}
