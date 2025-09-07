import express from 'express';
import dotenv from "dotenv";
import { connectDb } from './database/db.js';
import userRoutes from "./routes/user.js";
import courseRoutes from './routes/course.js';
import adminRoutes from './routes/admin.js';
import Razorpay from 'razorpay';
import cors from 'cors';

export const instance = new Razorpay({
    key_id: process.env.Razorpay_Key,
    key_secret: process.env.Razorpay_Secret,
});







dotenv.config();
const app = express();

app.use(express.json());

app.use(cors());

app.use("/uploads",express.static("uploads"));
app.use('/api',userRoutes);
app.use('/api',courseRoutes);
app.use('/api',adminRoutes);


app.get('/',(req,res)=>{
    res.send("Server is Running!");
})
app.listen(process.env.PORT,()=>{
    try{
    console.log(`Server is Listening at Port Number: ${process.env.PORT}`);
    connectDb();
    }
    catch(err){
        console.log("Error : "+err);
    }
})