import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./home.css";
import Testimonials from '../../components/testimonials/testimonials';

const Home = () => {
    const navigate = useNavigate();
    
    return (
        <div className="home-wrapper">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Master Your Skills with <span className="highlight">EduPlatform</span></h1>
                    <p className="hero-subtitle">
                        Get access to world-class courses from top instructors. Learn at your own pace and accelerate your career.
                    </p>
                    <div className="hero-buttons">
                        <button onClick={() => navigate('/courses')} className="common-btn hero-btn">Explore Courses</button>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">10k+</span>
                            <span className="stat-label">Students</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">50+</span>
                            <span className="stat-label">Courses</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">4.8</span>
                            <span className="stat-label">Rating</span>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="features-section">
                <div className="container">
                    <h2>Why Choose Us?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📚</div>
                            <h3>Comprehensive Content</h3>
                            <p>Detailed modules covering everything from basics to advanced topics.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👨‍🏫</div>
                            <h3>Expert Instructors</h3>
                            <p>Learn from industry professionals with years of real-world experience.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⏱️</div>
                            <h3>Lifetime Access</h3>
                            <p>Learn at your own pace. Watch the videos anytime, anywhere.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Testimonials />
        </div>
    );
};

export default Home;