import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Chapter0/Chapter0pg5.css';

export default function Chapter0pg6() {
  const navigate = useNavigate();

  return (
    <div className="chapter0-container">
      <div className="chapter0-quiz-card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <h1 className="chapter0-title" style={{ marginBottom: '2rem', color: '#ffe066' }}>Congratulations! 🎉</h1>
        <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>You've completed <b style={{ color: '#ffb3b3' }}>Chapter 0</b>!</h2>
        <div style={{ fontSize: '1.15rem', marginBottom: '2rem' }}>
          You're now ready to move on to <b>Chapter 1</b> and continue your rhythm journey.<br/>
          Explore more advanced concepts and exercises in the next chapter!
        </div>
        <button
          className="chapter0-back-link"
          style={{ fontSize: '1.1rem', padding: '0.9rem 2.2rem', marginTop: '0.5rem' }}
          onClick={() => navigate('/rhythm-trainer-chapters')}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
} 