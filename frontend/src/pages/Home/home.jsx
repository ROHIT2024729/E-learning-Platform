import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./home.css";
const Home = ()=>{
    const navigate = useNavigate();
    return (
    <div>
        <div className='home'>
            <div className='home-content'>
                <h1>Welcome to our E-learning Platform</h1>
                <p>Learn, Grow, Excel</p>
                <button onClick={()=>navigate('/courses')} className='common-btn'>Get Started</button>

            </div >
        </div>
    </div>)
};

export default Home;