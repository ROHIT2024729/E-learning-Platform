import express from 'express';
import { isAuth, isAdmin } from '../middlewares/isAuth.js';
import { createCourse, addLectures, deleteLecture, deleteCourse, getAllStats } from '../controller/admin.js';
import { uploadFiles } from '../middlewares/multer.js';
import { fetechLectures } from '../controller/course.js';
const router  = express.Router();

router.post('/course/new',isAuth,isAdmin,uploadFiles,createCourse);
router.post('/course/:id',isAuth,isAdmin,uploadFiles,addLectures);
router.delete('/course/:id',isAuth,isAdmin,deleteCourse);
router.delete('/lecture/:id',isAuth,isAdmin,deleteLecture);
router.get('/stats',isAuth,isAdmin,getAllStats);

export default router;