"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
// Assuming these are wrappers for Radix components tailored to your project's styling (like ShadCN)
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"; 

// --- FAQ Data (Moved outside the component for better performance) ---
interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
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

// --- NEXT.JS PAGE COMPONENT ---
// Renamed to follow common convention (e.g., FaqPage) but exported as default
const FaqPage: React.FC = () => {
    return (
        <div className="min-h-screen pt-16"> 
            <section className="py-20 px-4 bg-background">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <HelpCircle className="w-8 h-8 text-primary mx-auto mb-4" />
                        <h2 className="text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
                        <p className="text-lg text-muted-foreground">Quick answers to common questions about our service and ethics.</p>
                    </motion.div>

                    {/* Accordion List */}
                    {/* Note: The Accordion components are assumed to be client components, which is why this file needs "use client". */}
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index, duration: 0.5 }}
                                viewport={{ once: true }}
                            >
                                <AccordionItem value={`item-${index}`} className="border-b border-primary/10 bg-card p-4 rounded-xl shadow-md">
                                    <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline text-foreground">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        ))}
                    </Accordion>
                </div>
            </section>
        </div>
    );
};

export default FaqPage;