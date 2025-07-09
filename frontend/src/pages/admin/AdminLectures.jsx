import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminData } from "../../context/AdminContext";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import "./admin.css";

const AdminLectures = ({ user }) => {
    const navigate = useNavigate();
    const params = useParams();
    const { addLecture, deleteLecture, loading } = AdminData();
    const { fetchLectures, lectures, course, fetechCourse } = CourseData();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [video, setVideo] = useState("");
    const [videoPrev, setVideoPrev] = useState("");

    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/");
            return;
        }
        fetechCourse(params.id);
        fetchLectures(params.id);
    }, [user, navigate, params.id]);

    const changeVideoHandler = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setVideoPrev(reader.result);
            setVideo(file);
        };
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const myForm = new FormData();
        myForm.append("title", title);
        myForm.append("description", description);
        myForm.append("file", video);

        const res = await addLecture(params.id, myForm);
        if (res) {
            setTitle("");
            setDescription("");
            setVideo("");
            setVideoPrev("");
            fetchLectures(params.id);
        }
    };

    const deleteHandler = async (id) => {
        if(window.confirm("Are you sure you want to delete this lecture?")) {
            const res = await deleteLecture(id);
            if(res) {
                fetchLectures(params.id);
            }
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h3>Admin Panel</h3>
                <ul>
                    <li onClick={() => navigate("/admin/dashboard")}>Dashboard</li>
                    <li onClick={() => navigate("/admin/course")}>Courses</li>
                    <li onClick={() => navigate("/admin/testseries")}>Test Series</li>
                    <li onClick={() => navigate("/admin/analytics")}>Analytics</li>
                    <li className="active">Manage Lectures</li>
                </ul>
            </div>
            <div className="admin-content">
                <h2>{course?.title} - Manage Lectures</h2>
                
                <div className="admin-courses-grid">
                    <div className="add-course-form">
                        <h3>Add New Lecture</h3>
                        <form onSubmit={submitHandler}>
                            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                            <input type="file" accept="video/*" onChange={changeVideoHandler} required />
                            {videoPrev && <video src={videoPrev} controls className="video-preview"></video>}
                            <button type="submit" disabled={loading} className="common-btn">
                                {loading ? "Please Wait..." : "Add Lecture"}
                            </button>
                        </form>
                    </div>

                    <div className="courses-list">
                        <h3>All Lectures</h3>
                        <div className="courses-list-items">
                            {lectures && lectures.length > 0 ? lectures.map((l, i) => (
                                <div key={l._id} className="admin-lecture-card">
                                    <div className="lecture-info">
                                        <h4>{i + 1}. {l.title}</h4>
                                        <p>{l.description}</p>
                                    </div>
                                    <button onClick={() => deleteHandler(l._id)} className="delete-btn">Delete</button>
                                </div>
                            )) : <p>No lectures added yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLectures;
