"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Parallax speed constants - adjust these for different effects
 * Lower values = slower movement, higher values = faster movement
 */
const PARALLAX_SPEEDS = {
  background: 0.15,  // Very slow - creates depth
  midLayer: 0.25,    // Moderate - floating elements
  foreground: 0.05,  // Minimal - keeps content stable
} as const;

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: "up" | "down";
}

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Background layer content - slowest movement */
  backgroundContent?: React.ReactNode;
  /** Mid layer content - moderate movement */
  midContent?: React.ReactNode;
  /** Custom background gradient classes */
  backgroundGradient?: string;
  /** Disable parallax entirely */
  disabled?: boolean;
}

/**
 * Individual parallax layer with configurable speed
 */
function ParallaxLayer({ 
  children, 
  speed = PARALLAX_SPEEDS.midLayer, 
  className,
  direction = "up"
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Calculate transform based on scroll position
  // Multiplier determines the movement range (in pixels)
  const multiplier = direction === "up" ? -100 : 100;
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    [multiplier * speed, -multiplier * speed]
  );

  // Disable parallax for reduced motion preference
  if (prefersReducedMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ 
        y,
        // GPU acceleration
        transform: "translate3d(0, 0, 0)",
        willChange: "transform"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Floating element with gentle animation
 */
function FloatingElement({ 
  children, 
  className,
  delay = 0 
}: { 
  children?: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -8, 0],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Main parallax section component with three layers:
 * - Background: Soft gradients and shapes (slowest)
 * - Mid: Floating cards and elements (moderate)
 * - Foreground: Main content (minimal/no movement)
 */
export function ParallaxSection({
  children,
  className,
  backgroundContent,
  midContent,
  backgroundGradient,
  disabled = false
}: ParallaxSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Background layer transforms - very subtle
  const bgY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.02, 1]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 0.8, 0.8, 0.5]);

  // Mid layer transforms - slightly more movement
  const midY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const midOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  const isDisabled = disabled || prefersReducedMotion;

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Background Layer - Slowest movement */}
      {backgroundContent && (
        <motion.div
          className="absolute inset-0 -z-20 pointer-events-none"
          style={isDisabled ? {} : {
            y: bgY,
            scale: bgScale,
            opacity: bgOpacity,
            transform: "translate3d(0, 0, 0)",
            willChange: "transform, opacity"
          }}
        >
          {backgroundContent}
        </motion.div>
      )}

      {/* Gradient background overlay */}
      {backgroundGradient && (
        <motion.div
          className={cn(
            "absolute inset-0 -z-10 pointer-events-none",
            backgroundGradient
          )}
          style={isDisabled ? {} : {
            y: bgY,
            transform: "translate3d(0, 0, 0)"
          }}
        />
      )}

      {/* Mid Layer - Moderate movement */}
      {midContent && (
        <motion.div
          className="absolute inset-0 -z-5 pointer-events-none hidden md:block"
          style={isDisabled ? {} : {
            y: midY,
            opacity: midOpacity,
            transform: "translate3d(0, 0, 0)",
            willChange: "transform, opacity"
          }}
        >
          {midContent}
        </motion.div>
      )}

      {/* Foreground Layer - Minimal/no movement (main content) */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Therapeutic floating shapes for background decoration
 */
export function TherapeuticShapes({ variant = "hero" }: { variant?: "hero" | "features" }) {
  const prefersReducedMotion = useReducedMotion();

  const shapes = variant === "hero" ? [
    { 
      className: "absolute top-[10%] left-[5%] w-32 h-32 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-3xl",
      delay: 0
    },
    { 
      className: "absolute top-[30%] right-[10%] w-40 h-40 md:w-80 md:h-80 rounded-full bg-gradient-to-bl from-teal-400/10 to-cyan-400/5 blur-3xl",
      delay: 1.5
    },
    { 
      className: "absolute bottom-[20%] left-[15%] w-36 h-36 md:w-72 md:h-72 rounded-full bg-gradient-to-tr from-violet-400/8 to-purple-400/5 blur-3xl",
      delay: 3
    },
    { 
      className: "absolute bottom-[10%] right-[20%] w-28 h-28 md:w-56 md:h-56 rounded-full bg-gradient-to-tl from-rose-400/6 to-pink-400/4 blur-3xl",
      delay: 4.5
    }
  ] : [
    { 
      className: "absolute top-[15%] left-[10%] w-48 h-48 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-[100px]",
      delay: 0
    },
    { 
      className: "absolute bottom-[15%] right-[5%] w-56 h-56 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-bl from-secondary/8 to-transparent blur-[100px]",
      delay: 2
    }
  ];

  if (prefersReducedMotion) {
    return (
      <>
        {shapes.map((shape, i) => (
          <div key={i} className={shape.className} />
        ))}
      </>
    );
  }

  return (
    <>
      {shapes.map((shape, i) => (
        <FloatingElement key={i} className={shape.className} delay={shape.delay} />
      ))}
    </>
  );
}

/**
 * Floating card elements for mid-layer decoration
 */
export function FloatingCards() {
  const prefersReducedMotion = useReducedMotion();

  const cards = [
    {
      className: "absolute top-[20%] left-[8%] w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/5 dark:bg-white/3 backdrop-blur-sm border border-white/10 shadow-lg",
      delay: 0
    },
    {
      className: "absolute top-[40%] right-[12%] w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-primary/5 backdrop-blur-sm border border-primary/10 shadow-lg",
      delay: 1
    },
    {
      className: "absolute bottom-[30%] left-[20%] w-14 h-14 md:w-20 md:h-20 rounded-xl bg-secondary/5 backdrop-blur-sm border border-secondary/10 shadow-lg",
      delay: 2
    },
    {
      className: "absolute bottom-[25%] right-[25%] w-18 h-18 md:w-24 md:h-24 rounded-2xl bg-teal-500/5 backdrop-blur-sm border border-teal-500/10 shadow-lg",
      delay: 3
    }
  ];

  if (prefersReducedMotion) {
    return (
      <>
        {cards.map((card, i) => (
          <div key={i} className={card.className} />
        ))}
      </>
    );
  }

  return (
    <>
      {cards.map((card, i) => (
        <FloatingElement key={i} className={card.className} delay={card.delay} />
      ))}
    </>
  );
}

/**
 * Gentle wave decoration
 */
export function WaveDecoration({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute bottom-0 left-0 w-full h-auto opacity-30", className)}
      viewBox="0 0 1440 120"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d="M0 120L48 105C96 90 192 60 288 52.5C384 45 480 60 576 67.5C672 75 768 75 864 67.5C960 60 1056 45 1152 45C1248 45 1344 60 1392 67.5L1440 75V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
        className="fill-primary/5"
      />
    </svg>
  );
}

export { ParallaxLayer, FloatingElement, PARALLAX_SPEEDS };
