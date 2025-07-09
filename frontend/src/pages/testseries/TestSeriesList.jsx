import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/loading";
import "./testseries.css";
import toast from "react-hot-toast";

const TestSeriesList = () => {
    const navigate = useNavigate();
    const { user, isAuth } = UserData();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQ, setSearchQ] = useState("");
    const [priceFilter, setPriceFilter] = useState("all");
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const { data } = await axios.get(`${server}/api/testseries`);
                setTests(data.tests);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    const handleTestClick = (test) => {
        if (!isAuth) {
            navigate("/login");
            return;
        }
        if (test.type === "paid") {
            const hasAccess = user?.testSubscription?.some(
                (sub) => sub.toString() === test._id
            );
            if (!hasAccess) {
                handleCheckout(test._id);
                return;
            }
        }
        navigate(`/testseries/${test._id}`);
    };

    const handleCheckout = async (testId) => {
        const token = localStorage.getItem("token");
        try {
            const {
                data: { order, test },
            } = await axios.post(
                `${server}/api/testseries/checkout/${testId}`,
                {},
                { headers: { token } }
            );

            const options = {
                key: "rzp_test_RUrTd5r5lro1jJ",
                amount: order.amount,
                currency: "INR",
                name: "EduPlatform",
                description: `Purchase: ${test.title}`,
                order_id: order.id,
                handler: async function (response) {
                    const {
                        razorpay_order_id,
                        razorpay_payment_id,
                        razorpay_signature,
                    } = response || {};
                    try {
                        const { data } = await axios.post(
                            `${server}/api/testseries/verification/${testId}`,
                            {
                                razorpay_order_id,
                                razorpay_payment_id,
                                razorpay_signature,
                            },
                            { headers: { token } }
                        );
                        toast.success(data.message);
                        window.location.reload();
                    } catch (err) {
                        toast.error(
                            err.response?.data?.message || "Payment verification failed"
                        );
                    }
                },
                theme: { color: "#08bd80" },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to initiate checkout"
            );
        }
    };

    // Filter Logic
    const filteredTests = tests.filter((test) => {
        if (searchQ.trim()) {
            const q = searchQ.toLowerCase();
            const match = test.title.toLowerCase().includes(q) ||
                (test.description && test.description.toLowerCase().includes(q)) ||
                (test.createdBy && test.createdBy.toLowerCase().includes(q));
            if (!match) return false;
        }
        if (priceFilter === 'free' && test.type !== 'free') return false;
        if (priceFilter === 'paid' && test.type !== 'paid') return false;
        return true;
    });

    const clearFilters = () => {
        setSearchQ('');
        setPriceFilter('all');
    };

    const hasFilters = searchQ || priceFilter !== 'all';

    return (
        <div className="testseries-page">
            <div className="testseries-hero">
                <h1>📝 Test Series</h1>
                <p>Practice with our curated MCQ tests and see where you stand among all students.</p>
            </div>

            <div className="testseries-container">
                {/* Search + Filter Bar */}
                <div className="courses-toolbar">
                    <div className="courses-search">
                        <span className="cs-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search tests by title..."
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                        />
                    </div>
                    <button
                        className={`filter-toggle ${filtersOpen ? 'active' : ''}`}
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        ⚙️ Filters
                    </button>
                </div>

                {/* Filter Panel */}
                {filtersOpen && (
                    <div className="filter-panel" style={{marginBottom: "20px"}}>
                        <div className="filter-group">
                            <label>Price Type</label>
                            <div className="filter-chips">
                                {['all', 'free', 'paid'].map(v => (
                                    <button
                                        key={v}
                                        className={`filter-chip ${priceFilter === v ? 'active' : ''}`}
                                        onClick={() => setPriceFilter(v)}
                                    >
                                        {v === 'all' ? 'All' : v === 'free' ? 'Free' : 'Paid'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {hasFilters && (
                            <button className="clear-filters" onClick={clearFilters}>
                                ✖ Clear All Filters
                            </button>
                        )}
                    </div>
                )}

                {hasFilters && (
                    <p className="results-info" style={{marginBottom: "20px", color: "var(--text-secondary)"}}>
                        Showing {filteredTests.length} of {tests.length} test series
                    </p>
                )}

                <div className="testseries-grid">
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <div className="skeleton-card" key={i} style={{padding: "25px", height: "auto"}}>
                                <div className="skeleton skeleton-text short" style={{marginBottom: "20px"}}></div>
                                <div className="skeleton skeleton-text long" style={{marginBottom: "10px"}}></div>
                                <div className="skeleton skeleton-text medium" style={{marginBottom: "20px"}}></div>
                                <div className="skeleton skeleton-btn" style={{margin: "0"}}></div>
                            </div>
                        ))
                    ) : filteredTests.length > 0 ? (
                        filteredTests.map((test) => {
                            const hasAccess =
                                test.type === "free" ||
                                user?.role === "admin" ||
                                user?.testSubscription?.some(
                                    (sub) => sub.toString() === test._id
                                );

                            return (
                                <div
                                    key={test._id}
                                    className={`test-card ${test.type}`}
                                    onClick={() => handleTestClick(test)}
                                >
                                    <div className="test-card-header">
                                        <span
                                            className={`test-badge ${test.type}`}
                                        >
                                            {test.type === "free"
                                                ? "🆓 Free"
                                                : "💎 Paid"}
                                        </span>
                                        {test.type === "paid" && (
                                            <span className="test-price">
                                                ₹{test.price}
                                            </span>
                                        )}
                                    </div>
                                    <h3>{test.title}</h3>
                                    <p className="test-desc">{test.description}</p>
                                    <div className="test-meta">
                                        <span>📋 10 Questions</span>
                                        <span>👤 {test.createdBy}</span>
                                    </div>
                                    <button
                                        className={`common-btn full-width ${
                                            hasAccess ? "" : "locked-btn"
                                        }`}
                                    >
                                        {hasAccess
                                            ? "Start Test →"
                                            : "🔒 Purchase to Unlock"}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-state" style={{gridColumn: "1 / -1", textAlign: "center", padding: "40px"}}>
                            <h3>No test series found</h3>
                            <p>Try adjusting your search or filters.</p>
                            {hasFilters && (
                                <button className="common-btn outline-btn" onClick={clearFilters} style={{marginTop: "15px"}}>Clear Filters</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestSeriesList;
