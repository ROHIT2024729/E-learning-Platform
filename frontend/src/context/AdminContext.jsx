import { createContext, useContext, useState } from "react";
import axios from 'axios';
import { server } from "../main";
import toast from 'react-hot-toast';

const AdminContext = createContext();

export const AdminContextProvider = ({children}) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    async function fetchStats() {
        try {
            const {data} = await axios.get(`${server}/api/stats`, {
                headers: {
                    token: localStorage.getItem("token")
                }
            });
            setStats(data.stats);
        } catch (error) {
            console.log(error);
        }
    }

    async function createCourse(formData) {
        setLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/course/new`, formData, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            toast.success(data.message);
            setLoading(false);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create course");
            setLoading(false);
            return false;
        }
    }

    async function deleteCourse(id) {
        setLoading(true);
        try {
            const {data} = await axios.delete(`${server}/api/course/${id}`, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            toast.success(data.message);
            setLoading(false);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete course");
            setLoading(false);
            return false;
        }
    }

    async function addLecture(courseId, formData) {
        setLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/course/${courseId}`, formData, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            toast.success(data.message);
            setLoading(false);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add lecture");
            setLoading(false);
            return false;
        }
    }

    async function deleteLecture(id) {
        setLoading(true);
        try {
            const {data} = await axios.delete(`${server}/api/lecture/${id}`, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            toast.success(data.message);
            setLoading(false);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete lecture");
            setLoading(false);
            return false;
        }
    }

    return (
        <AdminContext.Provider value={{
            stats, fetchStats, createCourse, deleteCourse, addLecture, deleteLecture, loading
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const AdminData = () => useContext(AdminContext);
