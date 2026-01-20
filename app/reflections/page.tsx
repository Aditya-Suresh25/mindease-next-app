"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateReport, getReports, ReflectionReport } from "@/lib/api/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportViewer } from "@/components/reflections/report-viewer";
import { GeneratingOverlay } from "@/components/reflections/generating-overlay";
import { 
    Loader2, 
    Plus, 
    FileText, 
    ChevronRight, 
    AlertCircle, 
    ArrowLeft,
    Sparkles,
    Calendar,
    Clock,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

export default function ReflectionsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<ReflectionReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReflectionReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [period, setPeriod] = useState<"7_days" | "14_days" | "30_days">("7_days");
    const [generationError, setGenerationError] = useState<string | null>(null);

    const fetchReports = async () => {
        try {
            const data = await getReports();
            setReports(data);
            if (data.length > 0 && !selectedReport) {
                setSelectedReport(data[0]);
            }
        } catch (error) {
            console.error("Failed to load reports:", error);
            toast.error("Couldn't load reports", {
                description: "Please check your connection and try again. 🌿",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleGenerate = async (isMock: boolean = false) => {
        setIsGenerating(true);
        setGenerationError(null);
        setSelectedReport(null);

        try {
            // capture current latest report
            const previousLatestId = reports.length > 0 ? reports[0]._id : null;

            await generateReport(period, isMock);

            // Poll for completion (max 45s)
            let attempts = 0;
            const maxAttempts = 15;
            const pollInterval = 3000;

            const poll = setInterval(async () => {
                attempts++;
                try {
                    const result = await getReports();
                    // Check if we have a NEW report (id diff from top)
                    if (result.length > 0) {
                        const newLatest = result[0];
                        if (newLatest._id !== previousLatestId) {
                            // Found new report!
                            clearInterval(poll);
                            setReports(result);
                            setSelectedReport(newLatest);
                            setIsGenerating(false);
                            toast.success("Reflection complete", {
                                description: "Your insights are ready to explore. 🌸",
                            });
                            return;
                        }
                    }
                } catch (pollError) {
                    console.error("Poll error:", pollError);
                }

                if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    setIsGenerating(false);
                    setGenerationError("Analysis took longer than expected. Your report may still be generating - try refreshing in a moment.");
                    toast.error("Taking longer than expected", {
                        description: "Please try again in a moment. 🍃",
                    });
                }
            }, pollInterval);

        } catch (error) {
            console.error("Generation error:", error);
            setIsGenerating(false);
            setGenerationError("Failed to initiate generation. Please ensure you're logged in and try again.");
            toast.error("Couldn't start reflection", {
                description: "Please try again shortly. 🌿",
            });
        }
    };

    const getPeriodLabel = (p: string) => {
        switch (p) {
            case "7_days": return "7 Days";
            case "14_days": return "14 Days";
            case "30_days": return "30 Days";
            default: return p;
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <Container className="relative z-10 pt-8 pb-12 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <Sparkles className="w-8 h-8 text-primary" />
                                Wellbeing Reflections
                            </h1>
                            <p className="text-muted-foreground mt-1">AI-generated insights from your mental wellness journey</p>
                        </div>
                    </div>

                    {/* Generate Controls */}
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardContent className="p-3 flex items-center gap-3">
                            <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                                <SelectTrigger className="w-[130px] bg-background/50">
                                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7_days">Last 7 Days</SelectItem>
                                    <SelectItem value="14_days">Last 14 Days</SelectItem>
                                    <SelectItem value="30_days">Last 30 Days</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button 
                                onClick={() => handleGenerate(false)} 
                                disabled={isGenerating}
                                className="gap-2"
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                Generate Report
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                                Past Reports
                            </h3>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={fetchReports}
                                title="Refresh reports"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" />
                                    <p className="text-sm text-muted-foreground mt-3">Loading reports...</p>
                                </div>
                            ) : reports.length === 0 ? (
                                <Card className="bg-card/30 border-dashed">
                                    <CardContent className="p-6 text-center">
                                        <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                                        <p className="text-sm text-muted-foreground">
                                            No reports yet
                                        </p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                            Generate your first reflection to get started
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                reports.map(report => (
                                    <button
                                        key={report._id}
                                        onClick={() => {
                                            setSelectedReport(report);
                                            setGenerationError(null);
                                        }}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl text-sm transition-all duration-200 border flex items-center justify-between group",
                                            selectedReport?._id === report._id
                                                ? "bg-primary/10 border-primary/30 shadow-sm"
                                                : "bg-card/50 backdrop-blur-sm hover:bg-card/80 border-border/50 hover:border-border"
                                        )}
                                    >
                                        <div className="grid gap-1.5">
                                            <span className={cn(
                                                "font-medium truncate flex items-center gap-2",
                                                selectedReport?._id === report._id ? "text-primary" : "text-foreground"
                                            )}>
                                                <Sparkles className="h-3.5 w-3.5" />
                                                {getPeriodLabel(report.period)} Reflection
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                {new Date(report.createdAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })}
                                            </span>
                                        </div>
                                        <ChevronRight className={cn(
                                            "h-4 w-4 transition-all",
                                            selectedReport?._id === report._id 
                                                ? "opacity-100 text-primary" 
                                                : "opacity-0 group-hover:opacity-50"
                                        )} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {isGenerating ? (
                            <GeneratingOverlay />
                        ) : generationError ? (
                            <Card className="border-destructive/30 bg-destructive/5">
                                <CardContent className="p-12">
                                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="p-4 bg-destructive/10 rounded-full">
                                            <AlertCircle className="h-10 w-10 text-destructive" />
                                        </div>
                                        <div className="space-y-2 max-w-md">
                                            <h3 className="text-xl font-semibold text-destructive">Generation Issue</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {generationError}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button 
                                                onClick={() => handleGenerate(false)} 
                                                className="gap-2"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Try Again
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                    setGenerationError(null);
                                                    fetchReports();
                                                }}
                                            >
                                                Refresh List
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : selectedReport ? (
                            <ReportViewer report={selectedReport} />
                        ) : (
                            <Card className="border-dashed bg-card/30">
                                <CardContent className="p-12">
                                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="p-4 bg-primary/10 rounded-full">
                                            <FileText className="h-10 w-10 text-primary/60" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-medium">Select a Report</h3>
                                            <p className="text-sm text-muted-foreground max-w-sm">
                                                Choose a past report from the sidebar to view your insights, or generate a new reflection.
                                            </p>
                                        </div>
                                        <Button 
                                            onClick={() => handleGenerate(false)} 
                                            variant="outline" 
                                            className="gap-2 mt-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Generate New Report
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}
