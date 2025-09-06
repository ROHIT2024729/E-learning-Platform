import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import Trycatch from './TryCatch.js';


export const isAuth = async(req,res,next)=>{
    try{
        const token = req.headers.token;

        if(!token) 
            return res.status(400).json({
            message:"Please Login!"
    })
    const decodeData = jwt.decode(token,process.env.ACTIVATION_SECRET);

    req.user = await User.findById(decodeData._id);
    next();
    }
    catch(err){
        res.status(400).json({
            message:"Login First!"
        })
    }
};


export const isAdmin = async(req,res,next)=>{
    try{
        if(req.user.role  !== "admin") return res.status(403).json({
            message:"You are Not Admin!"
        })

        next();
    }
    catch(err){
        res.status(400).json({
            message:err.message
        })
    }
}