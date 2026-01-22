"use client"

import { SoothingLoader } from "@/components/ui/soothing-loader"

export default function TherapyLoading() {
  return (
    <SoothingLoader 
      isLoading={true} 
      variant="fullscreen" 
      size="lg"
      message="Preparing your session…"
    />
  )
}
