import React, { useState } from 'react';
import "./auth.css";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../main';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [btnLoading, setBtnLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${server}/api/user/forgot-password`, { email });
            toast.success(data.message);
            setResetToken(data.resetToken);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setBtnLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${server}/api/user/reset-password`, {
                otp: Number(otp),
                resetToken,
                newPassword,
            });
            toast.success(data.message);
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setBtnLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form">
                {step === 1 ? (
                    <>
                        <h2>Forgot Password</h2>
                        <p className="auth-subtitle">Enter your email to receive a reset OTP</p>
                        <form onSubmit={handleSendOtp}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your registered email"
                                required
                            />
                            <button disabled={btnLoading} type="submit" className="common-btn">
                                {btnLoading ? "Sending OTP..." : "Send OTP"}
                            </button>
                        </form>
                        <p>
                            Remember your password? <Link to="/login">Login</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <h2>Reset Password</h2>
                        <p className="auth-subtitle">Enter the OTP sent to <strong>{email}</strong></p>
                        <form onSubmit={handleResetPassword}>
                            <label htmlFor="otp">OTP</label>
                            <input
                                type="number"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                required
                            />
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                            <button disabled={btnLoading} type="submit" className="common-btn">
                                {btnLoading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                        <p>
                            <span className="resend-link" onClick={() => { setStep(1); setOtp(""); setNewPassword(""); }}>
                                Resend OTP
                            </span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
