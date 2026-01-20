import express from "express";
import {
  createChatSession,
  getChatSession,
  sendMessage,
  getChatHistory,
  getAllSessions,
  deleteChatSession,
} from "../controllers/chat";
import { auth } from "../middleware/auth";
import rateLimit from "../middleware/rateLimit";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Create a new chat session
router.post("/sessions",auth, createChatSession);

router.get('/sessions', auth, getAllSessions);

// Get a specific chat session
router.get("/sessions/:sessionId", getChatSession);

// DELETE /chat/sessions/:id
router.delete('/sessions/:id', auth, deleteChatSession);

// Send a message in a chat session (protected + rate-limited)
router.post(
  "/sessions/:sessionId/messages",
  auth,
  rateLimit({ perUserRate: 200, perUserCapacity: 200, globalRate: 300, globalCapacity: 800 }),
  sendMessage
);

// Get chat history for a session
router.get("/sessions/:sessionId/history", getChatHistory);

export default router;

// let response = pm.response.json()
// pm.globals.set("access_token", response.access_token)