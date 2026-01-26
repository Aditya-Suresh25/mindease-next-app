"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_1 = require("../controllers/report");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/generate", auth_1.auth, report_1.generateReport);
router.get("/", auth_1.auth, report_1.getReports);
router.get("/:id", auth_1.auth, report_1.getReportById);
exports.default = router;
