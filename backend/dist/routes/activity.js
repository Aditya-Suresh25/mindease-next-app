"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const activityController_1 = require("../controllers/activityController");
const router = express_1.default.Router();
router.use(auth_1.auth);
// Get all available activity blueprints
router.get("/blueprints", activityController_1.getAllActivityBlueprints);
// Get activity suggestions based on latest mood
router.get("/suggestions", activityController_1.getSuggestions);
// Get all activities
router.get("/", activityController_1.getActivities);
// Log a new activity
router.post("/", activityController_1.logActivity);
// Update an activity
router.put("/:id", activityController_1.updateActivity);
// Delete an activity
router.delete("/:id", activityController_1.deleteActivity);
exports.default = router;
