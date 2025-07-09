import express from "express";

import  {register,verifyUser,loginUser,myProfile,forgotPassword,resetPassword, updateProfile, changePassword}  from "../controller/user.js";
import { isAuth } from "../middlewares/isAuth.js";
const router = express.Router();


router.post('/user/register',register);
router.post('/user/verify',verifyUser);
router.post('/user/login',loginUser);
router.get('/user/me',isAuth,myProfile);
router.post('/user/forgot-password',forgotPassword);
router.post('/user/reset-password',resetPassword);
router.put('/user/profile', isAuth, updateProfile);
router.put('/user/password', isAuth, changePassword);
export default router;