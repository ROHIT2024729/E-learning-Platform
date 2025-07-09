import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/loading";
import "./testseries.css";
import toast from "react-hot-toast";

const TestSeriesTake = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = UserData();
    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState(Array(10).fill(-1));
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [existingSubmission, setExistingSubmission] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);

    useEffect(() => {
        const fetchTest = async () => {
            const token = localStorage.getItem("token");
            try {
                // Check if already submitted
                const { data: subData } = await axios.get(
                    `${server}/api/testseries/${id}/mysubmission`,
                    { headers: { token } }
                );
                if (subData.submission) {
                    setExistingSubmission(subData.submission);
                    setLoading(false);
                    return;
                }

                const { data } = await axios.get(
                    `${server}/api/testseries/${id}`,
                    { headers: { token } }
                );
                setTest(data.test);
            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Failed to load test"
                );
                navigate("/testseries");
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [id]);

    const selectAnswer = (qIndex, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        const unanswered = answers.filter((a) => a === -1).length;
        if (unanswered > 0) {
            if (
                !window.confirm(
                    `You have ${unanswered} unanswered question(s). Submit anyway?`
                )
            )
                return;
        }

        setSubmitting(true);
        const token = localStorage.getItem("token");
        try {
            const { data } = await axios.post(
                `${server}/api/testseries/${id}/submit`,
                { answers },
                { headers: { token } }
            );
            setResult(data);
            toast.success("Test submitted successfully!");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Submission failed"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading />;

    // Already submitted — show existing result
    if (existingSubmission) {
        return (
            <div className="test-result-page">
                <div className="result-header">
                    <h1>📊 Your Previous Result</h1>
                    <p>You have already taken this test. Here are your results:</p>
                </div>
                <div className="result-summary">
                    <div className="result-score-card">
                        <div className="score-circle">
                            <span className="score-number">
                                {existingSubmission.score}
                            </span>
                            <span className="score-total">/10</span>
                        </div>
                        <div className="result-details">
                            <div className="result-detail-item">
                                <span className="label">Percentage</span>
                                <span className="value">
                                    {existingSubmission.percentage}%
                                </span>
                            </div>
                            <div className="result-detail-item">
                                <span className="label">Rank</span>
                                <span className="value">
                                    #{existingSubmission.rank} of{" "}
                                    {existingSubmission.totalStudents}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="feedback-section">
                    <h2>Question-wise Feedback</h2>
                    {existingSubmission.feedback.map((f, i) => (
                        <div
                            key={i}
                            className={`feedback-card ${
                                f.isCorrect ? "correct" : "wrong"
                            }`}
                        >
                            <div className="feedback-header">
                                <span className="q-num">Q{i + 1}</span>
                                <span
                                    className={`feedback-badge ${
                                        f.isCorrect ? "correct" : "wrong"
                                    }`}
                                >
                                    {f.isCorrect
                                        ? "✅ You got correct!"
                                        : "❌ Sorry, You got wrong!"}
                                </span>
                            </div>
                            <p className="q-text">{f.questionText}</p>
                            <div className="feedback-options">
                                {f.options.map((opt, j) => (
                                    <div
                                        key={j}
                                        className={`feedback-option 
                                            ${j === f.correctOption ? "correct-option" : ""} 
                                            ${j === f.selectedOption && !f.isCorrect ? "wrong-option" : ""}
                                        `}
                                    >
                                        <span className="opt-label">
                                            {String.fromCharCode(65 + j)}.
                                        </span>
                                        {opt}
                                        {j === f.correctOption && (
                                            <span className="opt-tag">
                                                ✓ Correct
                                            </span>
                                        )}
                                        {j === f.selectedOption &&
                                            j !== f.correctOption && (
                                                <span className="opt-tag wrong-tag">
                                                    ✗ Your Answer
                                                </span>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="result-actions">
                    <button
                        className="common-btn"
                        onClick={() =>
                            navigate(`/testseries/${id}/leaderboard`)
                        }
                    >
                        View Leaderboard
                    </button>
                    <button
                        className="common-btn outline-btn"
                        onClick={() => navigate("/testseries")}
                    >
                        Back to Tests
                    </button>
                </div>
            </div>
        );
    }

    // Show result after submission
    if (result) {
        return (
            <div className="test-result-page">
                <div className="result-header">
                    <h1>🎉 Test Completed!</h1>
                    <p>Here's how you performed:</p>
                </div>
                <div className="result-summary">
                    <div className="result-score-card">
                        <div className="score-circle">
                            <span className="score-number">
                                {result.score}
                            </span>
                            <span className="score-total">/10</span>
                        </div>
                        <div className="result-details">
                            <div className="result-detail-item">
                                <span className="label">Percentage</span>
                                <span className="value">
                                    {result.percentage}%
                                </span>
                            </div>
                            <div className="result-detail-item">
                                <span className="label">Rank</span>
                                <span className="value">
                                    #{result.rank} of {result.totalStudents}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="feedback-section">
                    <h2>Question-wise Feedback</h2>
                    {result.feedback.map((f, i) => (
                        <div
                            key={i}
                            className={`feedback-card ${
                                f.isCorrect ? "correct" : "wrong"
                            }`}
                        >
                            <div className="feedback-header">
                                <span className="q-num">Q{i + 1}</span>
                                <span
                                    className={`feedback-badge ${
                                        f.isCorrect ? "correct" : "wrong"
                                    }`}
                                >
                                    {f.isCorrect
                                        ? "✅ You got correct!"
                                        : "❌ Sorry, You got wrong!"}
                                </span>
                            </div>
                            <p className="q-text">{f.questionText}</p>
                            <div className="feedback-options">
                                {f.options.map((opt, j) => (
                                    <div
                                        key={j}
                                        className={`feedback-option 
                                            ${j === f.correctOption ? "correct-option" : ""} 
                                            ${j === f.selectedOption && !f.isCorrect ? "wrong-option" : ""}
                                        `}
                                    >
                                        <span className="opt-label">
                                            {String.fromCharCode(65 + j)}.
                                        </span>
                                        {opt}
                                        {j === f.correctOption && (
                                            <span className="opt-tag">
                                                ✓ Correct
                                            </span>
                                        )}
                                        {j === f.selectedOption &&
                                            j !== f.correctOption && (
                                                <span className="opt-tag wrong-tag">
                                                    ✗ Your Answer
                                                </span>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="result-actions">
                    <button
                        className="common-btn"
                        onClick={() =>
                            navigate(`/testseries/${id}/leaderboard`)
                        }
                    >
                        View Leaderboard
                    </button>
                    <button
                        className="common-btn outline-btn"
                        onClick={() => navigate("/testseries")}
                    >
                        Back to Tests
                    </button>
                </div>
            </div>
        );
    }

    // Test-taking UI
    if (!test || !test.questions) return <p>Test not found</p>;

    const question = test.questions[currentQ];

    return (
        <div className="test-take-page">
            <div className="test-take-header">
                <h2>{test.title}</h2>
                <div className="test-progress">
                    <span>
                        Question {currentQ + 1} of {test.questions.length}
                    </span>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${
                                    ((currentQ + 1) / test.questions.length) *
                                    100
                                }%`,
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="question-card">
                <div className="question-number">
                    Q{currentQ + 1}
                </div>
                <h3 className="question-text">{question.questionText}</h3>

                <div className="options-grid">
                    {question.options.map((opt, j) => (
                        <div
                            key={j}
                            className={`option-card ${
                                answers[currentQ] === j ? "selected" : ""
                            }`}
                            onClick={() => selectAnswer(currentQ, j)}
                        >
                            <span className="option-letter">
                                {String.fromCharCode(65 + j)}
                            </span>
                            <span className="option-text">{opt}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="question-nav">
                <button
                    className="common-btn outline-btn"
                    onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                    disabled={currentQ === 0}
                >
                    ← Previous
                </button>

                <div className="question-dots">
                    {test.questions.map((_, i) => (
                        <span
                            key={i}
                            className={`dot ${
                                i === currentQ ? "current" : ""
                            } ${answers[i] !== -1 ? "answered" : ""}`}
                            onClick={() => setCurrentQ(i)}
                        ></span>
                    ))}
                </div>

                {currentQ < test.questions.length - 1 ? (
                    <button
                        className="common-btn"
                        onClick={() =>
                            setCurrentQ((p) =>
                                Math.min(test.questions.length - 1, p + 1)
                            )
                        }
                    >
                        Next →
                    </button>
                ) : (
                    <button
                        className="common-btn submit-btn"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : "Submit Test ✓"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TestSeriesTake;
