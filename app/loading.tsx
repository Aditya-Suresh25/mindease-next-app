"use client"

import { SoothingLoader } from "@/components/ui/soothing-loader"

export default function Loading() {
  return (
    <SoothingLoader 
      isLoading={true} 
      variant="fullscreen" 
      size="lg"
    />
  )
}
