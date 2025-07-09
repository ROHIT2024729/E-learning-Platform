import React, { useEffect, useState } from 'react';
import "./courseDescription.css";
import { useNavigate, useParams } from 'react-router-dom';
import { CourseData } from '../../context/CourseContext';
import { server } from '../../main';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserData } from '../../context/UserContext';
import Loading from '../../components/loading/loading';
import StarRating from '../../components/starRating/StarRating';

const CourseDescription = ({ user }) => {
    const params = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const { fetechCourse, course, fetechCourses, fetechMyCourse } = CourseData();
    const { fetechUser } = UserData();
    
    useEffect(() => {
        fetechCourse(params.id);
    }, [params.id]);

    const handleRating = async (newRating) => {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Please login to rate this course");
        
        try {
            await axios.post(`${server}/api/course/${params.id}/rate`, { rating: newRating }, {
                headers: { token }
            });
            toast.success("Rating submitted!");
            fetechCourse(params.id); // Refresh course data to show updated rating
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit rating");
        }
    };

    const checkoutHandler = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("You must be logged in to checkout.");
            navigate("/login");
            return;
        }
        setLoading(true);

        try {
            const { data: { order } } = await axios.post(`${server}/api/course/checkout/${params.id}`, {}, {
                headers: { token },
            });

            const options = {
                key: "rzp_test_RUrTd5r5lro1jJ",
                amount: order.id,
                currency: "INR",
                name: "EduPlatform",
                description: "Learn with Us.",
                order_id: order.id,
                handler: async function (response) {
                    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response || {};
                    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                        toast.error("Incomplete payment response from Razorpay.");
                        setLoading(false);
                        return;
                    }
                    try {
                        const { data } = await axios.post(`${server}/api/verification/${params.id}`,
                            { razorpay_order_id, razorpay_payment_id, razorpay_signature },
                            { headers: { token } }
                        );

                        await fetechUser();
                        await fetechCourses();
                        await fetechMyCourse();
                        toast.success(data.message);
                        setLoading(false);
                        navigate(`/payment-success/${razorpay_payment_id}`);
                    } catch (err) {
                        toast.error(err.response?.data?.message || "Payment verification failed");
                        setLoading(false);
                    }
                },
                theme: { color: "#08bd80" },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to initiate checkout");
            setLoading(false);
        }
    }

    return (
        <div className="course-description-container">
            {loading ? (
                <Loading />
            ) : course ? (
                <div className='course-description-content'>
                    <div className='course-header'>
                        <img src={course.image ? `${server}/${course.image}` : "/default-image.png"} alt={course.title} className="course-image" />
                        <div className='course-info'>
                            <h2>{course.title}</h2>
                            <p className="instructor"><strong>Instructor:</strong> {course.createdBy}</p>
                            <p className="duration"><strong>Duration:</strong> {course.duration} weeks</p>
                            <p className="category"><strong>Category:</strong> {course.category || "General"}</p>
                            <div style={{ marginTop: '15px' }}>
                                <StarRating 
                                    rating={course.ratings} 
                                    totalRatings={course.ratings?.length || 0}
                                    isInteractive={user && user.subscription && user.subscription.includes(course._id)}
                                    setRating={handleRating}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="course-details">
                        <h3>About this course</h3>
                        <p>{course.description}</p>
                    </div>
                    
                    <div className="course-checkout-card">
                        <h3>Let's get started</h3>
                        <div className="price-tag">₹{course.price}</div>
                        
                        {user && user.subscription && user.subscription.includes(course._id) ? (
                            <button onClick={() => navigate(`/course/study/${course._id}`)} className='common-btn study-btn'>Start Studying</button>
                        ) : (
                            <button onClick={checkoutHandler} className='common-btn buy-btn'>Enroll Now</button>
                        )}
                    </div>
                </div>
            ) : (
                <p>Course not found</p>
            )}
        </div>
    );
}

export default CourseDescription;