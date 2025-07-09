import mongoose from 'mongoose';

const testSubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    testSeriesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestSeries',
        required: true,
    },
    answers: {
        type: [Number],
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        default: 10,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

export const TestSubmission = mongoose.model('TestSubmission', testSubmissionSchema);
