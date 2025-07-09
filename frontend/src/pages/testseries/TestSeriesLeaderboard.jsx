import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/loading";
import "./testseries.css";

const TestSeriesLeaderboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const token = localStorage.getItem("token");
            try {
                const { data } = await axios.get(
                    `${server}/api/testseries/${id}/leaderboard`,
                    { headers: { token } }
                );
                setLeaderboard(data.leaderboard);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [id]);

    if (loading) return <Loading />;

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-header">
                <h1>🏆 Leaderboard</h1>
                <p>See how you compare with other students</p>
            </div>

            {leaderboard.length > 0 ? (
                <div className="leaderboard-table-container">
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Student</th>
                                <th>Score</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry) => (
                                <tr
                                    key={entry.rank}
                                    className={
                                        entry.rank <= 3
                                            ? `top-${entry.rank}`
                                            : ""
                                    }
                                >
                                    <td className="rank-cell">
                                        {entry.rank === 1
                                            ? "🥇"
                                            : entry.rank === 2
                                            ? "🥈"
                                            : entry.rank === 3
                                            ? "🥉"
                                            : `#${entry.rank}`}
                                    </td>
                                    <td>{entry.name}</td>
                                    <td>
                                        {entry.score}/10
                                    </td>
                                    <td>
                                        <div className="percentage-bar-container">
                                            <div
                                                className="percentage-bar"
                                                style={{
                                                    width: `${entry.percentage}%`,
                                                }}
                                            ></div>
                                            <span>{entry.percentage}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <h3>No submissions yet</h3>
                    <p>Be the first one to take this test!</p>
                </div>
            )}

            <div className="result-actions">
                <button
                    className="common-btn outline-btn"
                    onClick={() => navigate("/testseries")}
                >
                    ← Back to Tests
                </button>
            </div>
        </div>
    );
};

export default TestSeriesLeaderboard;
