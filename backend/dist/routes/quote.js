"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const quoteController_1 = require("../controllers/quoteController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get personalized quote (requires auth)
router.get("/daily", auth_1.auth, quoteController_1.getDailyQuote);
// Get general quote (no auth required, for landing page)
router.get("/public", quoteController_1.getPublicQuote);
exports.default = router;
