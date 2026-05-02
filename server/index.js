import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import Razorpay from "razorpay";

import { connectDb } from "./database/db.js";
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import doubtRoutes from "./routes/doubt.js";
import testSeriesRoutes from "./routes/testseries.js";
import dashboardRoutes from "./routes/dashboard.js";
import gamificationRoutes from "./routes/gamification.js";
import commentRoutes from "./routes/comment.js";
import setupBattleSockets from "./socket/battleHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.use(
  cors({
    origin: "*", 
    credentials: true,
  })
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api", doubtRoutes);
app.use("/api", testSeriesRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", gamificationRoutes);
app.use("/api", commentRoutes);

app.get("/", (req, res) => {
  res.send("Server is Running!");
});
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupBattleSockets(io);
server.listen(PORT, async () => {
  try {
    console.log(`Server is running on port ${PORT}`);
    await connectDb();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Error:", err);
  }
});
