"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Brain,
  Shield,
  HeartPulse,
  MessageSquareHeart,
  Lightbulb,
  ArrowRight,
  LucideIcon,
  HelpCircle,
} from "lucide-react";
// Assuming you have an Accordion component (e.g., from ShadCN)
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

// --- INTERFACES ---
interface Principle {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  delay: number;
}

// --- DATA: CORE PRINCIPLES (Reusing the AboutMindEase data) ---
const principles: Principle[] = [
  {
    icon: Brain,
    title: "Emotional Intelligence Core",
    description: "Powered by advanced AI models that deeply understand and respond to the nuances of human emotion.",
    color: "from-purple-500/20",
    delay: 0.1,
  },
  {
    icon: MessageSquareHeart,
    title: "Non-Judgmental Space",
    description: "A secure and empathetic environment where you can express any thought or feeling without fear of critique.",
    color: "from-pink-500/20",
    delay: 0.2,
  },
  {
    icon: HeartPulse,
    title: "Holistic Wellness Approach",
    description: "Integrates conversational support with proven mood tracking, mindfulness exercises, and goal setting.",
    color: "from-orange-500/20",
    delay: 0.3,
  },
  {
    icon: Shield,
    title: "Commitment to Ethics",
    description: "Strict adherence to privacy standards and therapeutic guidelines, ensuring your data is safe and your experience is positive.",
    color: "from-blue-500/20",
    delay: 0.4,
  },
];

// --- DATA: FREQUENTLY ASKED QUESTIONS (FAQ) ---
const faqs = [
  {
    question: "Is MindEase a replacement for human therapy?",
    answer: "No. MindEase is an AI companion designed for support, psychoeducation, and emotional self-management. It is not a substitute for professional human therapy, diagnosis, or treatment for serious mental health conditions. We always recommend consulting a licensed professional if you are in crisis or require clinical care.",
  },
  {
    question: "How does MindEase ensure my privacy?",
    answer: "We employ end-to-end encryption for all conversations. Your data is anonymized and never sold. Our AI models are trained with strict privacy controls, ensuring that personal identifying information is protected according to global data standards.",
  },
  {
    question: "What therapeutic methods does the AI use?",
    answer: "MindEase draws on techniques from Cognitive Behavioral Therapy (CBT), Dialectical Behavior Therapy (DBT), and Mindfulness-Based Stress Reduction (MBSR) to provide conversational guidance and coping strategies.",
  },
  {
    question: "How much does MindEase cost?",
    answer: "MindEase offers a robust free tier that includes daily check-ins and basic conversational support. A premium subscription is available for advanced features like specialized wellness programs, mood analytics, and expanded access to third-party integrations.",
  },
  {
    question: "Can I delete my account and all associated data?",
    answer: "Yes, absolutely. You have full control over your data. You can initiate a full and permanent deletion of your account and all stored conversation history directly through your account settings.",
  },
];

// --- ABOUT PAGE COMPONENT ---
const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      
      {/* 2. Core Principles Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-card/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground">Our Guiding Philosophy</h2>
            <p className="text-lg text-muted-foreground">What makes MindEase a truly different kind of companion.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {principles.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: item.delay, duration: 0.6 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <Card className="group relative overflow-hidden border border-primary/10 transition-all duration-300 h-full bg-card shadow-lg">
                  <CardHeader className="pb-4 flex flex-col items-center text-center">
                    <div className="p-4 rounded-full bg-primary/10 mb-3">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold tracking-tight text-lg">
                      {item.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;