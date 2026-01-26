"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/lib/contexts/admin-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquareHeart,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Shield,
  Eye,
  AlertCircle,
  Trash2,
  Globe,
  Menu,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  getReviewsForModeration,
  getReviewStats,
  moderateReview,
  deleteReview,
  getLiveTestimonials,
  ReviewForModeration,
  ReviewStats,
} from "@/lib/api/review";

type ViewMode = "moderation" | "live";

export default function AdminReviewsPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAdmin();
  
  const [reviews, setReviews] = useState<ReviewForModeration[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | undefined>("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("moderation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Moderation dialog state
  const [selectedReview, setSelectedReview] = useState<ReviewForModeration | null>(null);
  const [moderationAction, setModerationAction] = useState<"approved" | "rejected" | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [reviewToDelete, setReviewToDelete] = useState<ReviewForModeration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (viewMode === "live") {
        const [liveRes, statsRes] = await Promise.all([
          getLiveTestimonials(page, 10),
          getReviewStats(),
        ]);

        if (liveRes.success && liveRes.data) {
          setReviews(liveRes.data.reviews);
          setTotalPages(liveRes.data.pagination.totalPages);
        }
        
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } else {
        const [reviewsRes, statsRes] = await Promise.all([
          getReviewsForModeration(statusFilter, page, 10),
          getReviewStats(),
        ]);

        if (reviewsRes.success && reviewsRes.data) {
          setReviews(reviewsRes.data.reviews);
          setTotalPages(reviewsRes.data.pagination.totalPages);
        }
        
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page, viewMode]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleModerate = async () => {
    if (!selectedReview || !moderationAction) return;

    setIsSubmitting(true);
    const result = await moderateReview(
      selectedReview._id,
      moderationAction,
      moderationNotes.trim() || undefined
    );
    setIsSubmitting(false);

    if (result.success) {
      setSelectedReview(null);
      setModerationAction(null);
      setModerationNotes("");
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    const result = await deleteReview(reviewToDelete._id);
    setIsDeleting(false);

    if (result.success) {
      setReviewToDelete(null);
      fetchData();
    }
  };

  const openModerationDialog = (review: ReviewForModeration, action: "approved" | "rejected") => {
    setSelectedReview(review);
    setModerationAction(action);
    setModerationNotes("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/dashboard")}
                className="text-slate-400 hover:text-white shrink-0 px-2 sm:px-3"
              >
                <ChevronLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 shrink-0">
                  <MessageSquareHeart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-white truncate">Review Management</h1>
                  <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Manage user testimonials</p>
                </div>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
                className="border-white/10 text-slate-300 hover:text-white"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden text-slate-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden pt-3 pb-1 border-t border-white/5 mt-3"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetchData();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoading}
                  className="w-full border-white/10 text-slate-300"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                  Refresh
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 sm:p-4 rounded-xl bg-slate-800/50 border border-white/5"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 shrink-0">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.pending}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Pending</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 sm:p-4 rounded-xl bg-slate-800/50 border border-white/5"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.approved}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Approved</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-3 sm:p-4 rounded-xl bg-slate-800/50 border border-white/5"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 shrink-0">
                  <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.rejected}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Rejected</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 sm:p-4 rounded-xl bg-slate-800/50 border border-white/5"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.publishableCount}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Live on Site</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => {
                setViewMode("moderation");
                setPage(1);
              }}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all",
                viewMode === "moderation"
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5" />
              Moderation
            </button>
            <button
              onClick={() => {
                setViewMode("live");
                setPage(1);
              }}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all",
                viewMode === "live"
                  ? "bg-emerald-500 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5" />
              Live Testimonials
              {stats && <span className="ml-1.5 opacity-75">({stats.publishableCount})</span>}
            </button>
          </div>
        </div>

        {/* Filter Tabs (only for moderation view) */}
        {viewMode === "moderation" && (
          <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
            {(["pending", "approved", "rejected"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={cn(
                  "capitalize text-xs sm:text-sm",
                  statusFilter !== status && "border-white/10 text-slate-400 hover:text-white"
                )}
              >
                {status}
                {stats && (
                  <span className="ml-1.5 text-[10px] sm:text-xs opacity-70">
                    ({status === "pending" ? stats.pending : status === "approved" ? stats.approved : stats.rejected})
                  </span>
                )}
              </Button>
            ))}
            <Button
              variant={statusFilter === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(undefined);
                setPage(1);
              }}
              className={cn(
                "text-xs sm:text-sm",
                statusFilter !== undefined && "border-white/10 text-slate-400 hover:text-white"
              )}
            >
              All
              {stats && <span className="ml-1.5 text-[10px] sm:text-xs opacity-70">({stats.total})</span>}
            </Button>
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <MessageSquareHeart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-sm sm:text-base">
              {viewMode === "live" ? "No live testimonials yet" : "No reviews found"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence mode="popLayout">
              {reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 sm:p-6 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {getStatusBadge(review.status)}
                        {review.consentToPublish ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Consented
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-xs">
                            Private
                          </Badge>
                        )}
                        {(review as any).rating && (
                          <StarRatingDisplay rating={(review as any).rating} size="sm" />
                        )}
                        <span className="text-[10px] sm:text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      
                      <p className="text-white text-sm leading-relaxed mb-3">
                        "{review.text}"
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-xs text-slate-500">
                        <span>User: {review.userId?.name || "Unknown"}</span>
                        {review.moderatedBy && (
                          <span>
                            Moderated by: {review.moderatedBy.name} on{" "}
                            {new Date(review.moderatedAt!).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {review.moderationNotes && (
                        <div className="mt-3 p-2 rounded-lg bg-slate-900/50 text-[10px] sm:text-xs text-slate-400">
                          <strong>Notes:</strong> {review.moderationNotes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {viewMode === "moderation" && review.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModerationDialog(review, "approved")}
                            className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 text-xs sm:text-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModerationDialog(review, "rejected")}
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs sm:text-sm"
                          >
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Reject</span>
                          </Button>
                        </>
                      )}
                      
                      {/* Delete button for live testimonials or approved reviews */}
                      {(viewMode === "live" || review.status !== "pending") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewToDelete(review)}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 sm:pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-white/10 text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs sm:text-sm text-slate-400 px-2 sm:px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-white/10 text-slate-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Moderation Dialog */}
      <Dialog 
        open={!!selectedReview && !!moderationAction} 
        onOpenChange={() => {
          setSelectedReview(null);
          setModerationAction(null);
        }}
      >
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              {moderationAction === "approved" ? (
                <>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  Approve Review
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  Reject Review
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs sm:text-sm">
              {moderationAction === "approved" 
                ? "This review will be eligible for display on the landing page if the user consented."
                : "This review will be marked as rejected and will not be shown publicly."
              }
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="py-3 sm:py-4">
              <div className="p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-white/5 mb-4">
                <p className="text-xs sm:text-sm text-slate-300">"{selectedReview.text}"</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
                  — {selectedReview.userId?.name || "Unknown user"}
                </p>
              </div>

              {!selectedReview.consentToPublish && moderationAction === "approved" && (
                <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] sm:text-xs text-amber-300">
                    Note: This user did not consent to public display. Even if approved, this review will not appear on the landing page.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs sm:text-sm text-slate-400">
                  Moderation Notes (optional, internal only)
                </Label>
                <Textarea
                  id="notes"
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Add any notes about this moderation decision..."
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm"
                  maxLength={500}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReview(null);
                setModerationAction(null);
              }}
              disabled={isSubmitting}
              className="border-white/10 text-slate-400 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleModerate}
              disabled={isSubmitting}
              className={cn(
                "w-full sm:w-auto",
                moderationAction === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : moderationAction === "approved" ? (
                "Confirm Approval"
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!reviewToDelete} 
        onOpenChange={() => setReviewToDelete(null)}
      >
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg text-red-400">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Delete Review
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs sm:text-sm">
              This action cannot be undone. The review will be permanently removed from the database.
            </DialogDescription>
          </DialogHeader>

          {reviewToDelete && (
            <div className="py-3 sm:py-4">
              <div className="p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-red-500/20 mb-4">
                <p className="text-xs sm:text-sm text-slate-300">"{reviewToDelete.text}"</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
                  — {reviewToDelete.userId?.name || "Unknown user"}
                </p>
              </div>

              <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] sm:text-xs text-red-300">
                  Warning: This will permanently delete the review{reviewToDelete.status === "approved" && reviewToDelete.consentToPublish ? " and remove it from the live testimonials on the landing page" : ""}.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewToDelete(null)}
              disabled={isDeleting}
              className="border-white/10 text-slate-400 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
