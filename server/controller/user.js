import {User} from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../middlewares/sendMail.js'
import TryCatch from '../middlewares/TryCatch.js'



export const register = TryCatch(async(req,res)=>{
const {email, name , password} = req.body;
    let user = await User.findOne({email});


    if(user) {
        return res.status(400).json({
            message:"User Already Exists!",
        })
    }
    const hashPassword = await bcrypt.hash(password,10);
    user = {
        name,
        email,
        password: hashPassword
    }
    // req.body.password = await bcrypt.hash(req.body.password,10);

    const otp = Math.floor(Math.random()*1000000);
    const activationToken = jwt.sign({user,otp},process.env.ACTIVATION_SECRET,{expiresIn:"5m"});

    const data = {name,otp};
    await sendMail(email,"Elearning",data);

    res.status(201).json({
        message:"Otp Send To Your mail",
        activationToken,
    })
})

export const verifyUser = TryCatch(async(req,res)=>{
    const {otp, activationToken} = req.body;

    const verify = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);

    if(!verify) 
        return res.status(400).json({
    message:"otp Expired!",
});

if(verify.otp !== otp) return res.status(400).json({
    message : "Wrong Otp!",
})

await User.create({
    name:verify.user.name,
    email:verify.user.email,
    password:verify.user.password,
})

res.json({
    message:"User Registered!",
});
});


export const loginUser = TryCatch(async(req,res)=>{
    const {email,password} = req.body;

    const user = await User.findOne({email});

    if(!user) return res.status(400).json({
        message:"User not Found!",
    });

    const mathPassword = await bcrypt.compare(password,user.password);

    if(!mathPassword) 
        return res.ststus(400).json({
    message:"Wrong Credentials!"
})

const token = jwt.sign({_id:user._id}, process.env.ACTIVATION_SECRET,{expiresIn:"15d"});

res.json({
    message:`Welcome back ${user.name}`,
    token,
    user,
});
});


export const myProfile = TryCatch(async(req,res)=>{
    const user = await User.findById(req.user._id);

    res.json({user});
})