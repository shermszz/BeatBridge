import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Chapter2/Chapter2pg1.css';

/**
 * Chapter2pg1 - Coming Soon Page Component
 * 
 * This component displays a placeholder page for Chapter 2, which is currently under development.
 * It provides users with information about upcoming content and maintains the app's design consistency.
 */
export default function Chapter2pg1() {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  return (
    <div className="chapter2-container">
      {/* Main page title with consistent chapter styling */}
      <h1 className="chapter2-title">Chapter 2: Coming Soon!</h1>
      
      {/* Main content area containing the coming soon card */}
      <div className="chapter2-content">
        <div className="coming-soon-card">
          {/* Animated rocket icon */}
          <div className="coming-soon-icon">🚀</div>
          <h2 className="coming-soon-title">Chapter 2 is Under Development</h2>
          <p className="coming-soon-description">
            We're working hard to bring you the next exciting chapter of your drumming journey. 
            Stay tuned for more advanced techniques and exercises!
          </p>
          
          {/* Grid of upcoming features to preview Chapter 2 content */}
          <div className="chapter2-coming-soon-features">
            {/* Feature 1: Advanced Rhythm Patterns */}
            <div className="chapter2-feature-item">
              <span className="chapter2-feature-icon">🎵</span>
              <span className="chapter2-feature-text">Advanced Rhythm Patterns</span>
            </div>
            
            {/* Feature 2: Complex Drum Fills */}
            <div className="chapter2-feature-item">
              <span className="chapter2-feature-icon">🥁</span>
              <span className="chapter2-feature-text">Complex Drum Fills</span>
            </div>
            
            {/* Feature 3: Speed Building Exercises */}
            <div className="chapter2-feature-item">
              <span className="chapter2-feature-icon">⚡</span>
              <span className="chapter2-feature-text">Speed Building Exercises</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation buttons at the bottom */}
      <div className="chapter2-bottom-nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', marginTop: '2.5rem' }}>
    
        
        {/* Button to return to main chapters overview */}
        <button className="chapter2-back-link" onClick={() => navigate('/rhythm-trainer-chapters')}>
          Back to Chapters
        </button>
      </div>
    </div>
  );
} 