/**
 * Chapter1pg6 - Chapter 1 Completion Celebration
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Chapter1/Chapter1pg5.css';

export default function Chapter1pg6() {
  const navigate = useNavigate();

  return (
    <div className="chapter1-container">
      <div className="chapter1-quiz-card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <h1 className="chapter1-title" style={{ marginBottom: '2rem', color: '#ffe066' }}>Congratulations! </h1>
        <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>You've completed <b style={{ color: '#ffb3b3' }}>Chapter 1</b>!</h2>
        <div style={{ fontSize: '1.15rem', marginBottom: '2rem' }}>
          You're now ready to move on to more advanced stick control and rhythm exercises.<br/>
          Keep practicing and building your drumming skills!
        </div>
        <button
          className="chapter1-back-link"
          style={{ fontSize: '1.1rem', padding: '0.9rem 2.2rem', marginTop: '0.5rem' }}
          onClick={() => navigate('/rhythm-trainer-chapters')}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
} 