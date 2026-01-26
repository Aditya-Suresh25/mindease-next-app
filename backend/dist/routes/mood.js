"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const moodController_1 = require("../controllers/moodController");
const router = express_1.default.Router();
// All routes are protected with authentication
router.use(auth_1.auth);
// Track a new mood entry
router.post("/", moodController_1.createMood);
// Get recent mood entries
router.get("/", auth_1.auth, moodController_1.getMoods);
// Update a mood entry
router.put("/:id", moodController_1.updateMood);
// Delete a mood entry
router.delete("/:id", moodController_1.deleteMood);
exports.default = router;
