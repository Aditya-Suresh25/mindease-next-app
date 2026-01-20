import express from "express";
import { generateReport, getReports, getReportById } from "../controllers/report";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/generate", auth, generateReport);
router.get("/", auth, getReports);
router.get("/:id", auth, getReportById);

export default router;
