import Trycatch from "../middlewares/TryCatch.js";
import {Courses} from "../models/Courses.js";
import { Lecture } from "../models/Lectures.js";
import {rm} from "fs";
import { promisify } from "util";
import fs from 'fs';
import { User } from "../models/User.js";

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

export const deleteLecture = Trycatch(async(req,res)=>{
    const lecture = await Lecture.findById(req.params.id);
    if(!lecture) 
        return res.status(404).json({message:"Lecture Not Found!"});
    rm(lecture.video,()=>{
        console.log("Video Deleted!");
    })

    await lecture.deleteOne();

    res.json({message:"Lecture Deleted!"});
});


const unlinkAsync = promisify(fs.unlink)

export const deleteCourse = Trycatch(async(req,res)=>{
    const course = await Courses.findById(req.params.id);
    if(!course) 
        return res.status(404).json({message:"Couse Not Found!"});
    const lectures = await Lecture.find({course:course._id});

    await Promise.all(
        lectures.map(async(lecture)=>{
            await unlinkAsync(lecture.video);
            console.log("video Removed!");
        })
    );
    rm(course.image,()=>{
        console.log("image Deleted!");
    })
    await Lecture.find({course: req.params.id}).deleteMany();

    await Courses.deleteOne();
    await User.updateMany({},{$pull:{ subscription : req.params.id }});

    res.json({
        message:"Course Deleted!"
    });
})

export const getAllStats = Trycatch(async(req,res)=>{
    const totalCourses = (await Courses.find()).length;
    const totalLectures = (await Lecture.find()).length;
    const totalUsers = (await User.find()).length;


    const stats = {
        totalCourses,
        totalLectures,
        totalUsers
    };

    res.json({
        stats,
    });

})