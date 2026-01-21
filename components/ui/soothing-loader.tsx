"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence, type Transition } from "framer-motion"
import { cn } from "@/lib/utils"

interface SoothingLoaderProps {
  /**
   * Whether the loader is visible
   */
  isLoading?: boolean
  /**
   * Variant: 'fullscreen' covers the entire viewport, 'section' is inline
   */
  variant?: "fullscreen" | "section"
  /**
   * Optional calming message to display
   */
  message?: string | null
  /**
   * Size of the loader animation
   */
  size?: "sm" | "md" | "lg"
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Callback when loader finishes exit animation
   */
  onExitComplete?: () => void
}

// Calming micro-messages that rotate slowly
const calmingMessages = [
  "Taking a moment…",
  "Preparing your space…",
  "Almost ready…",
  "Creating calm…",
]

export function SoothingLoader({
  isLoading = true,
  variant = "section",
  message,
  size = "md",
  className,
  onExitComplete,
}: SoothingLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Slowly rotate messages (every 4 seconds)
  useEffect(() => {
    if (!isLoading || message) return

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % calmingMessages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isLoading, message])

  // Size configurations
  const sizeConfig = {
    sm: { container: "w-16 h-16", ripple: 64, text: "text-xs" },
    md: { container: "w-24 h-24", ripple: 96, text: "text-sm" },
    lg: { container: "w-32 h-32", ripple: 128, text: "text-base" },
  }

  const config = sizeConfig[size]
  const displayMessage = message ?? calmingMessages[currentMessageIndex]

  // Transition configurations
  const breatheTransition: Transition = {
    duration: prefersReducedMotion ? 0 : 4,
    repeat: Infinity,
    ease: "easeInOut" as const,
  }

  const rippleTransition = (i: number): Transition => ({
    duration: prefersReducedMotion ? 0 : 3,
    repeat: Infinity,
    delay: i * 0.8,
    ease: "easeOut" as const,
  })

  const fadeTransition: Transition = {
    duration: 0.6,
    ease: "easeOut" as const,
  }

  const LoaderContent = useCallback(() => (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Breathing animation container */}
      <div className={cn("relative", config.container)}>
        {/* Ripple layers - 3 staggered gentle waves */}
        {!prefersReducedMotion && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: [0.5, 1.2],
                  opacity: [0.4, 0],
                }}
                transition={rippleTransition(i)}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-teal-400/20 to-cyan-400/10 dark:from-primary/40 dark:via-teal-500/25 dark:to-cyan-500/15"
              />
            ))}
          </>
        )}

        {/* Core breathing orb */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.3, 0.6, 0.3],
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={breatheTransition}
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-br from-primary/40 via-teal-400/30 to-emerald-400/20",
            "dark:from-primary/50 dark:via-teal-500/35 dark:to-emerald-500/25",
            "shadow-lg shadow-primary/10 dark:shadow-primary/20",
            "backdrop-blur-sm"
          )}
        />

        {/* Inner glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.3, 0.6, 0.3],
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={breatheTransition}
          className={cn(
            "absolute inset-[25%] rounded-full",
            "bg-gradient-to-br from-white/60 via-primary/20 to-transparent",
            "dark:from-white/20 dark:via-primary/30 dark:to-transparent"
          )}
        />

        {/* Reduced motion fallback - static soft glow */}
        {prefersReducedMotion && (
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-br from-primary/30 via-teal-400/20 to-cyan-400/10",
              "dark:from-primary/40 dark:via-teal-500/25 dark:to-cyan-500/15",
              "animate-pulse"
            )}
            style={{ animationDuration: "3s" }}
          />
        )}
      </div>

      {/* Calming message */}
      {variant === "fullscreen" && (
        <AnimatePresence mode="wait">
          <motion.p
            key={displayMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.8, ease: "easeOut" as const }}
            className={cn(
              config.text,
              "text-muted-foreground font-medium tracking-wide",
              "select-none"
            )}
          >
            {displayMessage}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  ), [config, displayMessage, prefersReducedMotion, variant, breatheTransition])

  // Fullscreen variant
  if (variant === "fullscreen") {
    return (
      <AnimatePresence onExitComplete={onExitComplete}>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            className={cn(
              "fixed inset-0 z-50",
              "flex items-center justify-center",
              "bg-background/80 backdrop-blur-md",
              className
            )}
          >
            {/* Ambient background gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-teal-400/5 dark:from-primary/15 dark:to-teal-500/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-tl from-violet-400/8 to-purple-400/5 dark:from-violet-500/12 dark:to-purple-500/8 rounded-full blur-[80px]" />
            </div>

            <LoaderContent />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Section variant (inline)
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
          className={cn(
            "flex items-center justify-center py-12",
            className
          )}
        >
          <LoaderContent />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Simple inline loader for smaller spaces
 */
export function SoothingDots({ 
  className,
  size = "sm" 
}: { 
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  const sizeConfig = {
    sm: { dot: "w-2 h-2", gap: "gap-1.5" },
    md: { dot: "w-2.5 h-2.5", gap: "gap-2" },
    lg: { dot: "w-3 h-3", gap: "gap-2.5" },
  }

  const config = sizeConfig[size]

  return (
    <div className={cn("flex items-center", config.gap, className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.6 }
              : {
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1, 0.8],
                }
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut" as const,
          }}
          className={cn(
            "rounded-full bg-gradient-to-br from-primary to-teal-400 dark:from-primary dark:to-teal-500",
            config.dot
          )}
        />
      ))}
    </div>
  )
}

/**
 * Card skeleton with soothing shimmer effect
 */
export function SoothingSkeleton({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-muted/50 to-muted/30",
        "dark:from-muted/40 dark:to-muted/20",
        className
      )}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(126, 184, 158, 0.08), transparent)",
        }}
      />
      {children}
    </div>
  )
}
