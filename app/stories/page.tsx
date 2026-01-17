"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Bookmark, Star, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const stories = [
    {
        id: "story-1",
        title: "Finding Light in the Darkness",
        author: "Sarah J.",
        category: "Real Stories",
        readTime: "5 min read",
        content: "When I first started experiencing anxiety, I felt completely alone...",
        tags: ["Anxiety", "Recovery"],
    },
    {
        id: "story-2",
        title: "The Power of Small Steps",
        author: "Michael R.",
        category: "Real Stories",
        readTime: "4 min read",
        content: "Depression made getting out of bed feel like climbing a mountain...",
        tags: ["Depression", "Motivation"],
    },
    {
        id: "tip-1",
        title: "5 Grounding Techniques for Panic Attacks",
        author: "Dr. Emily Chen",
        category: "Practical Tips",
        readTime: "3 min read",
        content: "1. The 5-4-3-2-1 Technique. 2. Box Breathing...",
        tags: ["Panic", "Coping Skills"],
    },
    {
        id: "tip-2",
        title: "Building a Sleep Routine",
        author: "MindEase Team",
        category: "Practical Tips",
        readTime: "6 min read",
        content: "Sleep hygiene is crucial for mental health...",
        tags: ["Sleep", "Self Care"],
    },
    {
        id: "story-3",
        title: "My Journey with Social Anxiety",
        author: "Priya K.",
        category: "Real Stories",
        readTime: "7 min read",
        content: "Public speaking used to terrify me to the point of nausea...",
        tags: ["Social Anxiety", "Growth"],
    },
];

export default function StoriesPage() {
    const router = useRouter();
    const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
    const [recommendedId, setRecommendedId] = useState<string | null>(null);

    useEffect(() => {
        // Load bookmarks
        const saved = localStorage.getItem("bookmarked_stories");
        if (saved) {
            setBookmarkedIds(JSON.parse(saved));
        }

        // Simulate AI Recommendation (Random for now)
        // In a real app, fetch from API based on user analysis
        const randomId = stories[Math.floor(Math.random() * stories.length)].id;
        setRecommendedId(randomId);
    }, []);

    const toggleBookmark = (id: string) => {
        const newBookmarks = bookmarkedIds.includes(id)
            ? bookmarkedIds.filter((b) => b !== id)
            : [...bookmarkedIds, id];

        setBookmarkedIds(newBookmarks);
        localStorage.setItem("bookmarked_stories", JSON.stringify(newBookmarks));
    };

    const recommendedStory = stories.find(s => s.id === recommendedId);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
            </div>

            <Container className="relative z-10 pt-8 pb-12 space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-primary" />
                        Stories & Tips
                    </h1>
                </div>

                {/* AI Recommendation */}
                {recommendedStory && (
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Recommended for You
                        </h2>
                        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="mb-2 bg-background/50 backdrop-blur-sm">{recommendedStory.category}</Badge>
                                        <CardTitle className="text-2xl">{recommendedStory.title}</CardTitle>
                                        <CardDescription>By {recommendedStory.author} • {recommendedStory.readTime}</CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleBookmark(recommendedStory.id)}
                                        className={cn("hover:bg-primary/10", bookmarkedIds.includes(recommendedStory.id) && "text-primary")}
                                    >
                                        <Bookmark className={cn("w-5 h-5", bookmarkedIds.includes(recommendedStory.id) && "fill-current")} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="line-clamp-3 text-muted-foreground">{recommendedStory.content}</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full sm:w-auto">Read Full Article</Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 rounded-full">
                        <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
                        <TabsTrigger value="stories" className="rounded-full">Real Stories</TabsTrigger>
                        <TabsTrigger value="tips" className="rounded-full">Practical Tips</TabsTrigger>
                        <TabsTrigger value="bookmarks" className="rounded-full">Bookmarks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {stories.map(story => (
                                <StoryCard key={story.id} story={story} isBookmarked={bookmarkedIds.includes(story.id)} onToggleBookmark={() => toggleBookmark(story.id)} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="stories" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {stories.filter(s => s.category === "Real Stories").map(story => (
                                <StoryCard key={story.id} story={story} isBookmarked={bookmarkedIds.includes(story.id)} onToggleBookmark={() => toggleBookmark(story.id)} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="tips" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {stories.filter(s => s.category === "Practical Tips").map(story => (
                                <StoryCard key={story.id} story={story} isBookmarked={bookmarkedIds.includes(story.id)} onToggleBookmark={() => toggleBookmark(story.id)} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="bookmarks" className="space-y-4">
                        {bookmarkedIds.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No bookmarks yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {stories.filter(s => bookmarkedIds.includes(s.id)).map(story => (
                                    <StoryCard key={story.id} story={story} isBookmarked={bookmarkedIds.includes(story.id)} onToggleBookmark={() => toggleBookmark(story.id)} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </Container>
        </div>
    );
}

function StoryCard({ story, isBookmarked, onToggleBookmark }: { story: any, isBookmarked: boolean, onToggleBookmark: () => void }) {
    return (
        <Card className="hover:shadow-md transition-all duration-300 group">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="mb-2">{story.category}</Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
                        className={cn("h-8 w-8 hover:bg-primary/10", isBookmarked && "text-primary")}
                    >
                        <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                    </Button>
                </div>
                <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">{story.title}</CardTitle>
                <CardDescription className="text-xs">{story.readTime}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground mb-4">{story.content}</p>
                <div className="flex gap-2 flex-wrap">
                    {story.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] px-2 py-1 bg-muted rounded-full text-muted-foreground">#{tag}</span>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
