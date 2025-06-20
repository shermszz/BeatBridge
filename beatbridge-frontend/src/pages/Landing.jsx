import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';
import mainHeroImg from '../styles/images/landingMainIcon.jpg';
import withoutDrumKitImage from '../styles/images/WithoutDrumKitImage.png';
import songRecommendationImage from '../styles/images/SongRecommendationImage.jpg';
import rhythmTrainerImage from '../styles/images/RhythmTrainerImage.jpg';
import jamSessionImage from '../styles/images/JamSessionImage.jpg';

const FAQS = [
  {
    q: 'How long does it take to learn drums?',
    a: 'Learning drums depends on your goals and practice frequency. With BeatBridge, you can start playing simple rhythms in days and progress to advanced skills at your own pace.'
  },
  {
    q: 'Do I need a drumkit to use BeatBridge?',
    a: 'No! BeatBridge is designed so you can learn and practice rhythms without a physical drumkit. Use your hands, a table, or any surface to get started.'
  },
  {
    q: 'Can I get song recommendations for practice?',
    a: 'Yes! BeatBridge offers personalized song recommendations to match your skill level and help you practice more effectively.'
  },
  {
    q: 'Is BeatBridge suitable for complete beginners?',
    a: 'Absolutely. BeatBridge is made by drummers for drummers of all levels, including complete beginners.'
  },
  {
    q: 'What devices can I use BeatBridge on?',
    a: 'You can use BeatBridge on any device with a web browser—desktop, tablet, or mobile.'
  },
];

// Landing page displayed to all visitors
const Landing = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const navigate = useNavigate();
  const handleGetStarted = () => navigate('/register');
  return (
    <div>
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-overlay">
          <h1><strong>Your Path to Drumming Starts Here</strong></h1>
          <p className="landing-hero-desc">
            Master the drums on your terms - no kit required. 
            Whether you're dreaming of playing in a band or just want to groove to your favorite songs, 
            our innovative rhythm trainers and personalized song recommendations will take you from a complete beginner to a confident drummer.
          </p>
          <button className="get-started-btn" onClick={handleGetStarted}>Start Your Drumming Journey</button>
        </div>
      </section>

      {/* Benefits of BeatBridge features*/}
      <section className="home-section home-feature">
        <div className="home-img">
          <img src={withoutDrumKitImage} alt="Learn drums without a drumkit" className="feature-image" />
        </div>
        <div className="home-content">
          <h2>Learn the drums without needing a drumkit</h2>
          <p>Drumkits are expensive and take up space. With BeatBridge, you don't need a kit—lowering the barrier to entry for everyone. Start learning rhythms and grooves anywhere, anytime.</p>
        </div>
      </section>

      {/* Song Recommendation Feature */}
      <section className="home-section home-feature home-zigzag">
        <div className="home-content">
          <h2>Song Recommendation</h2>
          <p>Get personalized song recommendations to match your skill level and musical taste. Practice with real music and accelerate your drumming journey.</p>
        </div>
        <div className="home-img">
          <img src={songRecommendationImage} alt="Song recommendation feature" className="feature-image" />
        </div>
      </section>

      {/* Rhythm Trainer Feature */}
      <section className="home-section home-feature">
        <div className="home-img">
          <img src={rhythmTrainerImage} alt="Rhythm trainer feature" className="feature-image" />
        </div>
        <div className="home-content">
          <h2>Rhythm Trainer</h2>
          <p>Sharpen your timing and coordination with interactive rhythm trainers. Practice patterns, fills, and grooves with instant feedback.</p>
        </div>
      </section>

      {/* Jam Session Feature */}
      <section className="home-section home-feature home-zigzag">
        <div className="home-content">
          <h2>Jam Session</h2>
          <p>Join virtual jam sessions, play along with backing tracks, and connect with other drummers. Experience the joy of making music together—no matter where you are.</p>
        </div>
        <div className="home-img">
          <img src={jamSessionImage} alt="Jam session feature" className="feature-image" />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2 className="faq-title">Frequently Asked Questions About Playing the Drums</h2>
        <div className="faq-list">
          {FAQS.map((item, idx) => (
            <div
              key={idx}
              className={`faq-item${openFAQ === idx ? ' open' : ''}`}
              onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
            >
              <div className="faq-question">{item.q}</div>
              <div className={`faq-answer${openFAQ === idx ? ' open' : ''}`}>{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="home-section home-cta">
        <div className="home-content home-content-center">
          <h2>Ready to learn the drums?</h2>
          <button className="get-started-btn" onClick={handleGetStarted}>Let's get started</button>
        </div>
      </section>
    </div>
  );
};

export default Landing;