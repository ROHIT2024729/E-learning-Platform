import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/loading";
import "./admin.css";
import "./adminAnalytics.css";
import {
    FaUsers,
    FaUserGraduate,
    FaUserShield,
    FaRupeeSign,
    FaBookOpen,
    FaClipboardCheck,
    FaChartLine,
    FaChartBar,
    FaFire,
    FaStar,
    FaArrowUp,
    FaArrowDown,
    FaCrown,
    FaPlay,
} from "react-icons/fa";

const AdminAnalytics = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/");
            return;
        }
        const fetch = async () => {
            const token = localStorage.getItem("token");
            try {
                const { data: res } = await axios.get(
                    `${server}/api/admin/analytics`,
                    { headers: { token } }
                );
                setData(res.analytics);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [user, navigate]);

    if (loading) return <Loading />;
    if (!data) return <div className="admin-container"><p>Failed to load analytics</p></div>;

    const { users, revenue, courses, tests } = data;

    // Helper for bar chart heights
    const maxVal = (arr, key) => Math.max(...arr.map(i => i[key]), 1);

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h3>Admin Panel</h3>
                <ul>
                    <li onClick={() => navigate("/admin/dashboard")}>Dashboard</li>
                    <li onClick={() => navigate("/admin/course")}>Courses</li>
                    <li onClick={() => navigate("/admin/testseries")}>Test Series</li>
                    <li className="active" onClick={() => navigate("/admin/analytics")}>Analytics</li>
                </ul>
            </div>
            <div className="admin-content ana-content">
                <h2><FaChartLine /> Platform Analytics</h2>

                {/* ===== TOP SUMMARY CARDS ===== */}
                <div className="ana-top-cards">
                    <div className="ana-card ac-green">
                        <div className="ac-icon-wrap green"><FaUsers /></div>
                        <div className="ac-info">
                            <span className="ac-num">{users.totalUsers}</span>
                            <span className="ac-label">Total Users</span>
                        </div>
                        <span className="ac-badge">+{users.newUsersWeek} this week</span>
                    </div>
                    <div className="ana-card ac-blue">
                        <div className="ac-icon-wrap blue"><FaFire /></div>
                        <div className="ac-info">
                            <span className="ac-num">{users.activeToday}</span>
                            <span className="ac-label">Active Today</span>
                        </div>
                        <span className="ac-badge">{users.activeWeek} this week</span>
                    </div>
                    <div className="ana-card ac-purple">
                        <div className="ac-icon-wrap purple"><FaRupeeSign /></div>
                        <div className="ac-info">
                            <span className="ac-num">₹{revenue.totalRevenue.toLocaleString()}</span>
                            <span className="ac-label">Total Revenue</span>
                        </div>
                        <span className="ac-badge">{revenue.totalPayments} payments</span>
                    </div>
                    <div className="ana-card ac-orange">
                        <div className="ac-icon-wrap orange"><FaBookOpen /></div>
                        <div className="ac-info">
                            <span className="ac-num">{courses.totalCourses}</span>
                            <span className="ac-label">Courses</span>
                        </div>
                        <span className="ac-badge">{courses.totalLectures} lectures</span>
                    </div>
                    <div className="ana-card ac-teal">
                        <div className="ac-icon-wrap teal"><FaClipboardCheck /></div>
                        <div className="ac-info">
                            <span className="ac-num">{tests.totalTests}</span>
                            <span className="ac-label">Test Series</span>
                        </div>
                        <span className="ac-badge">{tests.totalSubmissions} attempts</span>
                    </div>
                </div>

                {/* ===== USER & ACTIVE USERS SECTION ===== */}
                <div className="ana-grid-2">
                    {/* User Breakdown */}
                    <div className="ana-panel">
                        <h3><FaUserGraduate /> User Breakdown</h3>
                        <div className="user-breakdown">
                            <div className="ub-item">
                                <span className="ub-dot student"></span>
                                <span>Students</span>
                                <strong>{users.totalStudents}</strong>
                            </div>
                            <div className="ub-item">
                                <span className="ub-dot admin"></span>
                                <span>Admins</span>
                                <strong>{users.totalAdmins}</strong>
                            </div>
                            <div className="ub-item">
                                <span className="ub-dot new"></span>
                                <span>New Today</span>
                                <strong>{users.newUsersToday}</strong>
                            </div>
                            <div className="ub-item">
                                <span className="ub-dot month"></span>
                                <span>This Month</span>
                                <strong>{users.newUsersMonth}</strong>
                            </div>
                        </div>

                        {/* User Growth Chart */}
                        <h4>User Signups (6 months)</h4>
                        <div className="mini-chart">
                            {users.userGrowth.map((m, i) => (
                                <div className="mc-col" key={i}>
                                    <div
                                        className="mc-bar green-bar"
                                        style={{ height: `${(m.count / maxVal(users.userGrowth, "count")) * 100}%` }}
                                    >
                                        <span className="mc-val">{m.count}</span>
                                    </div>
                                    <span className="mc-label">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Users */}
                    <div className="ana-panel">
                        <h3><FaFire /> Active Users</h3>
                        <div className="active-cards">
                            <div className="active-card">
                                <span className="av-num">{users.activeToday}</span>
                                <span className="av-label">Today</span>
                            </div>
                            <div className="active-card">
                                <span className="av-num">{users.activeWeek}</span>
                                <span className="av-label">This Week</span>
                            </div>
                            <div className="active-card">
                                <span className="av-num">{users.activeMonth}</span>
                                <span className="av-label">This Month</span>
                            </div>
                        </div>

                        {/* Activity Rate */}
                        <h4>Engagement Rate</h4>
                        <div className="engagement-bar-wrap">
                            <div className="engagement-bar">
                                <div
                                    className="engagement-fill"
                                    style={{ width: `${users.totalUsers > 0 ? ((users.activeMonth / users.totalUsers) * 100).toFixed(0) : 0}%` }}
                                ></div>
                            </div>
                            <span className="engagement-pct">
                                {users.totalUsers > 0 ? ((users.activeMonth / users.totalUsers) * 100).toFixed(0) : 0}% monthly active
                            </span>
                        </div>
                    </div>
                </div>

                {/* ===== REVENUE SECTION ===== */}
                <div className="ana-grid-2">
                    <div className="ana-panel">
                        <h3><FaRupeeSign /> Revenue Overview</h3>
                        <div className="rev-summary">
                            <div className="rev-item">
                                <FaBookOpen className="rev-icon green" />
                                <div>
                                    <strong>₹{revenue.totalCourseRevenue.toLocaleString()}</strong>
                                    <span>Course Revenue</span>
                                </div>
                            </div>
                            <div className="rev-item">
                                <FaClipboardCheck className="rev-icon blue" />
                                <div>
                                    <strong>₹{revenue.totalTestRevenue.toLocaleString()}</strong>
                                    <span>Test Revenue</span>
                                </div>
                            </div>
                        </div>

                        {/* Transactions Chart */}
                        <h4>Transactions (6 months)</h4>
                        <div className="mini-chart">
                            {revenue.revenueByMonth.map((m, i) => (
                                <div className="mc-col" key={i}>
                                    <div
                                        className="mc-bar purple-bar"
                                        style={{ height: `${(m.transactions / maxVal(revenue.revenueByMonth, "transactions")) * 100}%` }}
                                    >
                                        <span className="mc-val">{m.transactions}</span>
                                    </div>
                                    <span className="mc-label">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Revenue Courses */}
                    <div className="ana-panel">
                        <h3><FaCrown /> Top Revenue Courses</h3>
                        <div className="top-list">
                            {revenue.courseRevenueList.slice(0, 5).map((c, i) => (
                                <div className="top-item" key={i}>
                                    <span className="top-rank">#{i + 1}</span>
                                    <div className="top-info">
                                        <strong>{c.title}</strong>
                                        <span>{c.enrolled} enrolled • ₹{c.price}/course</span>
                                    </div>
                                    <span className="top-val">₹{c.revenue.toLocaleString()}</span>
                                </div>
                            ))}
                            {revenue.courseRevenueList.length === 0 && (
                                <p className="empty-msg">No course revenue data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== COURSE PERFORMANCE ===== */}
                <div className="ana-panel full">
                    <h3><FaBookOpen /> Course Performance</h3>
                    <div className="perf-table-wrap">
                        <table className="perf-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Course</th>
                                    <th>Category</th>
                                    <th>Lectures</th>
                                    <th>Enrolled</th>
                                    <th>Rating</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.coursePerformance.map((c, i) => (
                                    <tr key={c._id}>
                                        <td>{i + 1}</td>
                                        <td><strong>{c.title}</strong></td>
                                        <td><span className="cat-badge">{c.category}</span></td>
                                        <td>{c.lectures}</td>
                                        <td>
                                            <span className="enrolled-badge">{c.enrolled}</span>
                                        </td>
                                        <td>
                                            {c.avgRating > 0 ? (
                                                <span className="rating-badge">
                                                    <FaStar /> {c.avgRating}
                                                </span>
                                            ) : (
                                                <span className="no-rating">—</span>
                                            )}
                                        </td>
                                        <td><strong>₹{c.revenue.toLocaleString()}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ===== TEST ANALYTICS ===== */}
                <div className="ana-grid-2">
                    <div className="ana-panel">
                        <h3><FaClipboardCheck /> Test Overview</h3>
                        <div className="test-overview-grid">
                            <div className="to-item">
                                <span className="to-num">{tests.totalTests}</span>
                                <span>Total Tests</span>
                            </div>
                            <div className="to-item">
                                <span className="to-num">{tests.totalSubmissions}</span>
                                <span>Attempts</span>
                            </div>
                            <div className="to-item">
                                <span className="to-num">{tests.avgTestScore}/10</span>
                                <span>Avg Score</span>
                            </div>
                            <div className="to-item">
                                <span className="to-num">{tests.freeTests}/{tests.paidTests}</span>
                                <span>Free/Paid</span>
                            </div>
                        </div>

                        {/* Test Attempts Chart */}
                        <h4>Test Attempts (6 months)</h4>
                        <div className="mini-chart">
                            {tests.testsByMonth.map((m, i) => (
                                <div className="mc-col" key={i}>
                                    <div
                                        className="mc-bar teal-bar"
                                        style={{ height: `${(m.attempts / maxVal(tests.testsByMonth, "attempts")) * 100}%` }}
                                    >
                                        <span className="mc-val">{m.attempts}</span>
                                    </div>
                                    <span className="mc-label">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Score Distribution */}
                    <div className="ana-panel">
                        <h3><FaChartBar /> Score Distribution</h3>
                        <div className="score-dist">
                            {tests.scoreDistribution.map((count, score) => (
                                <div className="sd-col" key={score}>
                                    <div
                                        className="sd-bar"
                                        style={{
                                            height: `${(count / Math.max(...tests.scoreDistribution, 1)) * 100}%`,
                                        }}
                                    >
                                        {count > 0 && <span className="sd-val">{count}</span>}
                                    </div>
                                    <span className="sd-label">{score}</span>
                                </div>
                            ))}
                        </div>
                        <p className="sd-axis">Score (out of 10)</p>
                    </div>
                </div>

                {/* ===== TOP TESTS TABLE ===== */}
                <div className="ana-panel full">
                    <h3><FaClipboardCheck /> Test Series Performance</h3>
                    <div className="perf-table-wrap">
                        <table className="perf-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Test Title</th>
                                    <th>Type</th>
                                    <th>Attempts</th>
                                    <th>Avg Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tests.testPerformance.map((t, i) => (
                                    <tr key={t._id}>
                                        <td>{i + 1}</td>
                                        <td><strong>{t.title}</strong></td>
                                        <td>
                                            <span className={`type-badge ${t.type}`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td>{t.attempts}</td>
                                        <td>
                                            <span className={`score-badge ${t.avgScore >= 7 ? "good" : t.avgScore >= 4 ? "avg" : "low"}`}>
                                                {t.avgScore}/10
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
