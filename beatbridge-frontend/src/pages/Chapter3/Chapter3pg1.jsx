import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Chapter3/Chapter3pg1.css';

export default function Chapter3pg1() {
  const navigate = useNavigate();

  return (
    <div className="chapter3-container">
      <h1 className="chapter3-title">Chapter 3: Coming Soon!</h1>
      <div className="chapter3-content">
        <div className="coming-soon-card">
          <div className="coming-soon-icon">🚀</div>
          <h2 className="coming-soon-title">Chapter 3 is Under Development</h2>
          <p className="coming-soon-description">
            We're working hard to bring you the next exciting chapter of your drumming journey. 
            Stay tuned for more advanced techniques and exercises!
          </p>
          <div className="chapter3-coming-soon-features">
            <div className="chapter3-feature-item">
              <span className="chapter3-feature-icon">🎵</span>
              <span className="chapter3-feature-text">Advanced Rhythm Patterns</span>
            </div>
            <div className="chapter3-feature-item">
              <span className="chapter3-feature-icon">🥁</span>
              <span className="chapter3-feature-text">Complex Drum Fills</span>
            </div>
            <div className="chapter3-feature-item">
              <span className="chapter3-feature-icon">⚡</span>
              <span className="chapter3-feature-text">Speed Building Exercises</span>
            </div>
          </div>
        </div>
      </div>
      <div className="chapter3-bottom-nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', marginTop: '2.5rem' }}>
        <button className="chapter3-back-link" onClick={() => navigate('/chapter1pg6')}>
          ← Back
        </button>
        <button className="chapter3-back-link" onClick={() => navigate('/rhythm-trainer-chapters')}>
          Back to Chapters
        </button>
      </div>
    </div>
  );
} 