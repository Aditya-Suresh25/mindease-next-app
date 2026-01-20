"use client";

import { ReflectionReport } from "@/lib/api/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Calendar, Sparkles, Brain, Activity, Lightbulb, Heart } from "lucide-react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReportViewerProps {
    report: ReflectionReport;
}

export function ReportViewer({ report }: ReportViewerProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!printRef.current) return;

        const canvas = await html2canvas(printRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`MindEase-Reflection-${new Date(report.createdAt).toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                        {new Date(report.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })} — {new Date(report.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                </div>
                <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                </Button>
            </div>

            <div ref={printRef} className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-8 border-b">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium">
                            <Sparkles className="h-4 w-4" />
                            AI-Generated Reflection
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Wellbeing Reflection</h1>
                        <p className="text-muted-foreground">
                            Your personalized insights from the past {report.period.replace("_", " ")}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Mood & Activity Summary */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                        <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Mood Patterns</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-emerald-700/80 dark:text-emerald-300/80">
                                    {report.content.moodSummary}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/50 dark:border-sky-800/30">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg">
                                        <Activity className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <h3 className="font-semibold text-sky-800 dark:text-sky-300">Activity Engagement</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-sky-700/80 dark:text-sky-300/80">
                                    {report.content.activitySummary}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Reflection */}
                    <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/10 border-purple-200/50 dark:border-purple-800/30">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                    <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="font-semibold text-purple-800 dark:text-purple-300">A Moment of Reflection</h3>
                            </div>
                            <p className="leading-7 text-purple-700/80 dark:text-purple-300/80 whitespace-pre-wrap">
                                {report.content.reflection}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Suggestions */}
                    <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                    <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="font-semibold text-amber-800 dark:text-amber-300">Gentle Suggestions</h3>
                            </div>
                            <p className="leading-relaxed text-amber-700/80 dark:text-amber-300/80">
                                {report.content.suggestions}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-muted/30 border-t text-center">
                    <p className="text-xs text-muted-foreground">
                        Generated by MindEase on {new Date(report.createdAt).toLocaleDateString("en-US", { 
                            month: "long", 
                            day: "numeric", 
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                        This is a personal reflection, not a medical evaluation.
                    </p>
                </div>
            </div>
        </div>
    );
}
