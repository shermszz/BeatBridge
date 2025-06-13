import React from 'react';
import logo from '../styles/images/Beatbridge.png';

const Home = () => {
  return (
    <div className="hero">
      <h1>Welcome to BeatBridge</h1>
      <img src={logo} width="300" height="300" alt="BeatBridge logo" />
      <p>Discover, share, and connect through music. The bridge between artists and listeners.</p>
    </div>
  );
};

export default Home;