import React, { useEffect, useRef, useState } from "react";
import "./About.css";
import { useNavigate } from "react-router-dom";
import {
    FaBookOpen,
    FaChalkboardTeacher,
    FaUsers,
    FaBullseye,
    FaVideo,
    FaClipboardCheck,
    FaComments,
    FaChartLine,
    FaCheckCircle,
    FaLightbulb,
    FaGraduationCap,
    FaHeart,
    FaRocket,
    FaStar,
} from "react-icons/fa";

const Counter = ({ end, label, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    let current = 0;
                    const step = Math.ceil(end / 60);
                    const interval = setInterval(() => {
                        current += step;
                        if (current >= end) {
                            current = end;
                            clearInterval(interval);
                        }
                        setCount(current);
                    }, 25);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end]);

    return (
        <div className="stat-item" ref={ref}>
            <h3>
                {count}
                {suffix}
            </h3>
            <p>{label}</p>
        </div>
    );
};

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="about-page">
            {/* ===== HERO SECTION ===== */}
            <section className="about-hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                    <div className="shape shape-5"></div>
                </div>
                <div className="about-hero-content">
                    <div className="hero-text">
                        <span className="hero-badge">
                            <FaGraduationCap /> About EduPlatform
                        </span>
                        <h1>
                            Learn. <span className="gradient-text">Grow.</span>{" "}
                            Succeed.
                        </h1>
                        <p>
                            We're on a mission to make quality education
                            accessible to everyone. Our platform combines
                            structured learning, expert guidance, and
                            interactive tools to help you master new skills and
                            achieve your dreams.
                        </p>
                        <div className="hero-actions">
                            <button
                                className="common-btn hero-btn"
                                onClick={() => navigate("/courses")}
                            >
                                <FaRocket /> Explore Courses
                            </button>
                            <button
                                className="common-btn outline-btn hero-btn"
                                onClick={() => navigate("/testseries")}
                            >
                                Try Test Series
                            </button>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-image-wrapper">
                            <img
                                src="/about-hero.png"
                                alt="Student holding a book"
                                className="hero-3d-image"
                            />
                            <div className="floating-card fc-1">
                                <FaStar className="fc-icon gold" />
                                <span>4.9 Rating</span>
                            </div>
                            <div className="floating-card fc-2">
                                <FaUsers className="fc-icon blue" />
                                <span>10K+ Students</span>
                            </div>
                            <div className="floating-card fc-3">
                                <FaCheckCircle className="fc-icon green" />
                                <span>95% Success</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== WHO WE ARE ===== */}
            <section className="about-section who-we-are">
                <div className="section-container">
                    <div className="section-badge">Who We Are</div>
                    <h2>
                        A Platform Built{" "}
                        <span className="gradient-text">For Students</span>
                    </h2>
                    <p className="section-desc">
                        EduPlatform is an online learning ecosystem designed to
                        help students from all backgrounds learn at their own
                        pace. We believe that education is the most powerful tool
                        for change, and we're committed to delivering
                        high-quality, structured content that transforms learners
                        into professionals.
                    </p>
                    <div className="who-cards">
                        <div className="who-card">
                            <div className="who-card-icon purple">
                                <FaLightbulb />
                            </div>
                            <h4>Student-First Approach</h4>
                            <p>
                                Every feature we build starts with one question:
                                "Will this help our students learn better?"
                            </p>
                        </div>
                        <div className="who-card">
                            <div className="who-card-icon blue">
                                <FaChalkboardTeacher />
                            </div>
                            <h4>Industry Experts</h4>
                            <p>
                                Our instructors bring years of real-world
                                experience, not just theory.
                            </p>
                        </div>
                        <div className="who-card">
                            <div className="who-card-icon green">
                                <FaHeart />
                            </div>
                            <h4>Built with Care</h4>
                            <p>
                                We constantly improve based on student feedback
                                to ensure the best experience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== WHAT WE OFFER ===== */}
            <section className="about-section what-we-offer alt-bg">
                <div className="section-container">
                    <div className="section-badge">What We Offer</div>
                    <h2>
                        Everything You Need to{" "}
                        <span className="gradient-text">Excel</span>
                    </h2>
                    <div className="offer-grid">
                        <div className="offer-card">
                            <div className="offer-icon-wrap">
                                <FaBookOpen />
                            </div>
                            <h4>Quality Content</h4>
                            <p>
                                Structured, well-organized lessons designed for
                                deep understanding.
                            </p>
                        </div>
                        <div className="offer-card">
                            <div className="offer-icon-wrap">
                                <FaVideo />
                            </div>
                            <h4>Video Lectures</h4>
                            <p>
                                HD video lessons you can watch anytime, anywhere,
                                at your own pace.
                            </p>
                        </div>
                        <div className="offer-card">
                            <div className="offer-icon-wrap">
                                <FaClipboardCheck />
                            </div>
                            <h4>MCQ Test Series</h4>
                            <p>
                                Practice tests with instant results, feedback,
                                and leaderboard rankings.
                            </p>
                        </div>
                        <div className="offer-card">
                            <div className="offer-icon-wrap">
                                <FaComments />
                            </div>
                            <h4>Doubt Solving</h4>
                            <p>
                                Get your doubts cleared instantly with our
                                AI-powered study assistant.
                            </p>
                        </div>
                        <div className="offer-card">
                            <div className="offer-icon-wrap">
                                <FaChartLine />
                            </div>
                            <h4>Progress Tracking</h4>
                            <p>
                                Monitor your learning journey with dashboards
                                and performance analytics.
                            </p>
                        </div>
                        <div className="offer-card">
                            <div className="offer-icon-wrap">
                                <FaGraduationCap />
                            </div>
                            <h4>Easy Learning</h4>
                            <p>
                                Beginner-friendly interface that makes learning
                                feel effortless.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== WHY CHOOSE US ===== */}
            <section className="about-section why-choose">
                <div className="section-container">
                    <div className="section-badge">Why Choose Us</div>
                    <h2>
                        What Makes Us{" "}
                        <span className="gradient-text">Different</span>
                    </h2>
                    <div className="why-grid">
                        {[
                            {
                                title: "Easy-to-Understand Lessons",
                                desc: "Complex concepts broken down into simple, digestible modules.",
                            },
                            {
                                title: "Structured Learning Paths",
                                desc: "Follow a clear roadmap from beginner to advanced mastery.",
                            },
                            {
                                title: "Expert Guidance",
                                desc: "Learn from professionals who have walked the path before you.",
                            },
                            {
                                title: "Interactive Study Tools",
                                desc: "MCQ tests, doubt bot, video player — all in one place.",
                            },
                            {
                                title: "Student Community",
                                desc: "Join thousands of motivated learners growing together.",
                            },
                            {
                                title: "Affordable Pricing",
                                desc: "Quality education should never be behind a paywall for everyone.",
                            },
                        ].map((item, i) => (
                            <div className="why-item" key={i}>
                                <FaCheckCircle className="why-check" />
                                <div>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== MISSION & VISION ===== */}
            <section className="about-section mission-vision alt-bg">
                <div className="section-container">
                    <div className="mv-grid">
                        <div className="mv-card mission">
                            <div className="mv-icon-wrap">
                                <FaBullseye />
                            </div>
                            <h3>Our Mission</h3>
                            <p>
                                To democratize education by providing
                                high-quality, structured learning experiences
                                that are accessible, affordable, and effective
                                for every student, regardless of their
                                background.
                            </p>
                        </div>
                        <div className="mv-card vision">
                            <div className="mv-icon-wrap">
                                <FaRocket />
                            </div>
                            <h3>Our Vision</h3>
                            <p>
                                To become the most trusted online learning
                                platform where students gain practical skills,
                                real-world knowledge, and the confidence to
                                thrive in a competitive world.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== STATS ===== */}
            <section className="about-section stats-section">
                <div className="section-container">
                    <div className="stats-grid">
                        <Counter end={10000} label="Students Enrolled" suffix="+" />
                        <Counter end={50} label="Courses Available" suffix="+" />
                        <Counter end={5000} label="Doubts Solved" suffix="+" />
                        <Counter end={2000} label="Tests Completed" suffix="+" />
                    </div>
                </div>
            </section>

            {/* ===== TEAM DEDICATION ===== */}
            <section className="about-section dedication alt-bg">
                <div className="section-container dedication-content">
                    <div className="dedication-icon">
                        <FaHeart />
                    </div>
                    <h2>
                        Built with <span className="gradient-text">Love</span>{" "}
                        for Students
                    </h2>
                    <p>
                        Behind EduPlatform is a passionate team of educators,
                        developers, and designers who believe in the
                        transformative power of education. Every course, every
                        feature, and every pixel is crafted with one goal — to
                        help you succeed in your learning journey.
                    </p>
                    <p className="dedication-quote">
                        "Education is not preparation for life; education is
                        life itself."
                    </p>
                    <button
                        className="common-btn hero-btn"
                        onClick={() => navigate("/courses")}
                    >
                        Start Your Journey Today →
                    </button>
                </div>
            </section>
        </div>
    );
};

export default About;