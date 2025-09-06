import Trycatch from "../middlewares/TryCatch.js";
import {Courses} from "../models/Courses.js";
import { Lecture } from "../models/Lectures.js";

export const createCourse = Trycatch(async(req,res)=>{
    const {title,description, category, createdBy, duration, price} = req.body;

    const image = req.file;


    await Courses.create({
        title,
        description,
        category,
        createdBy,
        image:image?.path,
        duration,
        price,
    });
    res.status(201).json({
        message:"Course Created!"
    });
});


export const addLectures = Trycatch(async(req,res)=>{
    const course = await Courses.findById(req.params.id);

    if(!course) 
        return res.status(404).json({
    message:"Course not found!"
});


const {title, description} = req.body;


const file = req.file;

const lecture  = await Lecture.create({
    title,
    description,
    video:file?.path,
    course: course._id
});
res.status(201).json({
    message:"Lecture Created!",
    lecture
})
});