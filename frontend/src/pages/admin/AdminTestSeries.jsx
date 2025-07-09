import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import toast from "react-hot-toast";
import "./admin.css";

const AdminTestSeries = ({ user }) => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("free");
    const [price, setPrice] = useState("");
    const [questions, setQuestions] = useState(
        Array(10)
            .fill(null)
            .map(() => ({
                questionText: "",
                options: ["", "", "", ""],
                correctOption: 0,
            }))
    );
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/");
            return;
        }
        fetchTests();
    }, [user, navigate]);

    const fetchTests = async () => {
        try {
            const { data } = await axios.get(`${server}/api/testseries`);
            setTests(data.tests);
        } catch (err) {
            console.error(err);
        }
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        if (field === "questionText") {
            updated[index].questionText = value;
        } else if (field === "correctOption") {
            updated[index].correctOption = parseInt(value);
        } else if (field.startsWith("option_")) {
            const optIndex = parseInt(field.split("_")[1]);
            updated[index].options[optIndex] = value;
        }
        setQuestions(updated);
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setType("free");
        setPrice("");
        setQuestions(
            Array(10)
                .fill(null)
                .map(() => ({
                    questionText: "",
                    options: ["", "", "", ""],
                    correctOption: 0,
                }))
        );
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        setLoading(true);

        // Validate all questions
        for (let i = 0; i < 10; i++) {
            const q = questions[i];
            if (!q.questionText.trim()) {
                toast.error(`Question ${i + 1} text is empty`);
                setLoading(false);
                return;
            }
            for (let j = 0; j < 4; j++) {
                if (!q.options[j].trim()) {
                    toast.error(
                        `Question ${i + 1}, Option ${
                            String.fromCharCode(65 + j)
                        } is empty`
                    );
                    setLoading(false);
                    return;
                }
            }
        }

        const body = {
            title,
            description,
            type,
            price: type === "paid" ? Number(price) : 0,
            questions,
        };

        try {
            if (editingId) {
                await axios.put(
                    `${server}/api/admin/testseries/${editingId}`,
                    body,
                    { headers: { token } }
                );
                toast.success("Test Series Updated!");
            } else {
                await axios.post(`${server}/api/admin/testseries`, body, {
                    headers: { token },
                });
                toast.success("Test Series Created!");
            }
            resetForm();
            fetchTests();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to save test"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (testId) => {
        const token = localStorage.getItem("token");
        try {
            const { data } = await axios.get(
                `${server}/api/testseries/${testId}`,
                { headers: { token } }
            );
            const t = data.test;
            setTitle(t.title);
            setDescription(t.description);
            setType(t.type);
            setPrice(t.price || "");
            setQuestions(t.questions);
            setEditingId(testId);
            // Scroll to form
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            toast.error("Failed to load test for editing");
        }
    };

    const handleDelete = async (testId) => {
        if (!window.confirm("Delete this test series? All submissions will also be removed."))
            return;
        const token = localStorage.getItem("token");
        try {
            await axios.delete(
                `${server}/api/admin/testseries/${testId}`,
                { headers: { token } }
            );
            toast.success("Test Series Deleted!");
            fetchTests();
        } catch (err) {
            toast.error("Failed to delete test");
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h3>Admin Panel</h3>
                <ul>
                    <li onClick={() => navigate("/admin/dashboard")}>
                        Dashboard
                    </li>
                    <li onClick={() => navigate("/admin/course")}>Courses</li>
                    <li
                        className="active"
                        onClick={() => navigate("/admin/testseries")}
                    >
                        Test Series
                    </li>
                    <li onClick={() => navigate("/admin/analytics")}>Analytics</li>
                </ul>
            </div>
            <div className="admin-content">
                <h2>
                    {editingId
                        ? "Edit Test Series"
                        : "Create New Test Series"}
                </h2>

                <form onSubmit={handleSubmit} className="test-form">
                    <div className="test-form-header">
                        <input
                            type="text"
                            placeholder="Test Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Test Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        <div className="test-form-row">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                            </select>
                            {type === "paid" && (
                                <input
                                    type="number"
                                    placeholder="Price (₹)"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            )}
                        </div>
                    </div>

                    <h3 className="questions-heading">
                        Questions (10 MCQs required)
                    </h3>

                    <div className="questions-list">
                        {questions.map((q, i) => (
                            <div key={i} className="admin-question-card">
                                <div className="admin-q-header">
                                    <span className="admin-q-num">
                                        Q{i + 1}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Question ${i + 1}`}
                                    value={q.questionText}
                                    onChange={(e) =>
                                        updateQuestion(
                                            i,
                                            "questionText",
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                <div className="admin-options">
                                    {q.options.map((opt, j) => (
                                        <div
                                            key={j}
                                            className="admin-option-row"
                                        >
                                            <input
                                                type="radio"
                                                name={`correct_${i}`}
                                                checked={
                                                    q.correctOption === j
                                                }
                                                onChange={() =>
                                                    updateQuestion(
                                                        i,
                                                        "correctOption",
                                                        j
                                                    )
                                                }
                                            />
                                            <span className="admin-opt-label">
                                                {String.fromCharCode(65 + j)}.
                                            </span>
                                            <input
                                                type="text"
                                                placeholder={`Option ${String.fromCharCode(
                                                    65 + j
                                                )}`}
                                                value={opt}
                                                onChange={(e) =>
                                                    updateQuestion(
                                                        i,
                                                        `option_${j}`,
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="test-form-actions">
                        <button
                            type="submit"
                            disabled={loading}
                            className="common-btn"
                        >
                            {loading
                                ? "Please Wait..."
                                : editingId
                                ? "Update Test Series"
                                : "Create Test Series"}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="common-btn outline-btn"
                                onClick={resetForm}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <hr style={{ margin: "40px 0", borderColor: "var(--border-color)" }} />

                <h2>All Test Series</h2>
                <div className="courses-list-items">
                    {tests.length > 0 ? (
                        tests.map((t) => (
                            <div key={t._id} className="admin-course-card">
                                <div className="admin-course-info" style={{ flex: 1 }}>
                                    <h4>
                                        {t.title}
                                        <span
                                            className={`test-type-badge ${t.type}`}
                                            style={{ marginLeft: 10 }}
                                        >
                                            {t.type === "free"
                                                ? "Free"
                                                : `Paid ₹${t.price}`}
                                        </span>
                                    </h4>
                                    <p>{t.description}</p>
                                </div>
                                <div className="admin-course-actions">
                                    <button
                                        onClick={() => handleEdit(t._id)}
                                        className="edit-btn"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t._id)}
                                        className="delete-btn"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No test series created yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTestSeries;
