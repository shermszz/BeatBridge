import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../styles/images/Beatbridge.png';


const Home = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('user_id');

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="hero home-page">
      <h1>Welcome to BeatBridge</h1>
      <img src={logo} width="300" height="300" alt="BeatBridge logo" />
      {!isLoggedIn && (
        <div className="center-btn">
          <button className="get-started-btn" onClick={handleGetStarted}>
            Let's Get Started
          </button>
        </div>
      )}
      <p>Discover, share, and connect through music. The bridge between artists and listeners.</p>
    </div>
  );
};

export default Home;