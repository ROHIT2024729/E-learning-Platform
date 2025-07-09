import React from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Home from './pages/Home/home';
import Header from './components/Header/Header';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Verify from './pages/auth/Verify';
import Footer from './components/Footer/Footer';
import About from './pages/about/About';
import Account from './pages/account/Account';
import { UserData } from './context/UserContext';
import Loading from './components/loading/loading';
import Courses from './pages/Courses/courses';
import CourseDescription from './pages/courseDescription/courseDescription';
import PaymentSuccess from './pages/paymentSuccesfully/paymentsuccess';
import Dashboard from './pages/dashboard/dashboard';
import CourseStudy from './pages/courseStudy/CourseStudy';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminLectures from './pages/admin/AdminLectures';
import AdminTestSeries from './pages/admin/AdminTestSeries';
import DoubtBot from './components/doubtBot/DoubtBot';
import TestSeriesList from './pages/testseries/TestSeriesList';
import TestSeriesTake from './pages/testseries/TestSeriesTake';
import TestSeriesLeaderboard from './pages/testseries/TestSeriesLeaderboard';
import ForgotPassword from './pages/auth/ForgotPassword';
import GlobalLeaderboard from './pages/leaderboard/GlobalLeaderboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import Battle from "./pages/battle/Battle";

const App = ()=>{
  const {isAuth, user, loading} = UserData();
  return (<>
  {loading?<Loading/>:<BrowserRouter>
  <Header isAuth = {isAuth}/>
  <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/courses" element={<Courses/>}/>
    <Route path="/battle" element={<Battle/>}/>
    <Route path="/account" element={isAuth ? <Account user = {user}/> :<Login/>}/>
    <Route path="/login" element={isAuth ? <Home/> : <Login/>}/>
    <Route path="/register" element={isAuth ? <Home/> : <Register/>}/>
    <Route path="/verify" element={isAuth ? <Home/> : <Verify/>}/>
    <Route path="/forgot-password" element={isAuth ? <Home/> : <ForgotPassword/>}/>
    <Route path="/course/:id" element={isAuth?<CourseDescription user={user}/>:<Login/>} />
    <Route path="/payment-success/:id" element={isAuth?<PaymentSuccess user = {user}/> : <Login/>} />
    <Route path="/account/:id/dashboard" element={isAuth ? <Dashboard user={user} /> : <Login />}/>
    <Route path="/course/study/:id" element={isAuth ? <CourseStudy user={user} /> : <Login />} />
    <Route path="/admin/dashboard" element={isAuth ? <AdminDashboard user={user} /> : <Login />} />
    <Route path="/admin/course" element={isAuth ? <AdminCourses user={user} /> : <Login />} />
    <Route path="/admin/course/:id" element={isAuth ? <AdminLectures user={user} /> : <Login />} />
    <Route path="/admin/testseries" element={isAuth ? <AdminTestSeries user={user} /> : <Login />} />
    <Route path="/testseries" element={<TestSeriesList />} />
    <Route path="/testseries/:id" element={isAuth ? <TestSeriesTake /> : <Login />} />
    <Route path="/testseries/:id/leaderboard" element={isAuth ? <TestSeriesLeaderboard /> : <Login />} />
    <Route path="/leaderboard" element={isAuth ? <GlobalLeaderboard /> : <Login />} />
    <Route path="/admin/analytics" element={isAuth ? <AdminAnalytics user={user} /> : <Login />} />
  </Routes>
  {isAuth && <DoubtBot />}
  <Footer/>
  </BrowserRouter>}
  </>
  );
};

export default App;
