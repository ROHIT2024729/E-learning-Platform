import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/loading";
import {
    FaBookOpen,
    FaClipboardCheck,
    FaTrophy,
    FaChartLine,
    FaCheckCircle,
    FaTimesCircle,
    FaFire,
    FaExclamationTriangle,
    FaStar,
    FaArrowRight,
    FaPlay,
    FaGraduationCap,
    FaRocket,
} from "react-icons/fa";

const Dashboard = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            const token = localStorage.getItem("token");
            try {
                const { data: res } = await axios.get(
                    `${server}/api/student/dashboard`,
                    { headers: { token } }
                );
                setData(res.dashboard);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <Loading />;
    if (!data) return <div className="dash-empty">Failed to load dashboard</div>;

    const { courseStats, testStats, topicAnalysis, recentActivity } = data;

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good Morning";
        if (h < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="dash-page">
            {/* ===== WELCOME HERO ===== */}
            <section className="dash-hero">
                <div className="dash-hero-bg">
                    <div className="hero-shape hs1"></div>
                    <div className="hero-shape hs2"></div>
                    <div className="hero-shape hs3"></div>
                </div>
                <div className="dash-hero-content">
                    <div className="dash-hero-left">
                        <span className="dash-greeting-badge">
                            <FaGraduationCap /> Student Dashboard
                        </span>
                        <h1>
                            {getGreeting()},{" "}
                            <span className="dash-gradient">
                                {data.user.name}
                            </span>
                            ! 👋
                        </h1>
                        <p>
                            {courseStats.totalEnrolled > 0
                                ? `You're enrolled in ${courseStats.totalEnrolled} course${courseStats.totalEnrolled > 1 ? "s" : ""} with ${courseStats.totalLectures} lectures. Keep going!`
                                : "Start your learning journey by enrolling in a course today!"}
                        </p>
                        <button
                            className="common-btn dash-cta"
                            onClick={() => navigate("/courses")}
                        >
                            <FaRocket /> Continue Learning
                        </button>
                    </div>
                    <div className="dash-hero-right">
                        <div className="hero-stat-card hsc-1">
                            <FaBookOpen className="hsc-icon" />
                            <div>
                                <span className="hsc-num">{courseStats.totalEnrolled}</span>
                                <span className="hsc-label">Courses</span>
                            </div>
                        </div>
                        <div className="hero-stat-card hsc-2">
                            <FaClipboardCheck className="hsc-icon" />
                            <div>
                                <span className="hsc-num">{testStats.testsAttempted}</span>
                                <span className="hsc-label">Tests Taken</span>
                            </div>
                        </div>
                        <div className="hero-stat-card hsc-3">
                            <FaTrophy className="hsc-icon" />
                            <div>
                                <span className="hsc-num">{testStats.highestScore}/10</span>
                                <span className="hsc-label">Best Score</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SUMMARY CARDS ===== */}
            <section className="dash-section">
                <div className="summary-grid">
                    <div className="summary-card sc-green">
                        <div className="sc-icon-wrap green">
                            <FaBookOpen />
                        </div>
                        <div className="sc-info">
                            <span className="sc-number">{courseStats.totalEnrolled}</span>
                            <span className="sc-label">Enrolled Courses</span>
                        </div>
                    </div>
                    <div className="summary-card sc-blue">
                        <div className="sc-icon-wrap blue">
                            <FaPlay />
                        </div>
                        <div className="sc-info">
                            <span className="sc-number">{courseStats.totalLectures}</span>
                            <span className="sc-label">Total Lectures</span>
                        </div>
                    </div>
                    <div className="summary-card sc-purple">
                        <div className="sc-icon-wrap purple">
                            <FaClipboardCheck />
                        </div>
                        <div className="sc-info">
                            <span className="sc-number">{testStats.testsAttempted}</span>
                            <span className="sc-label">Tests Attempted</span>
                        </div>
                    </div>
                    <div className="summary-card sc-orange">
                        <div className="sc-icon-wrap orange">
                            <FaChartLine />
                        </div>
                        <div className="sc-info">
                            <span className="sc-number">{testStats.averageScore}/10</span>
                            <span className="sc-label">Avg Score</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== GAMIFICATION BAR ===== */}
            {data.gamification && (
                <section className="dash-section">
                    <div className="gam-bar">
                        <div className="gam-item">
                            <div className="gam-streak-ring">
                                <span>{data.gamification.currentStreak}</span>
                            </div>
                            <div className="gam-text">
                                <strong>🔥 Day Streak</strong>
                                <span>Best: {data.gamification.longestStreak}</span>
                            </div>
                        </div>
                        <div className="gam-item">
                            <FaStar className="gam-icon gold" />
                            <div className="gam-text">
                                <strong>{data.gamification.totalPoints} pts</strong>
                                <span>Total Points</span>
                            </div>
                        </div>
                        <div className="gam-item">
                            <FaTrophy className="gam-icon amber" />
                            <div className="gam-text">
                                <strong>#{data.gamification.rank || "-"}</strong>
                                <span>Your Rank</span>
                            </div>
                        </div>
                        <div className="gam-item">
                            <span className="gam-badges-count">{data.gamification.badges.length}</span>
                            <div className="gam-text">
                                <strong>Badges</strong>
                                <span
                                    className="gam-link"
                                    onClick={() => navigate("/leaderboard")}
                                >
                                    View All →
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== MAIN GRID ===== */}
            <section className="dash-section">
                <div className="dash-main-grid">
                    {/* Left Column */}
                    <div className="dash-col-left">
                        {/* Test Performance */}
                        <div className="dash-card">
                            <div className="dash-card-header">
                                <h3><FaChartLine /> Test Performance</h3>
                            </div>
                            {testStats.testsAttempted > 0 ? (
                                <>
                                    <div className="perf-stats-row">
                                        <div className="perf-stat">
                                            <span className="perf-num green">{testStats.highestScore}</span>
                                            <span className="perf-label">Highest</span>
                                        </div>
                                        <div className="perf-stat">
                                            <span className="perf-num red">{testStats.lowestScore}</span>
                                            <span className="perf-label">Lowest</span>
                                        </div>
                                        <div className="perf-stat">
                                            <span className="perf-num blue">{testStats.averageScore}</span>
                                            <span className="perf-label">Average</span>
                                        </div>
                                    </div>

                                    {/* Correct vs Wrong */}
                                    <div className="cw-section">
                                        <h4>Correct vs Wrong</h4>
                                        <div className="cw-bar">
                                            <div
                                                className="cw-fill correct"
                                                style={{
                                                    width: `${(testStats.totalCorrect / (testStats.totalCorrect + testStats.totalWrong)) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="cw-labels">
                                            <span className="cw-label correct">
                                                <FaCheckCircle /> {testStats.totalCorrect} Correct
                                            </span>
                                            <span className="cw-label wrong">
                                                <FaTimesCircle /> {testStats.totalWrong} Wrong
                                            </span>
                                        </div>
                                    </div>

                                    {/* Performance Trend */}
                                    {testStats.performanceTrend.length > 1 && (
                                        <div className="trend-section">
                                            <h4>Performance Trend</h4>
                                            <div className="trend-chart">
                                                {testStats.performanceTrend.map((t, i) => (
                                                    <div className="trend-bar-wrap" key={i}>
                                                        <div
                                                            className="trend-bar"
                                                            style={{ height: `${t.percentage}%` }}
                                                            title={`${t.label}: ${t.score}/10`}
                                                        >
                                                            <span className="trend-val">{t.score}</span>
                                                        </div>
                                                        <span className="trend-label">{t.label.substring(0, 8)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dash-empty-state">
                                    <FaClipboardCheck className="empty-icon" />
                                    <p>No tests attempted yet</p>
                                    <button className="common-btn" onClick={() => navigate("/testseries")}>
                                        Take a Test
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Enrolled Courses */}
                        <div className="dash-card">
                            <div className="dash-card-header">
                                <h3><FaBookOpen /> My Courses</h3>
                                <button className="see-all" onClick={() => navigate("/courses")}>
                                    See All <FaArrowRight />
                                </button>
                            </div>
                            {courseStats.courses.length > 0 ? (
                                <div className="enrolled-list">
                                    {courseStats.courses.slice(0, 4).map((c) => (
                                        <div
                                            className="enrolled-item"
                                            key={c._id}
                                            onClick={() => navigate(`/course/study/${c._id}`)}
                                        >
                                            <div className="ei-info">
                                                <h4>{c.title}</h4>
                                                <span className="ei-meta">
                                                    {c.totalLectures} Lectures • {c.category}
                                                </span>
                                            </div>
                                            <FaArrowRight className="ei-arrow" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="dash-empty-state">
                                    <FaBookOpen className="empty-icon" />
                                    <p>No courses enrolled yet</p>
                                    <button className="common-btn" onClick={() => navigate("/courses")}>
                                        Browse Courses
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="dash-col-right">
                        {/* Strong & Weak Topics */}
                        <div className="dash-card">
                            <div className="dash-card-header">
                                <h3><FaStar /> Topic Analysis</h3>
                            </div>
                            {topicAnalysis.allTopics.length > 0 ? (
                                <>
                                    {topicAnalysis.strongTopics.length > 0 && (
                                        <div className="topic-group">
                                            <h4 className="topic-group-title strong">
                                                <FaFire /> Strong Topics
                                            </h4>
                                            {topicAnalysis.strongTopics.map((t, i) => (
                                                <div className="topic-item" key={i}>
                                                    <div className="topic-info">
                                                        <span className="topic-name">{t.topic}</span>
                                                        <span className="topic-pct">{t.percentage}%</span>
                                                    </div>
                                                    <div className="topic-bar">
                                                        <div
                                                            className="topic-fill strong"
                                                            style={{ width: `${t.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {topicAnalysis.weakTopics.length > 0 && (
                                        <div className="topic-group">
                                            <h4 className="topic-group-title weak">
                                                <FaExclamationTriangle /> Needs Improvement
                                            </h4>
                                            {topicAnalysis.weakTopics.map((t, i) => (
                                                <div className="topic-item" key={i}>
                                                    <div className="topic-info">
                                                        <span className="topic-name">{t.topic}</span>
                                                        <span className="topic-pct">{t.percentage}%</span>
                                                    </div>
                                                    <div className="topic-bar">
                                                        <div
                                                            className="topic-fill weak"
                                                            style={{ width: `${t.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="dash-empty-state small">
                                    <p>Take tests to see topic analysis</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="dash-card">
                            <div className="dash-card-header">
                                <h3><FaFire /> Recent Activity</h3>
                            </div>
                            {recentActivity.length > 0 ? (
                                <div className="activity-list">
                                    {recentActivity.map((a, i) => (
                                        <div className="activity-item" key={i}>
                                            <div className={`activity-dot ${a.icon}`}></div>
                                            <div className="activity-info">
                                                <span className="activity-title">{a.title}</span>
                                                <span className="activity-date">
                                                    {new Date(a.date).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="dash-empty-state small">
                                    <p>No recent activity yet. Start learning!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;