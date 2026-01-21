"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectActivities = void 0;
const blueprints_1 = require("../data/blueprints");
const getMoodCategory = (score) => {
    if (score <= 20)
        return "very_low";
    if (score <= 40)
        return "low";
    if (score <= 60)
        return "neutral";
    if (score <= 80)
        return "good";
    return "great";
};
const getReasonTemplate = (category, intensity) => {
    if (intensity >= 4) {
        return "Since you're feeling things intensely right now, these grounding exercises can help you find your center.";
    }
    switch (category) {
        case "very_low":
            return "When energy is low, small, gentle steps are best. These activities are designed to be effortless and soothing.";
        case "low":
            return "It seems like a tough moment. These simple activities can help you process your feelings without overwhelming you.";
        case "neutral":
            return "You're in a balanced space. It's a great time to engage your mind or creativity gently.";
        case "good":
            return "You're doing well! These activities can help you maintain this positive momentum.";
        case "great":
            return "That's wonderful! Use this energy to explore, create, or challenge yourself.";
    }
    return "Here are some suggested activities for you.";
};
const selectActivities = (input) => {
    const category = getMoodCategory(input.moodScore);
    const reason = getReasonTemplate(category, input.intensity);
    const recentIds = new Set(input.recentActivityIds || []);
    // 1. Filter by Category
    let candidates = blueprints_1.ACTIVITY_BLUEPRINTS.filter(a => a.suitableMoodCategories.includes(category));
    // 2. Filter by Intensity (High intensity -> Low Energy/Grounding priority)
    if (input.intensity >= 4) {
        // Prioritize grounding or relaxation
        const calming = candidates.filter(a => a.type === "grounding" || a.type === "relaxation");
        if (calming.length > 0)
            candidates = calming;
    }
    // 3. Remove recently used (Soft filter)
    const freshCandidates = candidates.filter(a => !recentIds.has(a.id));
    if (freshCandidates.length >= 3) {
        candidates = freshCandidates;
    }
    // 4. Shuffle (Deterministic seed could be added, but simple random slice is fine for "AI feel")
    // To keep it strictly deterministic for testing, we could sort by ID, but user wants "AI feel".
    // Let's settle on: Sort by fit (already filtered) then slice.
    // Actually, random shuffle gives variety which users interpret as "intelligence". 
    // But request asked for "Deterministic". Let's stick to stable sort first + rotation based on day?
    // User said: "The end result should be fully deterministic internally"
    // Let's pick based on a simple rotation or just the first matches to be strictly deterministic as requested.
    // "Select top 3 distinct activities".
    return {
        recommendations: candidates.slice(0, 3),
        reason
    };
};
exports.selectActivities = selectActivities;
