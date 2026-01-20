export interface ActivityBlueprint {
    id: string;
    name: string;
    type: "game" | "grounding" | "relaxation" | "cognitive" | "expression";
    description: string;
    suitableMoodCategories: string[];
    durationMinutes: number;
    energyLevel: "low" | "medium" | "high";
    interactionType: string;
}

export const ACTIVITY_BLUEPRINTS: ActivityBlueprint[] = [
    {
        id: "breathing",
        name: "Breathing Patterns",
        type: "relaxation",
        description: "Follow calming breathing exercises with visual guidance",
        suitableMoodCategories: ["very_low", "low", "neutral", "high_stress"],
        durationMinutes: 5,
        energyLevel: "low",
        interactionType: "guided",
    },
    {
        id: "garden",
        name: "Zen Garden",
        type: "expression",
        description: "Create and maintain your digital peaceful space",
        suitableMoodCategories: ["low", "neutral", "good"],
        durationMinutes: 10,
        energyLevel: "low",
        interactionType: "creative",
    },
    {
        id: "forest",
        name: "Mindful Forest",
        type: "grounding",
        description: "Take a peaceful walk through a virtual forest",
        suitableMoodCategories: ["very_low", "low", "high_stress"],
        durationMinutes: 15,
        energyLevel: "medium",
        interactionType: "exploration",
    },
    {
        id: "waves",
        name: "Ocean Waves",
        type: "relaxation",
        description: "Match your breath with gentle ocean waves",
        suitableMoodCategories: ["very_low", "neutral", "good"],
        durationMinutes: 8,
        energyLevel: "low",
        interactionType: "guided",
    },
    {
        id: "cloud-letter",
        name: "Cloud Letter",
        type: "cognitive",
        description: "Release your worries into drifting clouds",
        suitableMoodCategories: ["low", "neutral", "overthinking"],
        durationMinutes: 5,
        energyLevel: "low",
        interactionType: "text",
    },
    {
        id: "aura-blender",
        name: "Aura Blender",
        type: "expression",
        description: "Mix colors to find your perfect balance",
        suitableMoodCategories: ["low", "neutral", "good"],
        durationMinutes: 5,
        energyLevel: "low",
        interactionType: "creative",
    },
    {
        id: "lumina-path",
        name: "Lumina Path",
        type: "game",
        description: "Find light in the darkness",
        suitableMoodCategories: ["low", "neutral", "good"],
        durationMinutes: 10,
        energyLevel: "medium",
        interactionType: "game",
    },
    {
        id: "rain-painter",
        name: "Rain Painter",
        type: "grounding",
        description: "Clear the fog on a rainy day",
        suitableMoodCategories: ["very_low", "low", "overthinking"],
        durationMinutes: 5,
        energyLevel: "low",
        interactionType: "creative",
    },
    {
        id: "daily-spark",
        name: "Daily Spark",
        type: "game",
        description: "Collect sparks of positivity",
        suitableMoodCategories: ["neutral", "good", "great"],
        durationMinutes: 5,
        energyLevel: "medium",
        interactionType: "game",
    },
];
