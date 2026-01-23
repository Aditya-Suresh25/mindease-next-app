"use client";

import { ReflectionReport } from "@/lib/api/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Calendar, Sparkles, Brain, Activity, Lightbulb, Heart, Loader2 } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface ReportViewerProps {
    report: ReflectionReport;
}

export function ReportViewer({ report }: ReportViewerProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = useCallback(async () => {
        if (!printRef.current) return;

        setIsDownloading(true);

        try {
            const element = printRef.current;

            const dataUrl = await toPng(element, { 
                cacheBust: true, 
                pixelRatio: 2, 
                // Ensure this matches the main container background (Slate-950)
                backgroundColor: '#020817', 
                style: {
                    color: 'white', 
                }
            });

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(dataUrl);
            const imgWidth = pdfWidth - 20; 
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            pdf.addImage(dataUrl, "PNG", 10, 10, imgWidth, imgHeight);

            const dateStr = new Date(report.createdAt).toISOString().slice(0, 10);
            pdf.save(`Reflection-${dateStr}.pdf`);
            toast.success("PDF saved successfully!");

        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Could not generate PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    }, [report.createdAt]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                        {new Date(report.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })} — {new Date(report.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                </div>
                <Button 
                    onClick={handleDownload} 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            Download PDF
                        </>
                    )}
                </Button>
            </div>

            {/* Main Container: Slate-950 (Darkest Blue/Black)
                Text: Slate-50 (Bright White/Grey for contrast)
            */}
            <div 
                ref={printRef} 
                className="dark bg-slate-950 text-slate-50 rounded-2xl border border-slate-800 shadow-sm overflow-hidden"
            >
                {/* Header: Lighter gradient using primary/10 instead of transparent */}
                <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-slate-950 p-8 border-b border-slate-800/60">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full text-indigo-200 font-medium text-sm border border-indigo-500/30">
                            <Sparkles className="h-4 w-4 text-indigo-300" />
                            <span>AI-Generated Reflection</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Wellbeing Reflection</h1>
                        <p className="text-slate-400 font-medium">
                            Your personalized insights from the past {report.period.replace("_", " ")}
                        </p>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-8 space-y-8 bg-slate-950">
                    {/* Mood & Activity Summary 
                        Change: Using `bg-slate-900` (Lighter than 950) + `border-*-500/20` (Brighter borders)
                    */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-slate-900/80 border-emerald-500/20 shadow-lg shadow-emerald-900/5">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                        <Brain className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <h3 className="font-semibold text-emerald-100 tracking-wide">Mood Patterns</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    {report.content.moodSummary}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/80 border-sky-500/20 shadow-lg shadow-sky-900/5">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20">
                                        <Activity className="h-5 w-5 text-sky-400" />
                                    </div>
                                    <h3 className="font-semibold text-sky-100 tracking-wide">Activity Engagement</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    {report.content.activitySummary}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Reflection 
                        Change: A subtle gradient background that is much lighter than before 
                    */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-purple-500/20 shadow-lg">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                    <Heart className="h-5 w-5 text-purple-400" />
                                </div>
                                <h3 className="font-semibold text-purple-100 tracking-wide">A Moment of Reflection</h3>
                            </div>
                            <p className="leading-7 text-slate-300 whitespace-pre-wrap">
                                {report.content.reflection}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Suggestions */}
                    <Card className="bg-slate-900/80 border-amber-500/20 shadow-lg shadow-amber-900/5">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                    <Lightbulb className="h-5 w-5 text-amber-400" />
                                </div>
                                <h3 className="font-semibold text-amber-100 tracking-wide">Gentle Suggestions</h3>
                            </div>
                            <p className="leading-relaxed text-slate-300">
                                {report.content.suggestions}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-900 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                        Generated by MindEase on {new Date(report.createdAt).toLocaleDateString("en-US", { 
                            month: "long", 
                            day: "numeric", 
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        This is a personal reflection, not a medical evaluation.
                    </p>
                </div>
            </div>
        </div>
    );
}