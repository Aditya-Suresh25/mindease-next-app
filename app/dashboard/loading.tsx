"use client"

import { SoothingLoader } from "@/components/ui/soothing-loader"

export default function DashboardLoading() {
  return (
    <SoothingLoader 
      isLoading={true} 
      variant="fullscreen" 
      size="lg"
      message="Creating calm…"
    />
  )
}
