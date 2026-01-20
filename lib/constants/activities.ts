import {
    Wind,
    Flower2,
    TreePine,
    Waves,
    Gamepad2,
    Music2,
} from "lucide-react";

// In a real app, we might share this type or file with backend via a shared package,
// but for now we duplicate the static data structure to avoid monorepo setup complexity.

export const ACTIVITIES = [
    {
        id: "breathing",
        title: "Breathing Patterns",
        description: "Follow calming breathing exercises with visual guidance",
        icon: Wind,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        duration: "5 mins",
    },
    {
        id: "garden",
        title: "Zen Garden",
        description: "Create and maintain your digital peaceful space",
        icon: Flower2,
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
        duration: "10 mins",
    },
    {
        id: "forest",
        title: "Mindful Forest",
        description: "Take a peaceful walk through a virtual forest",
        icon: TreePine,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        duration: "15 mins",
    },
    {
        id: "waves",
        title: "Ocean Waves",
        description: "Match your breath with gentle ocean waves",
        icon: Waves,
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
        duration: "8 mins",
    },
    {
        id: "cloud-letter",
        title: "Cloud Letter",
        description: "Release your worries into drifting clouds",
        icon: Wind,
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
        duration: "5 mins",
    },
    {
        id: "aura-blender",
        title: "Aura Blender",
        description: "Mix colors to find your perfect balance",
        icon: Gamepad2, // Placeholder
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        duration: "5 mins",
    },
    {
        id: "lumina-path",
        title: "Lumina Path",
        description: "Find light in the darkness",
        icon: TreePine, // Placeholder
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        duration: "10 mins",
    },
    {
        id: "rain-painter",
        title: "Rain Painter",
        description: "Clear the fog on a rainy day",
        icon: Waves, // Placeholder
        color: "text-slate-500",
        bgColor: "bg-slate-500/10",
        duration: "5 mins",
    },
    {
        id: "daily-spark",
        title: "Daily Spark",
        description: "Collect sparks of positivity",
        icon: Music2,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        duration: "5 mins",
    },
];
