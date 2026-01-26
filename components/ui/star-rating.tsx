"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface StarRatingProps {
  /** Current rating value (1-5) */
  value: number | null
  /** Callback when rating changes */
  onChange?: (value: number | null) => void
  /** Whether the rating is read-only (display mode) */
  readOnly?: boolean
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Whether to show the rating as muted/subtle */
  muted?: boolean
  /** Additional CSS classes */
  className?: string
  /** Accessible label */
  label?: string
  /** Whether the input is disabled */
  disabled?: boolean
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  muted = false,
  className,
  label = "Rating",
  disabled = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  const sizeConfig = {
    sm: { star: "w-4 h-4", gap: "gap-0.5" },
    md: { star: "w-5 h-5", gap: "gap-1" },
    lg: { star: "w-6 h-6", gap: "gap-1.5" },
  }

  const config = sizeConfig[size]
  const displayValue = hoverValue ?? value ?? 0

  const handleClick = (rating: number) => {
    if (readOnly || disabled) return
    // Allow deselecting by clicking the same star
    onChange?.(value === rating ? null : rating)
  }

  const handleMouseEnter = (rating: number) => {
    if (readOnly || disabled) return
    setHoverValue(rating)
  }

  const handleMouseLeave = () => {
    if (readOnly || disabled) return
    setHoverValue(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (readOnly || disabled) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick(rating)
    }
  }

  return (
    <div
      role={readOnly ? "img" : "radiogroup"}
      aria-label={label}
      aria-valuenow={value ?? undefined}
      className={cn("flex items-center", config.gap, className)}
    >
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = rating <= displayValue
        const isInteractive = !readOnly && !disabled

        return (
          <motion.button
            key={rating}
            type="button"
            role={readOnly ? undefined : "radio"}
            aria-checked={value === rating}
            aria-label={`${rating} star${rating !== 1 ? "s" : ""}`}
            disabled={disabled || readOnly}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            whileHover={
              isInteractive && !prefersReducedMotion
                ? { scale: 1.15 }
                : undefined
            }
            whileTap={
              isInteractive && !prefersReducedMotion
                ? { scale: 0.95 }
                : undefined
            }
            className={cn(
              "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm",
              isInteractive && "cursor-pointer",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <Star
              className={cn(
                config.star,
                "transition-all duration-200",
                isFilled
                  ? muted
                    ? "fill-primary/40 text-primary/50"
                    : "fill-primary/70 text-primary"
                  : muted
                    ? "fill-transparent text-muted-foreground/30"
                    : "fill-transparent text-muted-foreground/40",
                isInteractive &&
                  !isFilled &&
                  "hover:text-primary/50"
              )}
            />
          </motion.button>
        )
      })}
    </div>
  )
}

/**
 * Display-only star rating for testimonials
 * More subtle and compact than the interactive version
 */
export function StarRatingDisplay({
  rating,
  size = "sm",
  className,
}: {
  rating: number
  size?: "sm" | "md"
  className?: string
}) {
  const sizeConfig = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  }

  return (
    <div
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className={cn("flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeConfig[size],
            "transition-colors",
            star <= rating
              ? "fill-primary/50 text-primary/60"
              : "fill-transparent text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  )
}
