import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from '../../main';
import { UserData } from '../../context/UserContext';
import toast from 'react-hot-toast';
import CommentItem from './CommentItem';
import './VideoComments.css';

const VideoComments = ({ lectureId }) => {
    const { user, isAuth } = UserData();
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [sortBy, setSortBy] = useState('upvotes'); // 'upvotes' or 'newest'

    useEffect(() => {
        if (lectureId) {
            fetchComments();
        }
    }, [lectureId]);

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${server}/api/comments/${lectureId}`, {
                headers: { token }
            });
            setComments(data.comments);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!isAuth) return toast.error("Please login to comment");
        if (!newCommentText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${server}/api/comments/${lectureId}`, {
                text: newCommentText,
                parentCommentId: null
            }, { headers: { token } });
            
            setComments([data.comment, ...comments]);
            setNewCommentText('');
            toast.success("Comment posted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to post comment");
        }
    };

    const handleReply = async (parentCommentId, text) => {
        if (!isAuth) return toast.error("Please login to reply");
        
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${server}/api/comments/${lectureId}`, {
                text,
                parentCommentId
            }, { headers: { token } });
            
            // Add reply to state instantly
            setComments(prev => [...prev, data.comment]);
        } catch (error) {
            toast.error("Failed to post reply");
        }
    };

    const handleUpvote = async (commentId) => {
        if (!isAuth) return toast.error("Please login to upvote");

        // Optimistic UI update
        const originalComments = [...comments];
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                const newUpvotedBy = [...c.upvotedBy];
                const index = newUpvotedBy.indexOf(user._id);
                if (index === -1) newUpvotedBy.push(user._id);
                else newUpvotedBy.splice(index, 1);
                return { ...c, upvotedBy: newUpvotedBy };
            }
            return c;
        }));

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${server}/api/comments/upvote/${commentId}`, {}, { headers: { token } });
        } catch (error) {
            // Revert on failure
            setComments(originalComments);
            toast.error("Action failed");
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${server}/api/comments/${commentId}`, { headers: { token } });
            
            // Update UI
            setComments(prev => prev.map(c => 
                c._id === commentId ? { ...c, isDeleted: true, text: "[This comment has been deleted]", upvotedBy: [] } : c
            ));
            toast.success("Comment deleted");
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };

    // Filter and Sort Top-level Comments
    const topLevelComments = comments.filter(c => !c.parentCommentId);
    
    if (sortBy === 'upvotes') {
        topLevelComments.sort((a, b) => b.upvotedBy.length - a.upvotedBy.length);
    } else {
        topLevelComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return (
        <div className="video-comments-section">
            <div className="comments-header">
                <h3>{comments.length} Comments</h3>
                <select 
                    className="sort-select" 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="upvotes">Top Comments</option>
                    <option value="newest">Newest First</option>
                </select>
            </div>

            <div className="add-comment-form">
                <div className="comment-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <form className="comment-input-wrapper" onSubmit={handleAddComment}>
                    <textarea 
                        placeholder="Ask a doubt or share your thoughts..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    <button type="submit" className="common-btn" disabled={!newCommentText.trim()}>
                        Post Comment
                    </button>
                </form>
            </div>

            <div className="comments-list">
                {topLevelComments.length > 0 ? (
                    topLevelComments.map(comment => (
                        <CommentItem 
                            key={comment._id}
                            comment={comment}
                            allComments={comments}
                            currentUserId={user?._id}
                            onUpvote={handleUpvote}
                            onReply={handleReply}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: '30px'}}>
                        No comments yet. Be the first to start a discussion!
                    </p>
                )}
            </div>
        </div>
    );
};

export default VideoComments;
