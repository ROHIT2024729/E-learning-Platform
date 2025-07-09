import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaReply, FaTrash } from 'react-icons/fa';

const CommentItem = ({ comment, allComments, currentUserId, onUpvote, onReply, onDelete, depth = 0 }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');

    // Find children of this comment
    const children = allComments.filter(c => c.parentCommentId === comment._id);
    
    const hasUpvoted = comment.upvotedBy.includes(currentUserId);
    const isOwner = comment.userId?._id === currentUserId;

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;
        onReply(comment._id, replyText);
        setReplyText('');
        setShowReplyForm(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    return (
        <div className="comment-thread-container">
            <div className="comment-item">
                <div className="comment-avatar">
                    {comment.userId?.name ? comment.userId.name.charAt(0).toUpperCase() : "U"}
                </div>
                
                <div className="comment-content">
                    <div className="comment-header">
                        <span className="comment-author">{comment.userId?.name || "Unknown"}</span>
                        <span className="comment-time">{formatDate(comment.createdAt)}</span>
                        {isOwner && !comment.isDeleted && (
                            <button className="action-btn" onClick={() => onDelete(comment._id)} style={{marginLeft: 'auto'}} title="Delete">
                                <FaTrash size={12} />
                            </button>
                        )}
                    </div>
                    
                    {comment.isDeleted ? (
                        <p className="comment-text deleted-text">[This comment has been deleted]</p>
                    ) : (
                        <p className="comment-text">{comment.text}</p>
                    )}

                    <div className="comment-actions">
                        <button 
                            className={`action-btn ${hasUpvoted ? 'upvoted' : ''}`}
                            onClick={() => onUpvote(comment._id)}
                        >
                            {hasUpvoted ? <FaHeart /> : <FaRegHeart />} {comment.upvotedBy.length > 0 && comment.upvotedBy.length}
                        </button>
                        
                        {!comment.isDeleted && depth < 3 && (
                            <button className="action-btn" onClick={() => setShowReplyForm(!showReplyForm)}>
                                <FaReply /> Reply
                            </button>
                        )}
                    </div>

                    {showReplyForm && (
                        <div className="add-comment-form reply-form">
                            <div className="comment-input-wrapper">
                                <textarea 
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button className="common-btn outline-btn" onClick={() => setShowReplyForm(false)}>Cancel</button>
                                    <button className="common-btn" onClick={handleReplySubmit}>Reply</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recursively render children */}
            {children.length > 0 && (
                <div className="nested-replies">
                    {children.map(child => (
                        <CommentItem 
                            key={child._id}
                            comment={child}
                            allComments={allComments}
                            currentUserId={currentUserId}
                            onUpvote={onUpvote}
                            onReply={onReply}
                            onDelete={onDelete}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
