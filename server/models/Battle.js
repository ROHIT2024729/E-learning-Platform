import mongoose from "mongoose";

const battleSchema = new mongoose.Schema(
    {
        user1Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        user2Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        questions: [
            {
                question: String,
                options: [String],
                correctOption: Number,
            }
        ],
        user1Answers: [
            {
                questionIndex: Number,
                answerGiven: Number, // index of option, or -1 for not attempted
            }
        ],
        user2Answers: [
            {
                questionIndex: Number,
                answerGiven: Number,
            }
        ],
        user1Score: {
            type: Number,
            default: 0,
        },
        user2Score: {
            type: Number,
            default: 0,
        },
        user1FinishTime: {
            type: Date,
        },
        user2FinishTime: {
            type: Date,
        },
        winnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        status: {
            type: String,
            enum: ["waiting", "active", "completed", "abandoned"],
            default: "waiting",
        },
    },
    {
        timestamps: true,
    }
);

export const Battle = mongoose.model("Battle", battleSchema);
