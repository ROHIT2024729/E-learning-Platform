import express from 'express';
import dotenv from "dotenv";
import { connectDb } from './database/db.js';
import userRoutes from "./routes/user.js";
import courseRoutes from './routes/course.js';
import adminRoutes from './routes/admin.js';
import doubtRoutes from './routes/doubt.js';
import testSeriesRoutes from './routes/testseries.js';
import dashboardRoutes from './routes/dashboard.js';
import gamificationRoutes from './routes/gamification.js';
import commentRoutes from './routes/comment.js';
import Razorpay from 'razorpay';
import cors from 'cors';

export const instance = new Razorpay({
    key_id: "rzp_test_RUrTd5r5lro1jJ",
    key_secret: "UFREo7qrO6lumQ5aMPlXpaur",
});

dotenv.config();
import { Server } from "socket.io";
import http from "http";
import setupBattleSockets from "./socket/battleHandler.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Or your frontend URL
        methods: ["GET", "POST"],
    },
});

app.use(express.json());

app.use(cors());

app.use("/uploads",express.static("uploads"));
app.use('/api',userRoutes);
app.use('/api',courseRoutes);
app.use('/api',adminRoutes);
app.use('/api',doubtRoutes);
app.use('/api',testSeriesRoutes);
app.use('/api',dashboardRoutes);
app.use('/api',gamificationRoutes);
app.use('/api',commentRoutes);


app.get('/',(req,res)=>{
    res.send("Server is Running!");
})

setupBattleSockets(io);

server.listen(process.env.PORT,()=>{
    try{
    console.log(`Server is Listening at Port Number: ${process.env.PORT}`);
    connectDb();
    }
    catch(err){
        console.log("Error : "+err);
    }
})