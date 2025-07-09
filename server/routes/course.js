import express from 'express';
import { getAllCourses, getSingleCourse,getMyCourses,checkout, paymentVerification, rateCourse } from '../controller/course.js';
import { fetechLectures,fetechLecture } from '../controller/course.js';
import { isAuth } from '../middlewares/isAuth.js';
const router  = express.Router();



router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get('/lectures/:id',isAuth, fetechLectures);
router.get('/lecture/:id',isAuth, fetechLecture);
router.get('/mycourse',isAuth, getMyCourses);
router.post('/course/checkout/:id', isAuth, checkout);
router.post('/verification/:id',isAuth,paymentVerification);
router.post('/course/:id/rate', isAuth, rateCourse);
export default router;