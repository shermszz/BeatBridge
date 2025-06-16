import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../styles/images/Beatbridge.png';

//Component to handle navigation to registration page for new users
const handleGettingStarted = () => {
    navigate('/register');
}

//Component to handle navigation to login page for existing users
const handleLogin = () => {
    navigate('/login');
}

// Landing page displayed to all visitors
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <h1>Welcome to BeatBridge</h1>
      <img src={logo} width="300" height="300" alt="BeatBridge logo" />
      <p>Discover, share, and connect through music. The bridge between artists and listeners.</p>

      {/* Buttons to navigate to login or registration */}
      <div className="center-btn">
        <button className="get-started-btn" onClick={handleLogin}>
          Login
        </button>
      </div>
      <div className="center-btn">
        <button className="get-started-btn" onClick={handleGettingStarted}>
          Let's Get Started
        </button>
      </div>
    </div>
  );
};

export default Landing;