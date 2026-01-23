import { Request, Response } from "express";
import { Story, StoryCategory, StoryStatus } from "../models/Story";
import { User } from "../models/User";

/**
 * Get all published stories (public endpoint)
 * GET /api/stories
 */
export const getStories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const category = req.query.category as StoryCategory | undefined;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { status: "published" };
    if (category && ["real-story", "practical-tip", "personal-experience"].includes(category)) {
      filter.category = category;
    }

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("authorId", "name handle avatar")
        .lean(),
      Story.countDocuments(filter),
    ]);

    // Transform stories to hide author info if anonymous
    const transformedStories = stories.map((story: any) => {
      const author = story.authorId;
      return {
        ...story,
        authorLabel: story.isAnonymous 
          ? (author?.handle ? `@${author.handle}` : "A MindEase User")
          : author?.name || "A MindEase User",
        authorAvatar: story.isAnonymous ? null : author?.avatar,
        authorId: undefined, // Remove authorId from response
      };
    });

    res.json({
      success: true,
      data: {
        stories: transformedStories,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get stories error:", error);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
};

/**
 * Get a single story by ID
 * GET /api/stories/:storyId
 */
export const getStoryById = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId)
      .populate("authorId", "name handle avatar")
      .lean();

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Increment view count
    await Story.findByIdAndUpdate(storyId, { $inc: { views: 1 } });

    const author = (story as any).authorId;
    const transformedStory = {
      ...story,
      authorLabel: (story as any).isAnonymous 
        ? (author?.handle ? `@${author.handle}` : "A MindEase User")
        : author?.name || "A MindEase User",
      authorAvatar: (story as any).isAnonymous ? null : author?.avatar,
      authorId: undefined,
    };

    res.json({
      success: true,
      story: transformedStory,
    });
  } catch (error) {
    console.error("Get story error:", error);
    res.status(500).json({ message: "Failed to fetch story" });
  }
};

/**
 * Create a new story (authenticated users only)
 * POST /api/stories
 */
export const createStory = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { title, content, category, tags, isAnonymous, status } = req.body;

    // Validate input
    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return res.status(400).json({ message: "Title must be at least 5 characters" });
    }
    if (!content || typeof content !== "string" || content.trim().length < 50) {
      return res.status(400).json({ message: "Content must be at least 50 characters" });
    }

    // Calculate read time (average 200 words per minute)
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const story = new Story({
      authorId: userId,
      title: title.trim(),
      content: content.trim(),
      category: category || "personal-experience",
      tags: Array.isArray(tags) ? tags.slice(0, 5).map((t: string) => t.toLowerCase().trim()) : [],
      readTime,
      isAnonymous: isAnonymous !== false, // Default to anonymous
      status: status === "published" ? "published" : "draft",
    });

    await story.save();

    res.status(201).json({
      success: true,
      message: "Story created successfully!",
      story: {
        _id: story._id,
        title: story.title,
        category: story.category,
        status: story.status,
        createdAt: story.createdAt,
      },
    });
  } catch (error) {
    console.error("Create story error:", error);
    res.status(500).json({ message: "Failed to create story" });
  }
};

/**
 * Update a story (author only)
 * PUT /api/stories/:storyId
 */
export const updateStory = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { storyId } = req.params;
    const { title, content, category, tags, isAnonymous, status } = req.body;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Check ownership
    if (story.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own stories" });
    }

    // Update fields
    if (title && title.trim().length >= 5) story.title = title.trim();
    if (content && content.trim().length >= 50) {
      story.content = content.trim();
      // Recalculate read time
      const wordCount = content.trim().split(/\s+/).length;
      story.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (category) story.category = category;
    if (tags) story.tags = tags.slice(0, 5).map((t: string) => t.toLowerCase().trim());
    if (typeof isAnonymous === "boolean") story.isAnonymous = isAnonymous;
    if (status && ["draft", "published", "archived"].includes(status)) story.status = status;

    await story.save();

    res.json({
      success: true,
      message: "Story updated successfully!",
      story,
    });
  } catch (error) {
    console.error("Update story error:", error);
    res.status(500).json({ message: "Failed to update story" });
  }
};

/**
 * Delete a story (author only)
 * DELETE /api/stories/:storyId
 */
export const deleteStory = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { storyId } = req.params;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Check ownership
    if (story.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own stories" });
    }

    await Story.findByIdAndDelete(storyId);

    res.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({ message: "Failed to delete story" });
  }
};

/**
 * Get user's own stories (authenticated)
 * GET /api/stories/my-stories
 */
export const getMyStories = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const status = req.query.status as StoryStatus | undefined;

    const filter: Record<string, unknown> = { authorId: userId };
    if (status && ["draft", "published", "archived"].includes(status)) {
      filter.status = status;
    }

    const stories = await Story.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error("Get my stories error:", error);
    res.status(500).json({ message: "Failed to fetch your stories" });
  }
};

/**
 * Like a story
 * POST /api/stories/:storyId/like
 */
export const likeStory = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findByIdAndUpdate(
      storyId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.json({
      success: true,
      likes: story.likes,
    });
  } catch (error) {
    console.error("Like story error:", error);
    res.status(500).json({ message: "Failed to like story" });
  }
};
