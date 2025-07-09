import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
    recordLectureComplete,
    recordTestComplete,
    getMyGamification,
    getGlobalLeaderboard,
} from "../controller/gamification.js";

const router = express.Router();

router.post("/gamification/lecture-complete", isAuth, recordLectureComplete);
router.post("/gamification/test-complete", isAuth, recordTestComplete);
router.get("/gamification/my-stats", isAuth, getMyGamification);
router.get("/gamification/leaderboard", isAuth, getGlobalLeaderboard);

export default router;
