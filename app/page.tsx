"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
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
import { TestimonialsSection } from "@/components/landing/testimonials-section";

// 1. IMPORT BETTER FONTS
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export default function Home() {
  const router = useRouter();
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

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: 'Create Your Account',
      description: 'Sign up for free in seconds. No credit card required, just your commitment to wellness.',
      numberBg: 'bg-gradient-to-br from-primary to-secondary',
      iconColors: 'text-primary border-primary/20',
      delay: 0.1,
    },
    {
      number: 2,
      icon: Edit,
      title: 'Choose Your Tools',
      description: 'Select from chatbot, mood tracking, music, games, and more based on your needs.',
      numberBg: 'bg-gradient-to-br from-secondary to-primary',
      iconColors: 'text-secondary border-secondary/20',
      delay: 0.2,
    },
    {
      number: 3,
      icon: CheckCircle,
      title: 'Start Your Journey',
      description: 'Begin using the tools and track your progress. Get support whenever you need it.',
      numberBg: 'bg-gradient-to-br from-primary/90 to-primary',
      iconColors: 'text-primary border-primary/20',
      delay: 0.3,
    },
  ];

  return (
    // APPLY FONTS GLOBALLY HERE
    <div className={`flex flex-col min-h-screen overflow-hidden ${jakarta.variable} ${inter.variable} font-sans`}>
      
      {/* Hero Section */}
      <section className="relative min-h-[92vh] mt-20 flex flex-col items-center justify-center py-20 px-6">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className={`absolute w-[600px] h-[600px] rounded-full blur-3xl top-0 -left-20 transition-all duration-700 ease-in-out
            bg-gradient-to-r ${currentEmotion.color} to-transparent opacity-60`}
          />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl bottom-0 right-0 animate-pulse delay-700" />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
        </div>
        <Ripple className="opacity-60" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative space-y-10 text-center max-w-5xl mx-auto"
        >
          {/* Badge: Larger text and padding */}
          <div className="inline-flex items-center gap-3 rounded-full px-6 py-2.5 text-base font-medium border border-primary/20 bg-primary/5 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
            <Waves className="w-5 h-5 animate-wave text-primary" />
            <span className="relative text-foreground/90 dark:text-foreground">
              Your AI Agent Mental Health Companion
            </span>
          </div>

          {/* Heading: Much bigger (Text-5xl mobile, Text-8xl desktop) */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-heading tracking-tight leading-[1.1]">
            <span className="inline-block bg-gradient-to-r from-[#7eb89e] via-[#6bb5a4] to-[#5ba8a0] bg-clip-text text-transparent pb-2 dark:from-[#8ed4b8] dark:via-[#7cc9b5] dark:to-[#6bbfb2]">
              Find Peace
            </span>
            <br />
            <span className="inline-block mt-2 bg-gradient-to-b from-foreground via-foreground/95 to-foreground/85 bg-clip-text text-transparent">
              of Mind
            </span>
          </h1>

          {/* Description: Larger text (text-xl) and wider container */}
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
            Experience a new way of emotional support. Our AI companion is here
            to listen, understand, and guide you through life's journey.
          </p>

          {/* Emotion Slider: Larger interaction area */}
          <motion.div
            className="w-full max-w-3xl mx-auto space-y-8 py-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="space-y-4 text-center">
              <p className="text-lg text-muted-foreground/80 font-medium">
                Whatever you're feeling, we're here to listen
              </p>
              <div className="flex justify-between items-center px-2 md:px-4">
                {emotions.map((em) => (
                  <div
                    key={em.value}
                    className={`transition-all duration-500 ease-out cursor-pointer hover:scale-105 p-2 ${Math.abs(emotion - em.value) < 15
                      ? "opacity-100 scale-110 transform-gpu"
                      : "opacity-50 scale-100"
                      }`}
                    onClick={() => setEmotion(em.value)}
                  >
                    <div className="text-4xl md:text-5xl transform-gpu mb-2">
                      {em.label.split(" ")[0]}
                    </div>
                    <div className="text-sm md:text-base text-muted-foreground font-semibold hidden sm:block">
                      {em.label.split(" ")[1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative px-4">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentEmotion.color} to-transparent blur-3xl -z-10 transition-all duration-500`}
              />
              <Slider
                value={[emotion]}
                onValueChange={(value) => setEmotion(value[0])}
                min={0}
                max={100}
                step={1}
                className="py-6 cursor-pointer"
              />
            </div>
          </motion.div>

          {/* CTA Button: Bigger height (h-14) and text */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <Button
              size="lg"
              onClick={() => setShowDialog(true)}
              className="relative group h-16 px-10 rounded-full bg-gradient-to-r from-primary via-primary/90 to-secondary hover:to-primary shadow-xl shadow-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30"
            >
              <span className="relative z-10 text-xl font-bold flex items-center gap-3">
                Begin Your Journey
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-size-200 bg-pos-0 group-hover:bg-pos-100" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Ecosystem Section */}
      <EcosystemSection />

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="bg-gradient-to-b from-background/50 to-background relative py-24 md:py-40 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full blur-[120px] bg-primary/10 opacity-50"></div>
        <div className="absolute bottom-1/4 right-0 w-[450px] h-[450px] rounded-full blur-[120px] bg-secondary/10 opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20 md:mb-28"
          >
            <div className="inline-flex items-center gap-2 border px-6 py-2.5 rounded-full mb-8 shadow-sm bg-card border-primary/20">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold text-primary/90">
                Simple & Effective
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-8 font-heading">
              How
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7eb89e] via-[#6bb5a4] to-[#5ba8a0] dark:from-[#8ed4b8] dark:via-[#7cc9b5] dark:to-[#6bbfb2] ml-2 sm:ml-3">
                MindEase Works
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get started with mental wellness support in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-full"></div>

            {steps.map((step) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: step.delay }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-3xl transition-colors duration-300 hover:bg-card/30">
                  {/* Number Badge */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 md:mb-8 shadow-xl relative z-10 ${step.numberBg} group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-card border-2 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 md:mb-8 shadow-lg ${step.iconColors}`}>
                    {React.createElement(step.icon, { className: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12' })}
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-4 font-heading">{step.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-[280px] sm:max-w-none">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="border rounded-[2.5rem] p-12 md:p-20 shadow-2xl max-w-5xl mx-auto bg-gradient-to-br from-card to-card/50 border-primary/10 relative overflow-hidden">
               {/* Decorative blobs */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
               
              <h3 className="relative z-10 text-3xl md:text-5xl font-bold text-foreground mb-6 font-heading">
                Ready to prioritize your mental wellness?
              </h3>
              <p className="relative z-10 text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who are taking control of their emotional well-being with MindEase.
              </p>
              
              <div className="relative z-10 flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/signup" passHref legacyBehavior>
                  <button className="text-white px-12 py-5 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-primary via-primary/90 to-secondary hover:to-primary shadow-primary/25">
                    Get Started for Free
                    <ArrowRight className="w-6 h-6" strokeWidth={3} />
                  </button>
                </Link>

                <Link href="/learn-more" passHref>
                  <button className="bg-card/80 backdrop-blur-sm border-2 px-12 py-5 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-primary/20 text-primary hover:border-primary/40">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] p-8 bg-card/95 backdrop-blur-xl border-primary/10">
          <DialogHeader>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pt-4"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                {welcomeSteps[currentStep] && (
                  <div>
                    {React.createElement(welcomeSteps[currentStep].icon, {
                      className: "w-10 h-10 text-primary",
                    })}
                  </div>
                )}
              </div>
              <DialogTitle className="text-3xl text-center font-heading font-bold">
                {welcomeSteps[currentStep]?.title}
              </DialogTitle>
              <DialogDescription className="text-center text-lg leading-relaxed text-muted-foreground">
                {welcomeSteps[currentStep]?.description}
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          <div className="flex justify-between items-center mt-10">
            <div className="flex gap-3">
              {welcomeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2.5 rounded-full transition-all duration-300 ${index === currentStep ? "bg-primary w-8" : "bg-primary/20 w-2.5"
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
                  router.push("/signup");
                }
              }}
              className="relative group px-8 h-12 text-lg rounded-full"
            >
              <span className="flex items-center gap-2">
                {currentStep === welcomeSteps.length - 1 ? (
                  <>
                    Let's Begin
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
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