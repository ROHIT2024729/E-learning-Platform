import React, { useEffect, useState } from "react";
import "./leaderboard.css";
import axios from "axios";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/loading";
import {
    FaTrophy,
    FaFire,
    FaMedal,
    FaStar,
    FaBookOpen,
    FaClipboardCheck,
    FaChevronRight,
    FaCrown,
    FaArrowUp,
} from "react-icons/fa";

const GlobalLeaderboard = () => {
    const { user } = UserData();
    const [leaderboard, setLeaderboard] = useState([]);
    const [myEntry, setMyEntry] = useState(null);
    const [myStats, setMyStats] = useState(null);
    const [period, setPeriod] = useState("all");
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async (p) => {
        const token = localStorage.getItem("token");
        try {
            const { data } = await axios.get(
                `${server}/api/gamification/leaderboard?period=${p}`,
                { headers: { token } }
            );
            setLeaderboard(data.leaderboard);
            setMyEntry(data.myEntry);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyStats = async () => {
        const token = localStorage.getItem("token");
        try {
            const { data } = await axios.get(
                `${server}/api/gamification/my-stats`,
                { headers: { token } }
            );
            setMyStats(data.stats);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const load = async () => {
            await Promise.all([fetchLeaderboard(period), fetchMyStats()]);
            setLoading(false);
        };
        load();
    }, []);

    const handlePeriodChange = async (p) => {
        setPeriod(p);
        await fetchLeaderboard(p);
    };

    if (loading) return <Loading />;

    return (
        <div className="lb-page">
            {/* Hero */}
            <section className="lb-hero">
                <div className="lb-hero-shapes">
                    <div className="lbs lbs1"></div>
                    <div className="lbs lbs2"></div>
                    <div className="lbs lbs3"></div>
                </div>
                <div className="lb-hero-content">
                    <h1>
                        <FaTrophy className="lb-hero-icon" /> Leaderboard
                    </h1>
                    <p>Compete with fellow students and climb the ranks!</p>
                </div>
            </section>

            {/* My Stats Bar */}
            {myStats && (
                <section className="lb-my-stats">
                    <div className="my-stats-grid">
                        <div className="my-stat">
                            <FaCrown className="ms-icon gold" />
                            <div>
                                <span className="ms-num">#{myEntry?.rank || "-"}</span>
                                <span className="ms-label">Your Rank</span>
                            </div>
                        </div>
                        <div className="my-stat">
                            <FaStar className="ms-icon purple" />
                            <div>
                                <span className="ms-num">{myStats.totalPoints}</span>
                                <span className="ms-label">Total Points</span>
                            </div>
                        </div>
                        <div className="my-stat">
                            <FaFire className="ms-icon orange" />
                            <div>
                                <span className="ms-num">{myStats.currentStreak} 🔥</span>
                                <span className="ms-label">Day Streak</span>
                            </div>
                        </div>
                        <div className="my-stat">
                            <FaMedal className="ms-icon green" />
                            <div>
                                <span className="ms-num">{myStats.badges.length}</span>
                                <span className="ms-label">Badges</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Badges */}
            {myStats && myStats.allBadges && (
                <section className="lb-section">
                    <div className="lb-container">
                        <h2><FaMedal /> Your Badges</h2>
                        <div className="badges-grid">
                            {myStats.allBadges.map((b) => (
                                <div
                                    key={b.id}
                                    className={`badge-card ${b.earned ? "earned" : "locked"}`}
                                >
                                    <span className="badge-icon">{b.icon}</span>
                                    <span className="badge-name">{b.name}</span>
                                    {!b.earned && <span className="badge-lock">🔒</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Streak & Points History */}
            {myStats && (
                <section className="lb-section">
                    <div className="lb-container">
                        <div className="streak-points-grid">
                            {/* Streak */}
                            <div className="sp-card streak-card">
                                <div className="streak-visual">
                                    <div className="streak-ring">
                                        <span className="streak-num">{myStats.currentStreak}</span>
                                        <span className="streak-days">days</span>
                                    </div>
                                </div>
                                <h3>🔥 Daily Streak</h3>
                                <p>Longest: {myStats.longestStreak} days</p>
                                <p className="streak-tip">Study daily to grow your streak and earn bonus points!</p>
                            </div>

                            {/* Recent Points */}
                            <div className="sp-card">
                                <h3><FaArrowUp /> Recent Points</h3>
                                {myStats.recentPoints.length > 0 ? (
                                    <div className="points-list">
                                        {myStats.recentPoints.map((p, i) => (
                                            <div className="points-item" key={i}>
                                                <div className="pi-left">
                                                    <span className={`pi-dot ${p.action}`}></span>
                                                    <span className="pi-desc">{p.description}</span>
                                                </div>
                                                <span className="pi-pts">+{p.points}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="empty-text">No points earned yet. Start studying!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Leaderboard Table */}
            <section className="lb-section">
                <div className="lb-container">
                    <div className="lb-table-header">
                        <h2><FaTrophy /> Rankings</h2>
                        <div className="period-tabs">
                            {["daily", "weekly", "all"].map((p) => (
                                <button
                                    key={p}
                                    className={`period-tab ${period === p ? "active" : ""}`}
                                    onClick={() => handlePeriodChange(p)}
                                >
                                    {p === "all" ? "Overall" : p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {leaderboard.length > 0 ? (
                        <div className="lb-table">
                            {/* Top 3 Podium */}
                            {leaderboard.length >= 3 && (
                                <div className="podium">
                                    {[1, 0, 2].map((idx) => {
                                        const e = leaderboard[idx];
                                        if (!e) return null;
                                        return (
                                            <div
                                                key={idx}
                                                className={`podium-card p-${e.rank} ${e.isMe ? "is-me" : ""}`}
                                            >
                                                <div className="podium-medal">
                                                    {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : "🥉"}
                                                </div>
                                                <div className="podium-avatar">
                                                    {e.name.charAt(0).toUpperCase()}
                                                </div>
                                                <h4>{e.name}</h4>
                                                <span className="podium-pts">{e.totalPoints} pts</span>
                                                <div className="podium-meta">
                                                    <span>🔥 {e.currentStreak}</span>
                                                    <span>🏅 {e.badges}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Rest of the list */}
                            <div className="lb-list">
                                {leaderboard.slice(3).map((e) => (
                                    <div
                                        key={e.rank}
                                        className={`lb-row ${e.isMe ? "is-me" : ""}`}
                                    >
                                        <span className="lb-rank">#{e.rank}</span>
                                        <div className="lb-avatar-sm">
                                            {e.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="lb-name-col">
                                            <span className="lb-name">
                                                {e.name} {e.isMe && "(You)"}
                                            </span>
                                        </div>
                                        <span className="lb-stat">
                                            <FaBookOpen /> {e.lecturesCompleted}
                                        </span>
                                        <span className="lb-stat">
                                            <FaClipboardCheck /> {e.testsCompleted}
                                        </span>
                                        <span className="lb-stat">
                                            <FaFire /> {e.currentStreak}
                                        </span>
                                        <span className="lb-pts">{e.totalPoints} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="lb-empty">
                            <FaTrophy className="lb-empty-icon" />
                            <p>No students on the leaderboard for this period yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default GlobalLeaderboard;
