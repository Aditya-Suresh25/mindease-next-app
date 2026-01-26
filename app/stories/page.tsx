"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Bookmark, Sparkles, Plus, Heart, Eye, Clock, User, Edit, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/contexts/session-context";
import { getStories, createStory, getMyStories, Story as APIStory } from "@/lib/api/story";
import { toast } from "sonner";

// Realistic dummy stories for fallback/initial display
const dummyStories = [
    {
        id: "story-1",
        title: "Finding Light in the Darkness: My Journey Through Depression",
        author: "@healing_heart",
        category: "Real Stories",
        readTime: "5 min read",
        content: `When I first started experiencing depression, I felt completely alone. The world seemed to lose its color, and even the simplest tasks felt insurmountable. Getting out of bed became a daily battle, and I couldn't understand why I felt so empty when nothing in my life had objectively changed.

It took me months to recognize that what I was experiencing had a name. Depression wasn't just "feeling sad" — it was a persistent fog that clouded everything. The turning point came when I finally opened up to a friend who had been through something similar.

"You don't have to fight this alone," she told me. Those words changed everything.

I started small. Some days, my only goal was to take a shower. Other days, I managed to go for a short walk. I learned to celebrate these tiny victories instead of beating myself up for not doing more.

Therapy helped me understand the patterns in my thinking that kept me stuck. Medication gave me the stability I needed to actually apply what I was learning. But most importantly, I learned that healing isn't linear. There are still hard days, but now I have tools to navigate them.

If you're reading this and struggling, please know: You are not weak. You are not broken. You are fighting a battle that many don't understand, and that takes incredible strength. There is hope, even when you can't see it yet.`,
        tags: ["Depression", "Recovery", "Hope"],
        likes: 247,
        views: 1823,
    },
    {
        id: "story-2",
        title: "The Power of Small Steps: Rebuilding My Life After Burnout",
        author: "@mindful_maya",
        category: "Real Stories",
        readTime: "6 min read",
        content: `Burnout crept up on me slowly, then hit all at once. I was the person who always said yes, always pushed through, always put work first. Until one day, I couldn't anymore.

My body literally refused to cooperate. I'd sit at my desk, staring at my screen, unable to form a single coherent thought. The exhaustion wasn't just physical — it was bone-deep, soul-tired weariness.

Recovery meant unlearning everything I thought I knew about success and productivity. It meant disappointing people. It meant setting boundaries that felt uncomfortable at first.

The biggest lesson? Small steps compound. One day of rest doesn't fix burnout, but 100 days of sustainable habits do. I started with just 10 minutes of doing nothing — no phone, no TV, just sitting. That grew into daily meditation, which grew into better sleep habits, which grew into a completely transformed relationship with work.

Now, two years later, I'm not just surviving — I'm thriving. But I do it differently. I take breaks before I'm exhausted. I say no to protect my yes. I prioritize recovery as much as productivity.

If burnout has you in its grip, remember: you didn't get here overnight, and you won't get out overnight either. But every small step matters. Start with one.`,
        tags: ["Burnout", "Self-Care", "Boundaries"],
        likes: 189,
        views: 1456,
    },
    {
        id: "tip-1",
        title: "5 Grounding Techniques for Panic Attacks That Actually Work",
        author: "Dr. Sarah Chen, Clinical Psychologist",
        category: "Practical Tips",
        readTime: "4 min read",
        content: `Panic attacks can feel overwhelming, but having go-to techniques can help you regain control. Here are five evidence-based grounding methods I recommend to my patients:

**1. The 5-4-3-2-1 Technique**
Engage all your senses: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This pulls your focus away from the panic and into the present moment.

**2. Box Breathing (4-4-4-4)**
Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. This activates your parasympathetic nervous system and helps slow your heart rate. Repeat until you feel calmer.

**3. Cold Water on Wrists**
The shock of cold water on your pulse points can interrupt the panic response. Keep a cold water bottle handy, or splash cold water on your face and wrists.

**4. Progressive Muscle Relaxation**
Starting from your toes, tense each muscle group for 5 seconds, then release. Work your way up to your head. This helps release physical tension that accompanies panic.

**5. The "Safe Place" Visualization**
Close your eyes and imagine a place where you feel completely safe and calm. Engage all your senses in this visualization. Where are you? What do you see, hear, smell, feel?

Remember: Panic attacks, while terrifying, are not dangerous. They will pass. Your body cannot maintain that level of adrenaline indefinitely. Ride the wave, use these techniques, and know that you will be okay.`,
        tags: ["Panic Attacks", "Anxiety", "Coping Skills"],
        likes: 412,
        views: 3241,
    },
    {
        id: "tip-2",
        title: "Building a Sleep Routine: The Foundation of Mental Wellness",
        author: "MindEase Wellness Team",
        category: "Practical Tips",
        readTime: "5 min read",
        content: `Sleep and mental health are deeply interconnected. Poor sleep can trigger or worsen anxiety and depression, while good sleep hygiene can be a powerful tool for emotional regulation. Here's how to build a sleep routine that supports your mental health:

**Set a Consistent Schedule**
Go to bed and wake up at the same time every day, even on weekends. Your body's circadian rhythm thrives on consistency.

**Create a Wind-Down Ritual**
Start dimming lights 1-2 hours before bed. This signals to your brain that it's time to produce melatonin. Consider activities like reading, gentle stretching, journaling, or listening to calming music.

**Optimize Your Environment**
Keep your bedroom cool (65-68°F / 18-20°C), use blackout curtains or an eye mask, consider white noise if you're sensitive to sounds, and reserve your bed for sleep only.

**Manage Light Exposure**
Get bright light exposure in the morning, avoid screens 1 hour before bed or use blue light filters, and use warm, dim lighting in the evening.

**Watch What You Consume**
Avoid caffeine after 2 PM, limit alcohol (it disrupts sleep quality), and don't eat heavy meals close to bedtime.

**Handle Racing Thoughts**
Keep a "worry journal" by your bed. If thoughts keep you awake, write them down with the promise that you'll address them tomorrow. This "parking" technique can help quiet your mind.

Remember: Building new habits takes time. Be patient with yourself and focus on progress, not perfection.`,
        tags: ["Sleep", "Self-Care", "Routine"],
        likes: 356,
        views: 2890,
    },
    {
        id: "story-3",
        title: "My Journey with Social Anxiety: From Hiding to Thriving",
        author: "@brave_introvert",
        category: "Real Stories",
        readTime: "7 min read",
        content: `Public speaking used to terrify me to the point of physical illness. Before presentations, I would shake, sweat, and sometimes cry. I avoided any situation that might put me in the spotlight, which meant missing out on opportunities and connections.

Social anxiety isn't just shyness — it's a constant voice telling you that everyone is judging you, that you'll embarrass yourself, that you don't belong. For years, I believed that voice.

The change started when I began challenging those thoughts. My therapist taught me to ask: "What's the evidence?" When I thought "Everyone thinks I'm stupid," she'd help me examine whether that was really true, or if my anxiety was lying to me.

Exposure therapy was hard but transformative. We started small — making small talk with baristas, asking questions in class, then working up to giving presentations. Each time I didn't die of embarrassment (which was every time), my brain started to learn that these situations weren't actually dangerous.

I also found community with others who understood. Realizing I wasn't alone, that millions of people deal with social anxiety, helped reduce my shame.

Today, I still get nervous before presentations, but it's manageable nervousness, not paralyzing fear. I've given talks to hundreds of people, made meaningful friendships, and even started a career that requires regular public interaction.

Social anxiety doesn't have to control your life. With the right support and gradual exposure, you can expand your comfort zone in ways you never thought possible.`,
        tags: ["Social Anxiety", "Growth", "Therapy"],
        likes: 298,
        views: 2156,
    },
    {
        id: "story-4",
        title: "Healing from Trauma: It's Okay to Take Your Time",
        author: "@phoenix_rising",
        category: "Real Stories",
        readTime: "8 min read",
        content: `Trauma recovery isn't linear. There are no shortcuts, no hacks, no quick fixes. And that's okay.

For a long time, I beat myself up for not healing "fast enough." Other people seemed to move on from difficult experiences while I was still struggling years later. I thought something was wrong with me.

What I've learned is that trauma healing happens in its own time. Your brain and body went through something overwhelming, and they need space to process and integrate that experience. Rushing this process doesn't work — in fact, it can make things worse.

EMDR therapy was a game-changer for me. It helped me process traumatic memories in a way that traditional talk therapy hadn't. But I also had to do the daily work: establishing safety, learning to regulate my nervous system, building a support network.

Some things that helped: somatic experiencing (working with the body, not just the mind), journaling even when it was hard, creating a "safety plan" for triggering situations, being honest with trusted people about what I was going through, and accepting that some days would be harder than others.

If you're healing from trauma, please give yourself grace. Your timeline is your own. The fact that you're still here, still trying, still reading things like this in search of hope — that's strength. That's survival. That's the beginning of healing.`,
        tags: ["Trauma", "Healing", "PTSD"],
        likes: 423,
        views: 3012,
    },
];

interface StoryType {
    id: string;
    title: string;
    author: string;
    category: string;
    readTime: string;
    content: string;
    tags: string[];
    likes: number;
    views: number;
}

interface StoryViewProps {
    story: StoryType;
    onClose: () => void;
}

function StoryViewer({ story, onClose }: StoryViewProps) {
    const [liked, setLiked] = useState(false);
    
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{story.category}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {story.readTime}
                        </span>
                    </div>
                    <DialogTitle className="text-2xl font-bold">{story.title}</DialogTitle>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {story.author}
                        </span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" /> {story.views}
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart className={cn("w-4 h-4", liked && "fill-red-500 text-red-500")} /> {story.likes}
                            </span>
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        {story.content.split('\n\n').map((paragraph, idx) => (
                            <p key={idx} className="mb-4 leading-relaxed text-foreground/90">
                                {paragraph.startsWith('**') ? (
                                    <strong>{paragraph.replace(/\*\*/g, '')}</strong>
                                ) : paragraph}
                            </p>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {story.tags.map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => setLiked(!liked)} className="gap-2">
                        <Heart className={cn("w-4 h-4", liked && "fill-red-500 text-red-500")} />
                        {liked ? "Liked" : "Like This Story"}
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface CreateStoryModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

function CreateStoryModal({ open, onClose, onSuccess }: CreateStoryModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<"real-story" | "practical-tip" | "personal-experience">("personal-experience");
    const [tags, setTags] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (title.length < 5) {
            toast.error("Title must be at least 5 characters");
            return;
        }
        if (content.length < 50) {
            toast.error("Content must be at least 50 characters");
            return;
        }

        setIsSubmitting(true);
        const result = await createStory({
            title,
            content,
            category,
            tags: tags.split(",").map(t => t.trim()).filter(t => t),
            isAnonymous,
            status: "published",
        });
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Story published successfully!");
            onSuccess();
            onClose();
            setTitle("");
            setContent("");
            setCategory("personal-experience");
            setTags("");
            setIsAnonymous(true);
        } else {
            toast.error(result.error || "Failed to publish story");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5 text-primary" />
                        Share Your Story
                    </DialogTitle>
                    <DialogDescription>
                        Share your wellness journey to help and inspire others in the community.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your story a meaningful title..."
                            maxLength={150}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Your Story</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your experience, insights, or tips..."
                            className="min-h-[200px]"
                            maxLength={10000}
                        />
                        <p className="text-xs text-muted-foreground">{content.length}/10000 characters</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={(v: "real-story" | "practical-tip" | "personal-experience") => setCategory(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="personal-experience">Personal Experience</SelectItem>
                                    <SelectItem value="real-story">Real Story</SelectItem>
                                    <SelectItem value="practical-tip">Practical Tips</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="anxiety, recovery, hope"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div>
                            <Label className="text-sm font-semibold">Post Anonymously</Label>
                            <p className="text-xs text-muted-foreground">
                                {isAnonymous ? "Your handle will be shown instead of your name" : "Your full name will be visible"}
                            </p>
                        </div>
                        <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Publish Story
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function StoriesPage() {
    const router = useRouter();
    const { isAuthenticated } = useSession();
    const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
    const [recommendedId, setRecommendedId] = useState<string | null>(null);
    const [selectedStory, setSelectedStory] = useState<StoryType | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stories, setStories] = useState<StoryType[]>(dummyStories);
    const [myStories, setMyStories] = useState<APIStory[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("bookmarked_stories");
        if (saved) {
            setBookmarkedIds(JSON.parse(saved));
        }

        const randomId = dummyStories[Math.floor(Math.random() * dummyStories.length)].id;
        setRecommendedId(randomId);

        loadStories();
    }, []);

    const loadStories = async () => {
        const result = await getStories();
        if (result.success && result.data?.stories.length) {
            const apiStories: StoryType[] = result.data.stories.map(s => ({
                id: s._id,
                title: s.title,
                author: s.authorLabel,
                category: s.category === "real-story" ? "Real Stories" : s.category === "practical-tip" ? "Practical Tips" : "Personal Experience",
                readTime: `${s.readTime} min read`,
                content: s.content,
                tags: s.tags,
                likes: s.likes,
                views: s.views,
            }));
            setStories([...apiStories, ...dummyStories]);
        }
    };

    const loadMyStories = async () => {
        if (!isAuthenticated) return;
        const result = await getMyStories();
        if (result.success && result.stories) {
            setMyStories(result.stories);
        }
    };

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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BookOpen className="w-8 h-8 text-primary" />
                            Stories & Tips
                        </h1>
                    </div>
                    {isAuthenticated && (
                        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Share Your Story
                        </Button>
                    )}
                </div>

                {/* AI Recommendation */}
                {recommendedStory && (
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Recommended for You
                        </h2>
                        <Card 
                            className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 cursor-pointer hover:shadow-lg transition-all"
                            onClick={() => setSelectedStory(recommendedStory)}
                        >
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
                                        onClick={(e) => { e.stopPropagation(); toggleBookmark(recommendedStory.id); }}
                                        className={cn("hover:bg-primary/10", bookmarkedIds.includes(recommendedStory.id) && "text-primary")}
                                    >
                                        <Bookmark className={cn("w-5 h-5", bookmarkedIds.includes(recommendedStory.id) && "fill-current")} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="line-clamp-3 text-muted-foreground">{recommendedStory.content.substring(0, 200)}...</p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {recommendedStory.likes}</span>
                                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {recommendedStory.views}</span>
                                </div>
                                <Button variant="outline">Read Full Story</Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                <Tabs defaultValue="all" className="space-y-6" onValueChange={(v) => v === "my-stories" && loadMyStories()}>
                    <TabsList className="bg-muted/50 p-1 rounded-full">
                        <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
                        <TabsTrigger value="stories" className="rounded-full">Real Stories</TabsTrigger>
                        <TabsTrigger value="tips" className="rounded-full">Practical Tips</TabsTrigger>
                        <TabsTrigger value="bookmarks" className="rounded-full">Bookmarks</TabsTrigger>
                        {isAuthenticated && <TabsTrigger value="my-stories" className="rounded-full">My Stories</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {stories.map(story => (
                                <StoryCard key={story.id} story={story} isBookmarked={bookmarkedIds.includes(story.id)} onToggleBookmark={() => toggleBookmark(story.id)} onClick={() => setSelectedStory(story)} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="stories" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {stories.filter(s => s.category === "Real Stories").map(story => (
                                <StoryCard key={story.id} story={story} isBookmarked={bookmarkedIds.includes(story.id)} onToggleBookmark={() => toggleBookmark(story.id)} onClick={() => setSelectedStory(story)} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="tips" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {stories.filter(s => s.category === "Practical Tips").map(story => (
                                <StoryCard key={story.id} story={story} isBookmarked={bookmarkedIds.includes(story.id)} onToggleBookmark={() => toggleBookmark(story.id)} onClick={() => setSelectedStory(story)} />
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
                                    <StoryCard key={story.id} story={story} isBookmarked={bookmarkedIds.includes(story.id)} onToggleBookmark={() => toggleBookmark(story.id)} onClick={() => setSelectedStory(story)} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {isAuthenticated && (
                        <TabsContent value="my-stories" className="space-y-4">
                            {myStories.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Edit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>You haven't shared any stories yet.</p>
                                    <Button onClick={() => setShowCreateModal(true)} className="mt-4 gap-2">
                                        <Plus className="w-4 h-4" />
                                        Share Your First Story
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {myStories.map(story => (
                                        <StoryCard 
                                            key={story._id} 
                                            story={{
                                                id: story._id,
                                                title: story.title,
                                                author: story.authorLabel,
                                                category: story.category === "real-story" ? "Real Stories" : story.category === "practical-tip" ? "Practical Tips" : "Personal Experience",
                                                readTime: `${story.readTime} min read`,
                                                content: story.content,
                                                tags: story.tags,
                                                likes: story.likes,
                                                views: story.views,
                                            }} 
                                            isBookmarked={false} 
                                            onToggleBookmark={() => {}} 
                                            onClick={() => setSelectedStory({
                                                id: story._id,
                                                title: story.title,
                                                author: story.authorLabel,
                                                category: story.category === "real-story" ? "Real Stories" : story.category === "practical-tip" ? "Practical Tips" : "Personal Experience",
                                                readTime: `${story.readTime} min read`,
                                                content: story.content,
                                                tags: story.tags,
                                                likes: story.likes,
                                                views: story.views,
                                            })} 
                                            showStatus 
                                            status={story.status}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    )}
                </Tabs>
            </Container>

            {/* Story Viewer Modal */}
            {selectedStory && (
                <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} />
            )}

            {/* Create Story Modal */}
            <CreateStoryModal 
                open={showCreateModal} 
                onClose={() => setShowCreateModal(false)} 
                onSuccess={() => {
                    loadStories();
                    loadMyStories();
                }}
            />
        </div>
    );
}

function StoryCard({ story, isBookmarked, onToggleBookmark, onClick, showStatus, status }: { 
    story: StoryType, 
    isBookmarked: boolean, 
    onToggleBookmark: () => void,
    onClick: () => void,
    showStatus?: boolean,
    status?: string
}) {
    return (
        <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer" onClick={onClick}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="mb-2">{story.category}</Badge>
                        {showStatus && status && (
                            <Badge variant={status === "published" ? "default" : "outline"} className="mb-2 capitalize">
                                {status}
                            </Badge>
                        )}
                    </div>
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
                <CardDescription className="text-xs flex items-center gap-2">
                    <span>{story.author}</span>
                    <span>•</span>
                    <span>{story.readTime}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground mb-4">{story.content.substring(0, 150)}...</p>
                <div className="flex gap-2 flex-wrap mb-4">
                    {story.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[10px] px-2 py-1 bg-muted rounded-full text-muted-foreground">#{tag}</span>
                    ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {story.likes}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {story.views}</span>
                </div>
            </CardContent>
        </Card>
    )
}
