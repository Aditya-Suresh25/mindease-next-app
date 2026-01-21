"use client";

import { ReflectionReport } from "@/lib/api/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Calendar, Sparkles, Brain, Activity, Lightbulb, Heart, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface ReportViewerProps {
    report: ReflectionReport;
}

export function ReportViewer({ report }: ReportViewerProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!printRef.current || isDownloading) return;

        setIsDownloading(true);
        
        try {
            const element = printRef.current;
            
            // Create a deep clone and inline all computed styles to avoid CSS parsing issues
            const clone = element.cloneNode(true) as HTMLElement;
            
            // Helper to convert computed color to RGB hex (handles oklab, oklch, etc.)
            const toHex = (color: string): string => {
                if (!color || color === 'transparent') return 'transparent';
                if (color === 'rgba(0, 0, 0, 0)') return 'transparent';
                
                // Create a canvas to convert any color format to RGB
                const ctx = document.createElement('canvas').getContext('2d');
                if (!ctx) return '#000000';
                ctx.fillStyle = color;
                return ctx.fillStyle; // Returns hex
            };

            // Recursively process all elements and inline their styles
            const processElement = (original: Element, cloned: Element) => {
                const htmlOriginal = original as HTMLElement;
                const htmlCloned = cloned as HTMLElement;
                
                const computed = getComputedStyle(htmlOriginal);
                
                // Set explicit colors as inline styles (converted to hex)
                htmlCloned.style.color = toHex(computed.color);
                htmlCloned.style.backgroundColor = toHex(computed.backgroundColor);
                htmlCloned.style.borderTopColor = toHex(computed.borderTopColor);
                htmlCloned.style.borderRightColor = toHex(computed.borderRightColor);
                htmlCloned.style.borderBottomColor = toHex(computed.borderBottomColor);
                htmlCloned.style.borderLeftColor = toHex(computed.borderLeftColor);
                
                // Remove problematic background images (gradients with oklab)
                const bgImage = computed.backgroundImage;
                if (bgImage && bgImage !== 'none' && (bgImage.includes('oklab') || bgImage.includes('oklch') || bgImage.includes('color('))) {
                    htmlCloned.style.backgroundImage = 'none';
                }
                
                // Copy essential layout styles
                htmlCloned.style.display = computed.display;
                htmlCloned.style.padding = computed.padding;
                htmlCloned.style.margin = computed.margin;
                htmlCloned.style.borderWidth = computed.borderWidth;
                htmlCloned.style.borderStyle = computed.borderStyle;
                htmlCloned.style.borderRadius = computed.borderRadius;
                htmlCloned.style.fontSize = computed.fontSize;
                htmlCloned.style.fontWeight = computed.fontWeight;
                htmlCloned.style.lineHeight = computed.lineHeight;
                htmlCloned.style.textAlign = computed.textAlign as string;
                
                // Process children
                const originalChildren = original.children;
                const clonedChildren = cloned.children;
                for (let i = 0; i < originalChildren.length; i++) {
                    if (clonedChildren[i]) {
                        processElement(originalChildren[i], clonedChildren[i]);
                    }
                }
            };

            // Process the clone
            processElement(element, clone);
            
            // Create a temporary container
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.backgroundColor = '#ffffff';
            container.appendChild(clone);
            document.body.appendChild(container);

            try {
                // Create canvas from the processed clone
                const canvas = await html2canvas(clone, { 
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: false,
                });
                
                const imgData = canvas.toDataURL("image/png", 1.0);
                
                // Create PDF with proper dimensions
                const pdf = new jsPDF("p", "mm", "a4");
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                // Calculate dimensions maintaining aspect ratio
                const imgWidth = pdfWidth - 20;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                // Handle multi-page content
                let heightLeft = imgHeight;
                let position = 10;
                const pageHeight = pdfHeight - 20;
                
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                while (heightLeft > 0) {
                    position = heightLeft - imgHeight + 10;
                    pdf.addPage();
                    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                const dateStr = new Date(report.createdAt).toISOString().slice(0, 10);
                pdf.save(`MindEase-Reflection-${dateStr}.pdf`);
                
                toast.success("PDF downloaded successfully", {
                    description: "Your reflection has been saved. 🌸",
                });
            } finally {
                // Clean up temporary container
                document.body.removeChild(container);
            }
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Failed to download PDF", {
                description: "Please try again. If the issue persists, try taking a screenshot instead. 🍃",
            });
        } finally {
            setIsDownloading(false);
        }
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

            <div ref={printRef} data-pdf-content className="bg-card rounded-2xl border shadow-sm overflow-hidden">
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
