import express from 'express';
import { getAllCourses, getSingleCourse,getMyCourses,checkout } from '../controller/course.js';
import { fetechLectures,fetechLecture, paymentVerification } from '../controller/course.js';
import { isAuth } from '../middlewares/isAuth.js';
const router  = express.Router();



router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get('/lectures/:id',isAuth, fetechLectures);
router.get('/lecture/:id',isAuth, fetechLecture);
router.get('/mycourses',isAuth, getMyCourses);
router.post('/course/checlkout/:id', isAuth, checkout);
router.post('/verification',isAuth,paymentVerification);
export default router;