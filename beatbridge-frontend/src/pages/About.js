import React from 'react';

const About = () => {
  return (
    <div className="content">
      <div className="about-intro">
        <h1>About BeatBridge</h1>
        <p>BeatBridge is your bridge between rhythm and reality – helping beginner drummers master the beat without the need for expensive equipment or formal training.</p>
      </div>

      <div className="mission-vision">
        <div className="mission">
          <h2>Our Mission</h2>
          <p>To democratize rhythm education by providing accessible, interactive drum training tools for everyone, anywhere.</p>
        </div>
        <div className="vision">
          <h2>Our Vision</h2>
          <p>A world where rhythm is instinctive, engaging, and a shared language across all communities.</p>
        </div>
      </div>

      <div className="team">
        <h2>Meet the Team</h2>
        <div className="team-members">
          <div className="member-card">
            <h3>Huang Jian Wei</h3>
            <p>UI/UX Lead & Frontend Developer</p>
          </div>
          <div className="member-card">
            <h3>Tan Shao Hng, Sherman</h3>
            <p>Backend Developer & DevOps</p>
          </div>
        </div>
      </div>

      <div className="contact-cta">
        <h2>Got Feedback or Ideas?</h2>
        <p>We'd love to hear from you! Reach out and help us improve BeatBridge.</p>
        <a href="#" className="cta-button">Contact Us</a>
      </div>
    </div>
  );
};

export default About;