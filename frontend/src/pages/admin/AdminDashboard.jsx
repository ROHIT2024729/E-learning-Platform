import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminData } from "../../context/AdminContext";
import "./admin.css";

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const { stats, fetchStats } = AdminData();

    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/");
            return;
        }
        fetchStats();
    }, [user, navigate]);

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h3>Admin Panel</h3>
                <ul>
                    <li className="active" onClick={() => navigate("/admin/dashboard")}>Dashboard</li>
                    <li onClick={() => navigate("/admin/course")}>Courses</li>
                    <li onClick={() => navigate("/admin/testseries")}>Test Series</li>
                    <li onClick={() => navigate("/admin/analytics")}>Analytics</li>
                </ul>
            </div>
            <div className="admin-content">
                <h2>Dashboard Overview</h2>
                {stats ? (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Courses</h3>
                            <p>{stats.totalCourses}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Lectures</h3>
                            <p>{stats.totalLectures}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Users</h3>
                            <p>{stats.totalUsers}</p>
                        </div>
                    </div>
                ) : (
                    <p>Loading stats...</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
