import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['lecture_complete', 'test_submit', 'high_score', 'streak_bonus', 'course_enroll'],
        required: true,
    },
    points: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true,
    },
    totalPoints: {
        type: Number,
        default: 0,
    },
    lecturesCompleted: {
        type: Number,
        default: 0,
    },
    testsCompleted: {
        type: Number,
        default: 0,
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    longestStreak: {
        type: Number,
        default: 0,
    },
    lastActiveDate: {
        type: String, // YYYY-MM-DD format for easy comparison
        default: '',
    },
    badges: {
        type: [String],
        default: [],
    },
    pointsHistory: {
        type: [activitySchema],
        default: [],
    },
}, {
    timestamps: true,
});

export const StudentProgress = mongoose.model('StudentProgress', progressSchema);
