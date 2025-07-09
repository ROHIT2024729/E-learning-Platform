import React from 'react';
import "./courseCard.css";
import { server } from '../../main';
import { UserData } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import StarRating from '../starRating/StarRating';

const CourseCard = ({ course }) => {
    if (!course) return null; 
    const {user, isAuth} = UserData();
    const navigate = useNavigate();

    return (
        <div className='course-card'>
            <div className="course-image-container">
                <img src={course.image ? `${server}/${course.image}` : "/default-image.png"} alt={course.title} className="course-image" />
                <div className="course-category">{course.category || "General"}</div>
            </div>
            <div className="course-card-content">
                <h3 className="course-title" title={course.title}>{course.title}</h3>
                <div className="course-instructor">
                    <span className="instructor-icon">👨‍🏫</span>
                    {course.createdBy}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <StarRating 
                        rating={course.ratings} 
                        totalRatings={course.ratings?.length || 0}
                        isInteractive={false}
                    />
                </div>
                <div className="course-meta">
                    <span className="course-duration">⏱️ {course.duration} weeks</span>
                    <span className="course-price">₹{course.price}</span>
                </div>
                
                <div className="course-actions">
                    {isAuth ? (
                        <>
                            {user && user.role !== "admin" ? (
                                <>
                                    {user.subscription.includes(course._id) ? (
                                        <button onClick={() => navigate(`/course/study/${course._id}`)} className="common-btn full-width">
                                            Study Now
                                        </button>
                                    ) : (
                                        <button onClick={() => navigate(`/course/${course._id}`)} className="common-btn outline-btn full-width">
                                            View Details
                                        </button>
                                    )}
                                </>
                            ) : (
                                <button onClick={() => navigate(`/course/study/${course._id}`)} className="common-btn full-width">
                                    Study Now
                                </button>
                            )}
                        </>
                    ) : (
                        <button onClick={() => navigate("/login")} className="common-btn full-width">
                            Get Started
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseCard;