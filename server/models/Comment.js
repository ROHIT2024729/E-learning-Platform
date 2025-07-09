import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lecture',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        text: {
            type: String,
            required: true,
            maxLength: 1000,
        },
        parentCommentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: null, // null means it is a top-level comment
        },
        upvotedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            }
        ],
        isDeleted: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

export const Comment = mongoose.model('Comment', commentSchema);
