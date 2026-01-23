import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  getMyStories,
  likeStory,
} from "../controllers/storyController";

const router = Router();

// Public routes
router.get("/", getStories);
router.get("/:storyId", getStoryById);

// Protected routes (require authentication)
router.get("/user/my-stories", auth, getMyStories);
router.post("/", auth, createStory);
router.put("/:storyId", auth, updateStory);
router.delete("/:storyId", auth, deleteStory);
router.post("/:storyId/like", auth, likeStory);

export default router;
