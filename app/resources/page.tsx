"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, ExternalLink, ShieldAlert } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const helplines = [
    {
        name: "Vandrevala Foundation",
        number: "1860-266-2345",
        description: "24/7 multilingual support for mental health crises.",
        tags: ["24/7", "Multilingual"],
    },
    {
        name: "Kiran (national helpline)",
        number: "1800-599-0019",
        description: "Government of India's 24/7 mental health rehabilitation helpline.",
        tags: ["Government", "24/7"],
    },
    {
        name: "iCall (TISS)",
        number: "9152987821",
        description: "Psychosocial support by TISS. Available Mon-Sat, 8 AM - 10 PM.",
        tags: ["Counseling", "Youth Focused"],
    },
    {
        name: "AASRA",
        number: "+91-9820466726",
        description: "24/7 helpline for suicide prevention and emotional distress.",
        tags: ["Suicide Prevention", "24/7"],
    },
];

export default function ResourcesPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background - Consistent with other pages */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <Container className="relative z-10 pt-8 pb-12 space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-rose-500" />
                        Emergency Resources
                    </h1>
                </div>

                <div className="p-6 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
                    <p className="text-lg font-medium text-rose-700 dark:text-rose-300">
                        Disclaimer: MindEase is an AI assistant and not a replacement for professional help.
                        If you are in immediate danger or a medical emergency, please call 112 or go to the nearest hospital immediately.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {helplines.map((helpline) => (
                        <Card key={helpline.name} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{helpline.name}</CardTitle>
                                    <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-green-500/50 text-green-600 hover:bg-green-500/10" asChild>
                                        <a href={`tel:${helpline.number.replace(/-/g, "").replace(/\s/g, "")}`}>
                                            <Phone className="w-5 h-5" />
                                        </a>
                                    </Button>
                                </div>
                                <CardDescription className="mt-2 text-base">{helpline.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-2xl font-bold text-foreground tracking-tight">{helpline.number}</div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {helpline.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="rounded-full px-3">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center text-muted-foreground text-sm pt-8">
                    These resources are verified for India. Standard call rates may apply.
                </div>
            </Container>
        </div>
    );
}
