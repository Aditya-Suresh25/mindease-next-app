"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Wind, Flower2, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface RecommendationCardProps {
    title: string;
    description: string;
    type: "activity" | "article" | "resource";
    link: string;
    actionLabel?: string;
}

export function RecommendationCard({ title, description, type, link, actionLabel = "Try Now" }: RecommendationCardProps) {
    const router = useRouter();

    let Icon = Sparkles;
    let bgClass = "bg-primary/5 border-primary/20";
    let iconClass = "text-primary";

    if (type === "activity") {
        Icon = Gamepad2;
        bgClass = "bg-blue-500/5 border-blue-500/20";
        iconClass = "text-blue-500";
    } else if (type === "article") {
        Icon = Wind; // Placeholder
        bgClass = "bg-amber-500/5 border-amber-500/20";
        iconClass = "text-amber-500";
    }

    return (
        <Card className={cn("w-full max-w-sm mt-2 mb-4 overflow-hidden border", bgClass)}>
            <CardContent className="p-4">
                <div className="flex gap-3">
                    <div className={cn("p-2 rounded-full h-fit bg-background/50", iconClass)}>
                        <Icon size={18} />
                    </div>
                    <div className="space-y-1 flex-1">
                        <h4 className="font-semibold text-sm">{title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-7 px-0 mt-2 hover:bg-transparent p-0 text-xs font-medium flex items-center gap-1", iconClass)}
                            onClick={() => router.push(link)}
                        >
                            {actionLabel} <ArrowRight size={12} />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
