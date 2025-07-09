import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        required: true,
        validate: [arr => arr.length === 4, 'Each question must have exactly 4 options'],
    },
    correctOption: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
    },
});

const testSeriesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free',
    },
    price: {
        type: Number,
        default: 0,
    },
    questions: {
        type: [questionSchema],
        validate: [arr => arr.length === 10, 'Each test must have exactly 10 questions'],
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const TestSeries = mongoose.model('TestSeries', testSeriesSchema);
