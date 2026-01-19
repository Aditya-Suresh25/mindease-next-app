"use client";

import { useEffect, useState } from "react";
import { generateReport, getReports, ReflectionReport } from "@/lib/api/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportViewer } from "@/components/reflections/report-viewer";
import { GeneratingOverlay } from "@/components/reflections/generating-overlay";
import { Loader2, Plus, FileText, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ReflectionsPage() {
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
            toast.error("Failed to load reports");
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

            // Poll for completion (max 30s)
            let attempts = 0;
            const maxAttempts = 10;
            const pollInterval = 3000;

            const poll = setInterval(async () => {
                attempts++;
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
                        toast.success("Reflection report ready!");
                        return;
                    }
                }

                if (attempts >= maxAttempts) {
                    clearInterval(poll);
                    setIsGenerating(false);
                    setGenerationError("Analysis took too long. Please try again.");
                    toast.error("Generation timed out");
                }
            }, pollInterval);

        } catch (error) {
            setIsGenerating(false);
            setGenerationError("Failed to initiate generation.");
            toast.error("Failed to start generation");
        }
    };

    return (
        <div className="container py-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Wellbeing Reflections</h1>
                    <p className="text-muted-foreground">AI-generated insights from your journey.</p>
                </div>

                <div className="flex items-center gap-2 bg-card border p-1 rounded-lg">
                    <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                        <SelectTrigger className="w-[120px] border-0 focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7_days">Last 7 Days</SelectItem>
                            <SelectItem value="14_days">Last 14 Days</SelectItem>
                            <SelectItem value="30_days">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => handleGenerate(false)} disabled={isGenerating} size="sm">
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        Generate New
                    </Button>
                    <Button onClick={() => handleGenerate(true)} disabled={isGenerating} size="sm" variant="outline" title="Generate with mock data">
                        Test (Mock)
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider px-2">Past Reports</h3>
                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm p-4 border rounded-lg bg-muted/20">
                                No reports yet. generate one to get started!
                            </div>
                        ) : (
                            reports.map(report => (
                                <button
                                    key={report._id}
                                    onClick={() => setSelectedReport(report)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg text-sm transition-colors border flex items-center justify-between group",
                                        selectedReport?._id === report._id
                                            ? "bg-primary/5 border-primary text-primary font-medium"
                                            : "bg-card hover:bg-muted text-slate-600"
                                    )}
                                >
                                    <div className="grid gap-0.5">
                                        <span className="truncate">Reflection Report</span>
                                        <span className="text-xs opacity-70">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <ChevronRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity", selectedReport?._id === report._id && "opacity-100")} />
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
                        <div className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-destructive/20 rounded-xl bg-destructive/5 text-destructive">
                            <div className="text-center space-y-4 max-w-sm">
                                <div className="p-4 bg-destructive/10 rounded-full inline-flex">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-semibold">Generation Failed</h3>
                                <p className="text-sm text-destructive/80">{generationError}</p>
                                <Button onClick={() => handleGenerate(false)} variant="outline" className="border-destructive/30 hover:bg-destructive/10">
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    ) : selectedReport ? (
                        <ReportViewer report={selectedReport} />
                    ) : (
                        <div className="h-[60vh] flex items-center justify-center border-2 border-dashed rounded-xl bg-slate-50 text-slate-400">
                            <div className="text-center space-y-2">
                                <FileText className="h-10 w-10 mx-auto" />
                                <p>Select a report to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
