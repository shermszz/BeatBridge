import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Chapter1/Chapter1pg5.css';

export default function Chapter1pg5() {
  const navigate = useNavigate();
  return (
    <div className="chapter1-container">
      <h1 className="chapter1-title">Chapter 1 Quiz: Stick Control</h1>
      <div className="chapter1-description">
        <i>Content coming soon...</i>
      </div>
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <button className="chapter1-back-link" onClick={() => navigate('/chapter1pg4')}>← Back</button>
        <button className="chapter1-back-link" onClick={() => navigate('/chapter1pg6')}>Next →</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0rem', display: 'flex', justifyContent: 'center' }}>
        <button className="chapter1-back-link" onClick={() => navigate('/chapter1-dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
} 