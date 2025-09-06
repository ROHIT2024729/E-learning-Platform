import express from 'express';
import { getAllCourses, getSingleCourse } from '../controller/course.js';
const router  = express.Router();



router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);

export default router;