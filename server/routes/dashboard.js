import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { getStudentDashboard } from "../controller/dashboard.js";

const router = express.Router();

router.get("/student/dashboard", isAuth, getStudentDashboard);

export default router;
