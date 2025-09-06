import express from 'express';
import dotenv from "dotenv";
import { connectDb } from './database/db.js';
import userRoutes from "./routes/user.js";
import courseRoutes from './routes/course.js';
import adminRoutes from './routes/admin.js'






dotenv.config();
const app = express();

app.use(express.json());



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