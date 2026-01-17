import express from "express";
import { auth } from "../middleware/auth";
import { getLatestRecommendation } from "../controllers/recommendationController";

const router = express.Router();

router.use(auth);

router.get("/latest", getLatestRecommendation);

export default router;
