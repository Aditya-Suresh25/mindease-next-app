"use client"

import { SoothingLoader } from "@/components/ui/soothing-loader"

export default function ReflectionsLoading() {
  return (
    <SoothingLoader 
      isLoading={true} 
      variant="fullscreen" 
      size="lg"
      message="Gathering insights…"
    />
  )
}
