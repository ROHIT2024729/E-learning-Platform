import express from "express";
import { isAuth, isAdmin } from "../middlewares/isAuth.js";
import {
    getAllTestSeries,
    getTestSeries,
    submitTest,
    getLeaderboard,
    getMySubmission,
    testCheckout,
    testPaymentVerification,
    createTestSeries,
    updateTestSeries,
    deleteTestSeries,
} from "../controller/testseries.js";

const router = express.Router();

// Student routes
router.get("/testseries", getAllTestSeries);
router.get("/testseries/:id", isAuth, getTestSeries);
router.post("/testseries/:id/submit", isAuth, submitTest);
router.get("/testseries/:id/leaderboard", isAuth, getLeaderboard);
router.get("/testseries/:id/mysubmission", isAuth, getMySubmission);
router.post("/testseries/checkout/:id", isAuth, testCheckout);
router.post("/testseries/verification/:id", isAuth, testPaymentVerification);

// Admin routes
router.post("/admin/testseries", isAuth, isAdmin, createTestSeries);
router.put("/admin/testseries/:id", isAuth, isAdmin, updateTestSeries);
router.delete("/admin/testseries/:id", isAuth, isAdmin, deleteTestSeries);

export default router;
