import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { server } from "../main";
import toast, { Toaster } from 'react-hot-toast';

const UserContext = createContext();

export const UserContextProvider = ({children}) => {
    const [user, setUser] = useState([]);
    const [isAuth, setIsAuth] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    async function loginUser(email, password, navigate) {
        setBtnLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/user/login`, {email, password});
            toast.success(data.message);
            localStorage.setItem("token", data.token);
            setUser(data.user);
            setIsAuth(true);
            setBtnLoading(false);
            navigate('/');
        } catch (err) {
            setBtnLoading(false);
            setIsAuth(false);
            toast.error(err.response.data.message);
        }
    };

    async function verifyOtp(otp, navigate) {
        setBtnLoading(true);
        const activationToken = localStorage.getItem("activationToken");
        try{
            const {data} = await axios.post(`${server}/api/user/verify`, {otp, activationToken});
            toast.success(data.message);
            navigate("/login");
            localStorage.clear();
            setBtnLoading(false);

        }
        catch(error){
            toast.error(error.response.data.message);
            setBtnLoading(false);
        }
    }

    async function registerUser(name, email, password, navigate) {
        setBtnLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/user/register`, {name,email, password});
            toast.success(data.message);
            localStorage.setItem("activationToken", data.activationToken);
            setBtnLoading(false);
            navigate('/verify');
        } catch (err) {
            setBtnLoading(false);
            toast.error(err.response.data.message);
        }
    }

    async function fetechUser(){
        try{
            const {data} = await axios.get(`${server}/api/user/me`,{
                headers:{
                    token: localStorage.getItem("token"),
                }
            });
            setIsAuth(true);
            setUser(data.user);
            setLoading(false);
        }
        catch(err){
            console.log(err);
            setLoading(false);
        }
    }

    async function updateProfile(name) {
        setBtnLoading(true);
        try {
            const {data} = await axios.put(`${server}/api/user/profile`, {name}, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            toast.success(data.message);
            setUser(data.user);
            setBtnLoading(false);
            return true;
        } catch (err) {
            setBtnLoading(false);
            toast.error(err.response?.data?.message || "Failed to update profile");
            return false;
        }
    }

    async function changePassword(oldPassword, newPassword) {
        setBtnLoading(true);
        try {
            const {data} = await axios.put(`${server}/api/user/password`, {oldPassword, newPassword}, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            toast.success(data.message);
            setBtnLoading(false);
            return true;
        } catch (err) {
            setBtnLoading(false);
            toast.error(err.response?.data?.message || "Failed to change password");
            return false;
        }
    }

    useEffect(()=>{
        fetechUser()
    },[]);

    return (
        <UserContext.Provider value={{user, setUser, setIsAuth, isAuth, loginUser, btnLoading, loading, registerUser,verifyOtp,fetechUser, updateProfile, changePassword}}>
            {children}
            <Toaster/>
        </UserContext.Provider>
    );
}

export const UserData = () => useContext(UserContext);