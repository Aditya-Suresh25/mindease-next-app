import { API_BASE, getAuthHeaders } from "./base";

export interface Story {
  _id: string;
  title: string;
  content: string;
  category: "real-story" | "practical-tip" | "personal-experience";
  tags: string[];
  readTime: number;
  status: "draft" | "published" | "archived";
  isAnonymous: boolean;
  likes: number;
  views: number;
  authorLabel: string;
  authorAvatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoryInput {
  title: string;
  content: string;
  category?: "real-story" | "practical-tip" | "personal-experience";
  tags?: string[];
  isAnonymous?: boolean;
  status?: "draft" | "published";
}

/**
 * Get all published stories
 */
export const getStories = async (
  page: number = 1,
  limit: number = 20,
  category?: string
): Promise<{
  success: boolean;
  data?: {
    stories: Story[];
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
    if (category) params.append("category", category);

    const response = await fetch(`${API_BASE}/api/stories?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return { success: false, error: "Failed to fetch stories" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Get a single story by ID
 */
export const getStoryById = async (
  storyId: string
): Promise<{
  success: boolean;
  story?: Story;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/stories/${storyId}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return { success: false, error: "Story not found" };
    }

    const data = await response.json();
    return { success: true, story: data.story };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Create a new story
 */
export const createStory = async (
  input: CreateStoryInput
): Promise<{
  success: boolean;
  story?: Story;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/stories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to create story" };
    }

    return { success: true, story: data.story, message: data.message };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Update a story
 */
export const updateStory = async (
  storyId: string,
  input: Partial<CreateStoryInput>
): Promise<{
  success: boolean;
  story?: Story;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/stories/${storyId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to update story" };
    }

    return { success: true, story: data.story, message: data.message };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Delete a story
 */
export const deleteStory = async (
  storyId: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/stories/${storyId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to delete story" };
    }

    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Get user's own stories
 */
export const getMyStories = async (
  status?: "draft" | "published" | "archived"
): Promise<{
  success: boolean;
  stories?: Story[];
  error?: string;
}> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const response = await fetch(`${API_BASE}/api/stories/user/my-stories?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to fetch your stories" };
    }

    const data = await response.json();
    return { success: true, stories: data.stories };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

/**
 * Like a story
 */
export const likeStory = async (
  storyId: string
): Promise<{
  success: boolean;
  likes?: number;
  error?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/stories/${storyId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to like story" };
    }

    return { success: true, likes: data.likes };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};
