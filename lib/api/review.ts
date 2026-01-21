import { API_BASE, getAuthHeaders } from "./base";

export interface Review {
  _id: string;
  text: string;
  rating?: number; // Optional star rating (1-5)
  consentToPublish: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Testimonial {
  _id: string;
  text: string;
  rating?: number; // Optional star rating (1-5)
  authorLabel: string;
}

export interface ReviewForModeration extends Review {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  moderatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  moderatedAt?: string;
  moderationNotes?: string;
}

export interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  withConsent: number;
  publishableCount: number;
}

/**
 * Check if the current user can submit a review (7-day rule)
 */
export const canSubmitReview = async (): Promise<{
  success: boolean;
  canSubmit?: boolean;
  lastPromptDate?: string | null;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/reviews/can-submit`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to check eligibility" };
    }

    const data = await response.json();
    return {
      success: true,
      canSubmit: data.canSubmit,
      lastPromptDate: data.lastPromptDate,
    };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Submit a new review
 */
export const submitReview = async (
  text: string,
  consentToPublish: boolean,
  rating?: number | null
): Promise<{
  success: boolean;
  review?: Review;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/reviews`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, consentToPublish, rating }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to submit review" };
    }

    return {
      success: true,
      review: data.review,
      message: data.message,
    };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Dismiss the review prompt (updates cooldown timer)
 */
export const dismissReviewPrompt = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/reviews/dismiss`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to dismiss prompt" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Get testimonials for landing page (public endpoint)
 */
export const getTestimonials = async (
  limit: number = 6
): Promise<{
  success: boolean;
  testimonials?: Testimonial[];
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/reviews/testimonials?limit=${limit}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to fetch testimonials" };
    }

    const data = await response.json();
    return {
      success: true,
      testimonials: data.testimonials,
    };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Admin API Functions

const getAdminAuthHeaders = (): HeadersInit => {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("adminToken");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Admin: Get reviews for moderation
 */
export const getReviewsForModeration = async (
  status?: "pending" | "approved" | "rejected",
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  data?: {
    reviews: ReviewForModeration[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", String(page));
    params.append("limit", String(limit));

    const response = await fetch(
      `${API_BASE}/api/reviews/admin?${params.toString()}`,
      {
        headers: getAdminAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to fetch reviews" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Admin: Moderate a review (approve or reject)
 */
export const moderateReview = async (
  reviewId: string,
  status: "approved" | "rejected",
  notes?: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/reviews/admin/${reviewId}`,
      {
        method: "PATCH",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ status, notes }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to moderate review" };
    }

    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Admin: Get review statistics
 */
export const getReviewStats = async (): Promise<{
  success: boolean;
  data?: ReviewStats;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/reviews/admin/stats`, {
      headers: getAdminAuthHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to fetch stats" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Admin: Delete a review permanently
 */
export const deleteReview = async (
  reviewId: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/reviews/admin/${reviewId}`,
      {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to delete review" };
    }

    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Admin: Get live testimonials (approved + consented)
 */
export const getLiveTestimonials = async (
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  data?: {
    reviews: ReviewForModeration[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}> => {
  try {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));

    const response = await fetch(
      `${API_BASE}/api/reviews/admin/live?${params.toString()}`,
      {
        headers: getAdminAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to fetch live testimonials" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};
