"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  Leaf,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <Leaf className="size-4 text-emerald-500" />,
        info: <InfoIcon className="size-4 text-sky-500" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
        error: <OctagonXIcon className="size-4 text-rose-500" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
      }}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-emerald-500/20 group-[.toaster]:bg-emerald-50/50 dark:group-[.toaster]:bg-emerald-950/20",
          error: "group-[.toaster]:border-rose-500/20 group-[.toaster]:bg-rose-50/50 dark:group-[.toaster]:bg-rose-950/20",
          info: "group-[.toaster]:border-sky-500/20 group-[.toaster]:bg-sky-50/50 dark:group-[.toaster]:bg-sky-950/20",
          warning: "group-[.toaster]:border-amber-500/20 group-[.toaster]:bg-amber-50/50 dark:group-[.toaster]:bg-amber-950/20",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
