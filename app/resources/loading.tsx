"use client"

import { SoothingLoader } from "@/components/ui/soothing-loader"

export default function ResourcesLoading() {
  return (
    <SoothingLoader 
      isLoading={true} 
      variant="fullscreen" 
      size="lg"
      message="Finding resources…"
    />
  )
}
