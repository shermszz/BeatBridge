import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Chapter1/Chapter1Dashboard.css';
import config from '../../config';

export default function Chapter1Dashboard() {
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
    { to: '/chapter1pg1', label: '1. Introduction to Stick Control 1 (Quarter Notes)' },
    { to: '/chapter1pg2', label: '2. Stick Control 1: Quarter Notes Patterns' },
    { to: '/chapter1pg3', label: '3. Stick Control 2: Integrating Rest Notes' },
    { to: '/chapter1pg4', label: '4. Stick Control 3: Eighth Notes Patterns' },
    { to: '/chapter1pg5', label: '5. Quiz: Stick Control' },
  ];

  return (
    <div className="chapter1-dashboard-container">
      <h1 className="chapter1-dashboard-title">Chapter 1: Dashboard</h1>
      <div className="chapter1-dashboard-card">
        <h2 className="chapter1-dashboard-subtitle">Quick Navigation</h2>
        <div className="chapter1-dashboard-links">
          {loading ? (
            <div style={{color:'#ffb3b3', textAlign:'center'}}>Loading...</div>
          ) : (
            links.map((link, idx) => (
              <Link
                key={link.to}
                to={pageProgress >= idx + 1 ? link.to : '#'}
                className={`chapter1-dashboard-link${pageProgress < idx + 1 ? ' locked' : ''}`}
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
      <div className="chapter1-dashboard-footer">
        <Link to="/rhythm-trainer-chapters" className="chapter1-dashboard-back"> Back to Chapters</Link>
      </div>
    </div>
  );
} 