import React, { useState } from 'react';
import { MdDashboard, MdEdit, MdSave, MdCancel, MdLockOutline } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import { RiAdminLine } from "react-icons/ri";
import "./Account.css";
import { UserData } from '../../context/UserContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Account = ({user})=>{
    const navigate = useNavigate();
    const {setIsAuth, setUser, updateProfile, changePassword, btnLoading} = UserData();
    
    // Edit Profile State
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || "");
    
    // Change Password State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });

    const logoutHandler = ()=>{
        localStorage.clear();
        setUser([]);
        setIsAuth(false);
        toast.success("Logged Out!");
        navigate("/login");
    }

    const handleNameSave = async () => {
        if (!newName.trim()) return toast.error("Name cannot be empty");
        const success = await updateProfile(newName);
        if (success) setIsEditingName(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!passwords.oldPassword || !passwords.newPassword) return toast.error("Please fill all fields");
        if (passwords.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
        
        const success = await changePassword(passwords.oldPassword, passwords.newPassword);
        if (success) {
            setIsChangingPassword(false);
            setPasswords({ oldPassword: "", newPassword: "" });
        }
    };
    
    return(
        <div className="account-container">
            {user && (
                <div className='profile'>
                    <h2>My Profile</h2>
                    <div className="profile-avatar">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className='profile-info'>
                        <div className="info-group">
                            <label>Name</label>
                            {isEditingName ? (
                                <div className="edit-inline">
                                    <input 
                                        type="text" 
                                        value={newName} 
                                        onChange={(e) => setNewName(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="icon-action-btn save" onClick={handleNameSave} disabled={btnLoading} title="Save">
                                        <MdSave />
                                    </button>
                                    <button className="icon-action-btn cancel" onClick={() => {setIsEditingName(false); setNewName(user.name);}} title="Cancel">
                                        <MdCancel />
                                    </button>
                                </div>
                            ) : (
                                <p className="editable-field">
                                    {user.name}
                                    <button className="icon-action-btn edit" onClick={() => setIsEditingName(true)} title="Edit Name">
                                        <MdEdit />
                                    </button>
                                </p>
                            )}
                        </div>
                        <div className="info-group">
                            <label>Email</label>
                            <p>{user.email}</p>
                        </div>
                        
                        <div className="account-actions">
                            <button onClick={()=>navigate(`/account/${user._id}/dashboard`)} className='common-btn account-btn'>
                                <MdDashboard /> Dashboard
                            </button>
                            
                            {user.role === 'admin' && (
                                <button onClick={()=>navigate(`/admin/dashboard`)} className='common-btn account-btn admin-btn'>
                                    <RiAdminLine /> Admin Panel
                                </button>
                            )}
                            
                            <button onClick={()=>setIsChangingPassword(!isChangingPassword)} className='common-btn outline-btn account-btn'>
                                <MdLockOutline /> {isChangingPassword ? "Cancel Password Change" : "Change Password"}
                            </button>
                            
                            <button onClick={logoutHandler} className='common-btn outline-btn account-btn logout-btn'>
                                <IoMdLogOut /> Logout
                            </button>
                        </div>

                        {/* Change Password Form */}
                        {isChangingPassword && (
                            <form className="change-password-form" onSubmit={handlePasswordChange}>
                                <h3>Change Password</h3>
                                <div className="info-group">
                                    <label>Current Password</label>
                                    <input 
                                        type="password" 
                                        value={passwords.oldPassword}
                                        onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="info-group">
                                    <label>New Password</label>
                                    <input 
                                        type="password" 
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <button type="submit" className="common-btn full-width" disabled={btnLoading}>
                                    {btnLoading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Account;