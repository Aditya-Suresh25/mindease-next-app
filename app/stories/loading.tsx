"use client"

import { SoothingLoader } from "@/components/ui/soothing-loader"

export default function StoriesLoading() {
  return (
    <SoothingLoader 
      isLoading={true} 
      variant="fullscreen" 
      size="lg"
      message="Loading stories…"
    />
  )
}
