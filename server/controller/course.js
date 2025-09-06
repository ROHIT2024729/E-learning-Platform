import TryCatch from "../middlewares/TryCatch.js";
import {Courses} from "../models/Courses.js";
import { Lecture } from "../models/Lectures.js";
import { User } from "../models/User.js";

export const getAllCourses = TryCatch(async(req,res)=>{
    const courses = await Courses.find();
    res.json({
        courses,
    });
});

export const getSingleCourse = TryCatch(async(req,res)=>{
    const course = await Courses.findById(req.params.id);
    res.status(404).json({
        course,
    });
});

export const fetechLectures = TryCatch(async(req,res)=>{
    const lectures =await Lecture.find({courses: req.params.id});

    const user = await User.find()
})