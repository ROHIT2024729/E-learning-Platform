import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { addComment, deleteComment, getComments, toggleUpvote } from "../controller/comment.js";

const router = express.Router();

router.get('/comments/:lectureId', isAuth, getComments);
router.post('/comments/:lectureId', isAuth, addComment);
router.post('/comments/upvote/:commentId', isAuth, toggleUpvote);
router.delete('/comments/:commentId', isAuth, deleteComment);

export default router;
