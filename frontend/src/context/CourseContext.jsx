import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { server } from "../main";
const CourseContext = createContext();

export const CourseContextProvider = ({children}) => {
    const [courses, setCourses] = useState([]);
    const [course, setCourse] = useState([]);
    const [mycourse, setMyCourse] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [lecture, setLecture] = useState([]);
    async function fetechCourses () {
        try {
            const {data} = await axios.get(`${server}/api/course/all`)

            setCourses(data.courses);
        }
        catch(err){
            console.log(err);
        }
    }

    async function fetechCourse (id) {
        try{
            const {data} = await axios.get(`${server}/api/course/${id}`);
            setCourse(data.course);
        }
        catch(error){
            console.log(error);
        }
    }

    async function fetechMyCourse() {
        try{
            const {data} = await axios.get(`${server}/api/mycourse`,{
                headers:{
                    token : localStorage.getItem("token"),
                },
            });
            setMyCourse(data.courses);
        }
        catch(error){
            console.log(error);
        }
    }

    async function fetchLectures(id) {
        try {
            const {data} = await axios.get(`${server}/api/lectures/${id}`, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            setLectures(data.lectures);
        } catch (error) {
            console.log(error);
        }
    }

    async function fetchLecture(id) {
        try {
            const {data} = await axios.get(`${server}/api/lecture/${id}`, {
                headers: {
                    token: localStorage.getItem("token"),
                }
            });
            setLecture(data.lecture);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
    fetechCourses();
    fetechMyCourse();
    },[]);
    return <CourseContext.Provider value = {{courses, fetechCourses, fetechCourse,course, mycourse, fetechMyCourse, lectures, lecture, setLecture, fetchLectures, fetchLecture}}>{children}</CourseContext.Provider>
};


export const CourseData =() => useContext(CourseContext);