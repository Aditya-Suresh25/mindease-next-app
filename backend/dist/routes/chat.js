"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_1 = require("../controllers/chat");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = __importDefault(require("../middleware/rateLimit"));
const router = express_1.default.Router();
// Apply auth middleware to all routes
router.use(auth_1.auth);
// Create a new chat session
router.post("/sessions", auth_1.auth, chat_1.createChatSession);
router.get('/sessions', auth_1.auth, chat_1.getAllSessions);
// Get a specific chat session
router.get("/sessions/:sessionId", chat_1.getChatSession);
// DELETE /chat/sessions/:id
router.delete('/sessions/:id', auth_1.auth, chat_1.deleteChatSession);
// Send a message in a chat session (protected + rate-limited)
router.post("/sessions/:sessionId/messages", auth_1.auth, (0, rateLimit_1.default)({ perUserRate: 200, perUserCapacity: 200, globalRate: 300, globalCapacity: 800 }), chat_1.sendMessage);
// Get chat history for a session
router.get("/sessions/:sessionId/history", chat_1.getChatHistory);
exports.default = router;
// let response = pm.response.json()
// pm.globals.set("access_token", response.access_token)
