"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Brain,
  Shield,
  Waves,
  ArrowRight,
  HeartPulse,
  Lightbulb,
  Lock,
  MessageSquareHeart,
  Sparkles,
  CheckCircle,
  UserPlus,
  Edit,
  Clock,
} from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import React from "react";
import { Ripple } from "@/components/ui/ripple";
import { EcosystemSection } from "@/components/landing/ecosystem-section";
import { 
  ParallaxSection, 
  TherapeuticShapes, 
  FloatingCards,
  WaveDecoration 
} from "@/components/ui/parallax-section";

export default function Home() {
  const emotions = [
    { value: 0, label: "😔 Down", color: "from-blue-500/50" },
    { value: 25, label: "😊 Content", color: "from-green-500/50" },
    { value: 50, label: "😌 Peaceful", color: "from-purple-500/50" },
    { value: 75, label: "🤗 Happy", color: "from-yellow-500/50" },
    { value: 100, label: "✨ Excited", color: "from-pink-500/50" },
  ];

  const [emotion, setEmotion] = useState(50);
  const [mounted, setMounted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Parallax scroll hooks
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Subtle parallax transforms for hero
  const heroBackgroundY = useTransform(heroScrollProgress, [0, 1], [0, 100]);
  const heroMidLayerY = useTransform(heroScrollProgress, [0, 1], [0, 60]);
  const heroContentY = useTransform(heroScrollProgress, [0, 1], [0, 30]);
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.8], [1, 0.3]);

  const welcomeSteps = [
    {
      title: "Hi, I'm MindEase 👋",
      description:
        "Your AI companion for emotional well-being. I'm here to provide a safe, judgment-free space for you to express yourself.",
      icon: Waves,
    },
    {
      title: "Personalized Support 🌱",
      description:
        "I adapt to your needs and emotional state, offering evidence-based techniques and gentle guidance when you need it most.",
      icon: Brain,
    },
    {
      title: "Your Privacy Matters 🛡️",
      description:
        "Our conversations are completely private and secure. I follow strict ethical guidelines and respect your boundaries.",
      icon: Shield,
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentEmotion =
    emotions.find((em) => Math.abs(emotion - em.value) < 15) || emotions[2];

  const features = [
    {
      icon: HeartPulse,
      title: "24/7 Support",
      description: "Always here to listen and support you, any time of day",
      color: "from-rose-500/20",
      delay: 0.2,
    },
    {
      icon: Lightbulb,
      title: "Smart Insights",
      description: "Personalized guidance powered by emotional intelligence",
      color: "from-amber-500/20",
      delay: 0.4,
    },
    {
      icon: Lock,
      title: "Private & Secure",
      description: "Your conversations are always confidential and encrypted",
      color: "from-emerald-500/20",
      delay: 0.6,
    },
    {
      icon: MessageSquareHeart,
      title: "Evidence-Based",
      description: "Therapeutic techniques backed by clinical research",
      color: "from-blue-500/20",
      delay: 0.8,
    },
  ];


  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: 'Create Your Account',
      description: 'Sign up for free in seconds. No credit card required, just your commitment to wellness.',
      numberBg: 'bg-gradient-to-br from-primary to-secondary', // FIX: Theme color
      iconColors: 'text-primary border-primary/20', // FIX: Theme color
      delay: 0.1,
    },
    {
      number: 2,
      icon: Edit,
      title: 'Choose Your Tools',
      description: 'Select from chatbot, mood tracking, music, games, and more based on your needs.',
      numberBg: 'bg-gradient-to-br from-secondary to-primary', // FIX: Theme color
      iconColors: 'text-secondary border-secondary/20', // FIX: Theme color
      delay: 0.2,
    },
    {
      number: 3,
      icon: CheckCircle,
      title: 'Start Your Journey',
      description: 'Begin using the tools and track your progress. Get support whenever you need it.',
      numberBg: 'bg-gradient-to-br from-primary/90 to-primary', // FIX: Theme color
      iconColors: 'text-primary border-primary/20', // FIX: Theme color
      delay: 0.3,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Hero Section with Parallax */}
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] mt-20 flex flex-col items-center justify-center py-12 px-4 overflow-hidden"
      >
        {/* === BACKGROUND LAYER - Slowest parallax movement === */}
        <motion.div 
          className="absolute inset-0 -z-20 overflow-hidden"
          style={prefersReducedMotion ? {} : {
            y: heroBackgroundY,
            willChange: "transform"
          }}
        >
          {/* Therapeutic floating shapes */}
          <TherapeuticShapes variant="hero" />
          
          {/* Dynamic emotion-based gradient */}
          <motion.div
            className={`absolute w-[500px] h-[500px] rounded-full blur-3xl top-0 -left-20 transition-all duration-700 ease-in-out
            bg-gradient-to-r ${currentEmotion.color} to-transparent opacity-40`}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl bottom-0 right-0"
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Soft overlay for depth */}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-3xl" />
        </motion.div>

        {/* === MID LAYER - Floating cards with moderate parallax === */}
        <motion.div
          className="absolute inset-0 -z-10 pointer-events-none hidden md:block"
          style={prefersReducedMotion ? {} : {
            y: heroMidLayerY,
            opacity: heroOpacity,
            willChange: "transform, opacity"
          }}
        >
          <FloatingCards />
        </motion.div>

        {/* Ripple effect */}
        <Ripple className="opacity-40" />

        {/* === FOREGROUND LAYER - Main content with minimal movement === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative space-y-8 text-center z-10"
          style={prefersReducedMotion ? {} : {
            y: heroContentY,
            willChange: "transform"
          }}
        >
          {/* Enhanced badge with subtle animation */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm border border-primary/20 bg-primary/5 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
            <Waves className="w-4 h-4 animate-wave text-primary" />
            <span className="relative text-foreground/90 dark:text-foreground after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-primary/30 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">
              Your AI Agent Mental Health Companion
            </span>
          </div>

          {/* Enhanced main heading with smoother gradient */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-plus-jakarta tracking-tight">
            <span className="inline-block bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] hover:to-primary transition-all duration-300">
              Find Peace
            </span>
            <br />
            <span className="inline-block mt-2 bg-gradient-to-b from-foreground to-foreground/90 bg-clip-text text-transparent">
              of Mind
            </span>
          </h1>

          {/* Enhanced description with better readability */}
          <p className="max-w-[600px] mx-auto text-base md:text-lg text-muted-foreground leading-relaxed tracking-wide">
            Experience a new way of emotional support. Our AI companion is here
            to listen, understand, and guide you through life's journey.
          </p>

          {/* Emotion slider section with enhanced transitions */}
          <motion.div
            className="w-full max-w-[600px] mx-auto space-y-6 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground/80 font-medium">
                Whatever you're feeling, we're here to listen
              </p>
              <div className="flex justify-between items-center px-2">
                {emotions.map((em) => (
                  <div
                    key={em.value}
                    className={`transition-all duration-500 ease-out cursor-pointer hover:scale-105 ${Math.abs(emotion - em.value) < 15
                      ? "opacity-100 scale-110 transform-gpu"
                      : "opacity-50 scale-100"
                      }`}
                    onClick={() => setEmotion(em.value)}
                  >
                    <div className="text-2xl transform-gpu">
                      {em.label.split(" ")[0]}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">
                      {em.label.split(" ")[1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced slider with dynamic gradient */}
            <div className="relative px-2">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentEmotion.color} to-transparent blur-2xl -z-10 transition-all duration-500`}
              />
              <Slider
                value={[emotion]}
                onValueChange={(value) => setEmotion(value[0])}
                min={0}
                max={100}
                step={1}
                className="py-4"
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground animate-pulse">
                Slide to express how you're feeling today
              </p>
            </div>
          </motion.div>

          {/* Enhanced CTA button and welcome dialog */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Button
              size="lg"
              onClick={() => setShowDialog(true)}
              className="relative group h-12 px-8 rounded-full bg-gradient-to-r from-primary via-primary/90 to-secondary hover:to-primary shadow-lg shadow-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/30"
            >
              <span className="relative z-10 font-medium flex items-center gap-2">
                Begin Your Journey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-size-200 bg-pos-0 group-hover:bg-pos-100" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Enhanced scroll indicator with parallax fade */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={prefersReducedMotion ? {} : { opacity: heroOpacity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/20 flex items-start justify-center p-1 hover:border-primary/40 transition-colors duration-300">
            <div className="w-1 h-2 rounded-full bg-primary animate-scroll" />
          </div>
        </motion.div>
        
        {/* Gentle wave at bottom of hero */}
        <WaveDecoration className="z-0" />
      </section>

      {/* Ecosystem Section - Replaces Features Grid */}
      <EcosystemSection />

      {/* How It Works Section - WITH PARALLAX */}
      <ParallaxSection
        className="bg-gradient-to-b from-background/50 to-background relative py-20 md:py-32"
        backgroundContent={<TherapeuticShapes variant="features" />}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <div
              // FIX: Uses card background and primary border/text
              className="inline-flex items-center gap-2 border px-4 py-2 rounded-full mb-6 shadow-sm bg-card border-primary/20"
            >
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary/90">
                Simple & Effective
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How
              <span
                // FIX: Uses primary/secondary gradient
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-secondary"
              >
                {' MindEase Works'}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with mental wellness support in three simple steps
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">

            {/* Connecting Lines (Desktop) */}
            <div
              // FIX: Line uses primary/secondary gradient
              className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30"
            ></div>

            {steps.map((step) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: step.delay }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">

                  {/* Number Badge (uses step.numberBg) */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg relative z-10 ${step.numberBg}`}
                  >
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>

                  {/* Icon (uses step.iconColors) */}
                  <div
                    // FIX: Uses card background
                    className={`w-20 h-20 bg-card border-2 rounded-2xl flex items-center justify-center mb-6 shadow-md ${step.iconColors}`}
                  >
                    {/* Dynamically render icon component */}
                    {React.createElement(step.icon, { className: 'w-10 h-10' })}
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 md:mt-20 text-center"
          >
            <div
              // FIX: Uses card background and primary border
              className="border rounded-3xl p-8 md:p-12 shadow-xl max-w-4xl mx-auto bg-gradient-to-br from-card to-card/50 border-primary/10"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to prioritize your mental wellness?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who are taking control of their emotional well-being with MindEase.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Primary Button */}
                <Link
                  href="/signup"
                  passHref
                  legacyBehavior // Recommended when wrapping a custom inner element like <button>
                >
                  <button
                    // FIX: Matches your Hero CTA button colors
                    className="text-white px-10 py-4 rounded-full text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-primary/90 to-secondary hover:to-primary shadow-primary/20 hover:shadow-primary/30"
                  >
                    Get Started for Free
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </Link>


                {/* Secondary Button: WRAPPED WITH LINK */}
                <Link
                  href="/learn-more" // <--- TARGET ROUTE FOR YOUR FAQ PAGE
                  passHref
                >
                  <button
                    // FIX: Matches your standard outline style
                    className="bg-card border-2 px-10 py-4 rounded-full text-base font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-primary/20 text-primary hover:border-primary/40"
                  >
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </ParallaxSection>


      {/* Dialog (Your Original Code) */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-lg">
          <DialogHeader>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {welcomeSteps[currentStep] && (
                  <div>
                    {React.createElement(welcomeSteps[currentStep].icon, {
                      className: "w-8 h-8 text-primary",
                    })}
                  </div>
                )}
              </div>
              <DialogTitle className="text-2xl text-center">
                {welcomeSteps[currentStep]?.title}
              </DialogTitle>
              <DialogDescription className="text-center text-base leading-relaxed">
                {welcomeSteps[currentStep]?.description}
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-2">
              {welcomeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStep ? "bg-primary w-4" : "bg-primary/20"
                    }`}
                />
              ))}
            </div>
            <Button
              onClick={() => {
                if (currentStep < welcomeSteps.length - 1) {
                  setCurrentStep((c) => c + 1);
                } else {
                  setShowDialog(false);
                  setCurrentStep(0);
                  // Here you would navigate to the chat interface
                }
              }}
              className="relative group px-6"
            >
              <span className="flex items-center gap-2">
                {currentStep === welcomeSteps.length - 1 ? (
                  <>
                    Let's Begin
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>


  );
}