"use client"

import { SoothingLoader } from "@/components/ui/soothing-loader"

export default function SettingsLoading() {
  return (
    <SoothingLoader 
      isLoading={true} 
      variant="fullscreen" 
      size="lg"
      message="Loading settings…"
    />
  )
}
