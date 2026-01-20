"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Settings,
    Bell,
    Lock,
    Moon,
    Sun,
    Globe,
    LogOut,
    Save,
    Loader2,
    Shield
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { API_BASE, getAuthHeaders } from "@/lib/api/base";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
    const router = useRouter();

    const { theme, setTheme } = useTheme();

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        notifications: {
            email: true,
            push: true,
            dailyCheckIn: true
        },
        privacySettings: {
            publicProfile: false,
            shareDataForResearch: true
        },
        preferences: {
            theme: "system", // light, dark, system
            language: "en"
        }
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    // Merge with defaults to handle missing fields on old users
                    setProfile(prev => ({
                        ...prev,
                        ...data.user,
                        notifications: { ...prev.notifications, ...(data.user.notifications || {}) },
                        privacySettings: { ...prev.privacySettings, ...(data.user.privacySettings || {}) },
                        preferences: { ...prev.preferences, ...(data.user.preferences || {}) }
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(profile)
            });

            if (res.ok) {
                toast.success("Settings saved", {
                    description: "Your preferences have been updated. 🌸",
                });
                // Update local storage user if needed, or just rely on state
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast.error("Couldn't save settings", {
                description: "Please try again in a moment. 🌿",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout`, { method: "POST", headers: getAuthHeaders() });
        } catch (e) { }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            <Container className="pt-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Settings className="w-8 h-8 text-primary" />
                            Settings
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage your account preferences and privacy</p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </Button>
                </div>

                <Tabs defaultValue="profile" className="w-full space-y-6">
                    <TabsList className="bg-muted/50 p-1 rounded-full w-full justify-start overflow-x-auto text-nowrap">
                        <TabsTrigger value="profile" className="rounded-full gap-2 px-6"><User className="w-4 h-4" /> Profile</TabsTrigger>
                        <TabsTrigger value="notifications" className="rounded-full gap-2 px-6"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
                        <TabsTrigger value="privacy" className="rounded-full gap-2 px-6"><Lock className="w-4 h-4" /> Privacy</TabsTrigger>
                        <TabsTrigger value="preferences" className="rounded-full gap-2 px-6"><Globe className="w-4 h-4" /> Appearance</TabsTrigger>
                    </TabsList>

                    {/* PROFILE TAB */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your personal details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="w-20 h-20 border-2 border-primary/20">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name}`} />
                                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Button variant="outline" size="sm">Change Avatar</Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        value={profile.email}
                                        disabled
                                        className="bg-muted text-muted-foreground"
                                    />
                                    <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive/20 bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>Actions that cannot be undone.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="destructive" onClick={handleLogout} className="gap-2">
                                    <LogOut className="w-4 h-4" /> Log Out
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NOTIFICATIONS TAB */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Choose how you want to be notified.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Receive weekly summaries and important alerts.</p>
                                    </div>
                                    <Switch
                                        checked={profile.notifications.email}
                                        onCheckedChange={(c: boolean) => setProfile({ ...profile, notifications: { ...profile.notifications, email: c } })}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Push Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Get real-time updates on your device.</p>
                                    </div>
                                    <Switch
                                        checked={profile.notifications.push}
                                        onCheckedChange={(c: boolean) => setProfile({ ...profile, notifications: { ...profile.notifications, push: c } })}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Daily Check-in Reminder</Label>
                                        <p className="text-sm text-muted-foreground">A gentle nudge to log your mood at 8 PM.</p>
                                    </div>
                                    <Switch
                                        checked={profile.notifications.dailyCheckIn}
                                        onCheckedChange={(c: boolean) => setProfile({ ...profile, notifications: { ...profile.notifications, dailyCheckIn: c } })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PRIVACY TAB */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy & Data</CardTitle>
                                <CardDescription>Manage your data sharing and visibility.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Public Profile</Label>
                                        <p className="text-sm text-muted-foreground">Allow others to find your profile (Achievements only).</p>
                                    </div>
                                    <Switch
                                        checked={profile.privacySettings.publicProfile}
                                        onCheckedChange={(c: boolean) => setProfile({ ...profile, privacySettings: { ...profile.privacySettings, publicProfile: c } })}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Share Anonymous Data</Label>
                                        <p className="text-sm text-muted-foreground">Help improve MindEase by sharing anonymous usage stats.</p>
                                    </div>
                                    <Switch
                                        checked={profile.privacySettings.shareDataForResearch}
                                        onCheckedChange={(c: boolean) => setProfile({ ...profile, privacySettings: { ...profile.privacySettings, shareDataForResearch: c } })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PREFERENCES TAB */}
                    <TabsContent value="preferences" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize the look and feel of MindEase.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-2">
                                    <Label>Theme</Label>
                                    <div className="flex gap-4">
                                        <div
                                            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 ${profile.preferences.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                            onClick={() => { setProfile({ ...profile, preferences: { ...profile.preferences, theme: 'light' } }); setTheme('light'); }}
                                        >
                                            <Sun className="w-6 h-6" />
                                            <span className="text-sm font-medium">Light</span>
                                        </div>
                                        <div
                                            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 ${profile.preferences.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                            onClick={() => { setProfile({ ...profile, preferences: { ...profile.preferences, theme: 'dark' } }); setTheme('dark'); }}
                                        >
                                            <Moon className="w-6 h-6" />
                                            <span className="text-sm font-medium">Dark</span>
                                        </div>
                                        <div
                                            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 ${profile.preferences.theme === 'system' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                            onClick={() => { setProfile({ ...profile, preferences: { ...profile.preferences, theme: 'system' } }); setTheme('system'); }}
                                        >
                                            <Settings className="w-6 h-6" />
                                            <span className="text-sm font-medium">System</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </Container>
        </div>
    );
}
