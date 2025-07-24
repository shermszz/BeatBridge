import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Chapter0/Chapter0Dashboard.css';
import config from '../../config';

export default function Chapter0Dashboard() {
  const [progress, setProgress] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageProgress, setPageProgress] = useState(1);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/chapter-progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProgress(data.chapter_progress || 1);
          setPageProgress(data.chapter0_page_progress || 1);
        }
      } catch (err) {}
      setLoading(false);
    };
    fetchProgress();
  }, []);

  const links = [
    { to: '/chapter-0', label: '1. Drum Kit Guided Tour' },
    { to: '/chapter0pg2', label: '2. Introduction to Notes' },
    { to: '/chapter0pg3', label: '3. Introduction to Rests' },
    { to: '/chapter0pg4', label: '4. Practice: Notes & Rests' },
    { to: '/chapter0pg5', label: '5. Quiz: Notes & Rests' },
  ];

  return (
    <div className="chapter0-dashboard-container">
      <h1 className="chapter0-dashboard-title">Chapter 0: Dashboard</h1>
      <div className="chapter0-dashboard-card">
        <h2 className="chapter0-dashboard-subtitle">Quick Navigation</h2>
        <div className="chapter0-dashboard-links">
          {loading ? (
            <div style={{color:'#ffb3b3', textAlign:'center'}}>Loading...</div>
          ) : (
            links.map((link, idx) => (
              <Link
                key={link.to}
                to={pageProgress >= idx + 1 ? link.to : '#'}
                className={`chapter0-dashboard-link${pageProgress < idx + 1 ? ' locked' : ''}`}
                tabIndex={pageProgress >= idx + 1 ? 0 : -1}
                aria-disabled={pageProgress < idx + 1}
                onClick={e => {
                  if (pageProgress < idx + 1) e.preventDefault();
                }}
              >
                {link.label}
                {pageProgress < idx + 1 && <span className="lock-icon" style={{marginLeft: 8, fontSize:'1.1em'}}>🔒</span>}
              </Link>
            ))
          )}
        </div>
      </div>
      <div className="chapter0-dashboard-footer">
        <Link to="/rhythm-trainer-chapters" className="chapter0-dashboard-back">← Back to Chapters</Link>
      </div>
    </div>
  );
} 