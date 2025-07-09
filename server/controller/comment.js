import { Comment } from '../models/Comment.js';
import TryCatch from '../middlewares/TryCatch.js';

export const addComment = TryCatch(async (req, res) => {
    const { lectureId } = req.params;
    const { text, parentCommentId } = req.body;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const commentData = {
        lectureId,
        userId: req.user._id,
        text: text.trim(),
    };

    if (parentCommentId) {
        commentData.parentCommentId = parentCommentId;
    }

    const comment = await Comment.create(commentData);

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'name');

    res.status(201).json({
        message: "Comment added successfully",
        comment: populatedComment
    });
});

export const getComments = TryCatch(async (req, res) => {
    const { lectureId } = req.params;

    const comments = await Comment.find({ lectureId })
        .populate('userId', 'name')
        .sort({ createdAt: -1 }); // Default to newest first. Frontend handles tree building

    res.json({ comments });
});

export const toggleUpvote = TryCatch(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if user already upvoted
    const upvoteIndex = comment.upvotedBy.indexOf(userId);
    
    if (upvoteIndex === -1) {
        // User hasn't upvoted, add upvote
        comment.upvotedBy.push(userId);
    } else {
        // User has upvoted, remove upvote
        comment.upvotedBy.splice(upvoteIndex, 1);
    }

    await comment.save();

    res.json({
        message: upvoteIndex === -1 ? "Upvoted" : "Upvote removed",
        upvotedBy: comment.upvotedBy
    });
});

export const deleteComment = TryCatch(async (req, res) => {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if user owns the comment or is admin
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: "You can only delete your own comments" });
    }

    // Instead of deleting from DB, mark as deleted to preserve threaded replies structure
    comment.isDeleted = true;
    comment.text = "[This comment has been deleted]";
    // Keep upvotedBy empty
    comment.upvotedBy = [];
    await comment.save();

    res.json({ message: "Comment deleted" });
});
