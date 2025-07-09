import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminData } from "../../context/AdminContext";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import "./admin.css";

const AdminCourses = ({ user }) => {
    const navigate = useNavigate();
    const { createCourse, deleteCourse, loading } = AdminData();
    const { courses, fetechCourses } = CourseData();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [image, setImage] = useState("");
    const [imagePrev, setImagePrev] = useState("");

    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/");
            return;
        }
    }, [user, navigate]);

    const changeImageHandler = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImagePrev(reader.result);
            setImage(file);
        };
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const myForm = new FormData();
        myForm.append("title", title);
        myForm.append("description", description);
        myForm.append("category", category);
        myForm.append("price", price);
        myForm.append("duration", duration);
        myForm.append("createdBy", user.name);
        myForm.append("file", image);

        const res = await createCourse(myForm);
        if (res) {
            setTitle("");
            setDescription("");
            setCategory("");
            setPrice("");
            setDuration("");
            setImage("");
            setImagePrev("");
            fetechCourses();
        }
    };

    const deleteHandler = async (id) => {
        if(window.confirm("Are you sure you want to delete this course?")) {
            const res = await deleteCourse(id);
            if(res) {
                fetechCourses();
            }
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h3>Admin Panel</h3>
                <ul>
                    <li onClick={() => navigate("/admin/dashboard")}>Dashboard</li>
                    <li className="active" onClick={() => navigate("/admin/course")}>Courses</li>
                    <li onClick={() => navigate("/admin/testseries")}>Test Series</li>
                    <li onClick={() => navigate("/admin/analytics")}>Analytics</li>
                </ul>
            </div>
            <div className="admin-content">
                <h2>Manage Courses</h2>
                
                <div className="admin-courses-grid">
                    <div className="add-course-form">
                        <h3>Add New Course</h3>
                        <form onSubmit={submitHandler}>
                            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                            <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
                            <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            <input type="number" placeholder="Duration (weeks)" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                            <input type="file" accept="image/*" onChange={changeImageHandler} required />
                            {imagePrev && <img src={imagePrev} alt="preview" className="image-preview" />}
                            <button type="submit" disabled={loading} className="common-btn">
                                {loading ? "Please Wait..." : "Add Course"}
                            </button>
                        </form>
                    </div>

                    <div className="courses-list">
                        <h3>All Courses</h3>
                        <div className="courses-list-items">
                            {courses && courses.map((course) => (
                                <div key={course._id} className="admin-course-card">
                                    <img src={`${server}/${course.image}`} alt={course.title} />
                                    <div className="admin-course-info">
                                        <h4>{course.title}</h4>
                                        <p>Price: ₹{course.price}</p>
                                    </div>
                                    <div className="admin-course-actions">
                                        <button onClick={() => navigate(`/admin/course/${course._id}`)} className="edit-btn">Manage</button>
                                        <button onClick={() => deleteHandler(course._id)} className="delete-btn">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCourses;
