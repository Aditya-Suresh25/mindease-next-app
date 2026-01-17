"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    Trash2,
    Edit2,
    Brain,
    Activity,
    Loader2
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/contexts/session-context";
import { getMoodHistory, deleteMood } from "@/lib/api/mood";
import { getActivities, deleteActivity } from "@/lib/api/activity";
import { MoodForm } from "@/components/mood/mood-form";
import { ActivityLogger } from "@/components/activities/activity-logger";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useSession();
    const [activeTab, setActiveTab] = useState("moods");
    const [timeRange, setTimeRange] = useState("week"); // week, month

    const [moods, setMoods] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit State
    const [editingMood, setEditingMood] = useState<any>(null);
    const [editingActivity, setEditingActivity] = useState<any>(null);
    const [showMoodModal, setShowMoodModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const today = new Date();
            let startDate = startOfDay(subDays(today, 7));

            if (timeRange === "month") {
                startDate = startOfDay(subDays(today, 30));
            }

            const endDate = endOfDay(today);

            const [moodRes, activityRes] = await Promise.all([
                getMoodHistory({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
                getActivities() // generic get, we might filter client side if API doesn't support params yet
            ]);

            if (moodRes.success) setMoods(moodRes.data);

            // Client-side filter for activities if API doesn't support it yet
            // Assuming getActivities returns all or recent. 
            // Ideally API should support range, but for now filtering here.
            if (activityRes.success) {
                const filteredActivities = activityRes.data.filter((a: any) => {
                    const d = new Date(a.timestamp);
                    return d >= startDate && d <= endDate;
                });
                setActivities(filteredActivities);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch history");
        } finally {
            setIsLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        } else if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, loading, router, fetchData]);

    const handleDeleteMood = async (id: string) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            await deleteMood(id);
            toast.success("Mood entry deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete mood");
        }
    };

    const handleDeleteActivity = async (id: string) => {
        if (!confirm("Are you sure you want to delete this activity?")) return;
        try {
            await deleteActivity(id);
            toast.success("Activity log deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete activity");
        }
    };

    const handleEditMood = (mood: any) => {
        setEditingMood(mood);
        setShowMoodModal(true);
    };

    const handleEditActivity = (activity: any) => {
        setEditingActivity(activity);
        setShowActivityModal(true);
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background - reusing from Dashboard */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <Container className="relative z-10 pt-8 pb-12 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-3xl font-bold">History</h1>

                    <div className="ml-auto">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px] bg-card/50 backdrop-blur-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Last 7 Days</SelectItem>
                                <SelectItem value="month">Last 30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto mb-8 bg-muted/30 p-1 rounded-full">
                        <TabsTrigger value="moods" className="rounded-full">Moods</TabsTrigger>
                        <TabsTrigger value="activities" className="rounded-full">Activities</TabsTrigger>
                    </TabsList>

                    <TabsContent value="moods" className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : moods.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No mood logs found for this period.</div>
                        ) : (
                            moods.map((mood) => (
                                <Card key={mood._id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-colors">
                                    <CardContent className="p-6 flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <div className="text-2xl">
                                                    {mood.score >= 75 ? "😃" : mood.score >= 50 ? "😊" : mood.score >= 25 ? "😕" : "😔"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-lg">{mood.score}/100</span>
                                                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                                                        {format(new Date(mood.timestamp), "MMM d, h:mm a")}
                                                    </span>
                                                </div>
                                                {mood.note && <p className="text-muted-foreground text-sm">{mood.note}</p>}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditMood(mood)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteMood(mood._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="activities" className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">No activity logs found for this period.</div>
                        ) : (
                            activities.map((activity) => (
                                <Card key={activity._id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-colors">
                                    <CardContent className="p-6 flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Activity className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-lg capitalize">{activity.name}</span>
                                                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                                                        {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 text-xs text-muted-foreground">
                                                    <span className="capitalize bg-blue-500/5 px-2 py-0.5 rounded-md text-blue-600 dark:text-blue-400">
                                                        {activity.type}
                                                    </span>
                                                    {activity.duration && <span>{activity.duration} mins</span>}
                                                </div>
                                                {activity.description && <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditActivity(activity)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteActivity(activity._id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </Container>

            {/* Mood Edit Modal */}
            <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
                <DialogContent className="sm:max-w-md rounded-[2rem] bg-card/95 backdrop-blur-xl border-primary/10">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">Edit Mood Entry</DialogTitle>
                    </DialogHeader>
                    {editingMood && (
                        <MoodForm
                            initialData={editingMood}
                            onSuccess={() => {
                                setShowMoodModal(false);
                                fetchData();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Activity Edit Modal */}
            {editingActivity && (
                <ActivityLogger
                    open={showActivityModal}
                    onOpenChange={setShowActivityModal}
                    initialData={editingActivity}
                    onSuccess={() => {
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}
