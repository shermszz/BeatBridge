import React from 'react';
import logo from '../styles/images/Beatbridge.png';

//Can add more images into this page later on 


// Landing page displayed to all visitors
const Landing = () => {
  return (
    <div className="hero">
      <h1>Welcome to BeatBridge</h1>
      <img src={logo} width="300" height="300" alt="BeatBridge logo" />
      <p style={{ marginTop: '-5px' }}>Discover, share, and connect through music. The bridge between artists and listeners.</p>

    </div>
  );
};

export default Landing;