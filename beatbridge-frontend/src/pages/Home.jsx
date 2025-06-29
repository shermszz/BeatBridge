import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import config from '../config';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Example data -> Suppose to show user their progress?
  const practiceStats = {
    score: '78%',
    change: '+15%',
    status: 'Good Progress'
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('JWT token in Home.jsx:', token); // Debug log
        const response = await fetch(`${config.API_BASE_URL}/api/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // If not logged in, redirect to landing
          navigate('/landing');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/landing');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // For Continue where you left off Button
  const handleContinue = () => {
    navigate('/rhythm-trainer');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Hello, {user?.username}!</h1>
            <p className="subtitle">Track your progress and keep improving.</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Main Stats Card (temp) */}
        <div className="dashboard-card main-stats">
          <div className="card-header">
            <h2>Overall Progress</h2>
            <button className="continue-session-btn" onClick={handleContinue}>
              <span className="btn-icon">▶</span>
              Continue where you left off
            </button>
          </div>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{practiceStats.score}</span>
              <span className="score-change">{practiceStats.change}</span>
            </div>
            <div className="score-status">
              <span className="status-label">{practiceStats.status}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '78%' }}></div>
                <div className="progress-markers">
                  <span>F</span>
                  <span>D</span>
                  <span>C</span>
                  <span>B</span>
                  <span>A</span>
                  <span>A+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Song Recommendation Section */}
        <div className="dashboard-card">
          <div className="card-header">
          <h2>Song Recommendation</h2>
          <button className="continue-session-btn" onClick={() => navigate('/song-recommendation')}>
            <span className="btn-icon">▶</span>
            Get Song Recommendation
          </button>
          </div>
          <div className="activity-item">
              <span className="activity-icon">🎶</span>
              <div className="activity-details">
                <p>Discover new music tailored to your favorite genres!</p>
              </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">🎵</span>
              <div className="activity-details">
                <p>Completed Rhythm Training</p>
                <small>2 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🎸</span>
              <div className="activity-details">
                <p>New Song Recommendation</p>
                <small>Yesterday</small>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🎼</span>
              <div className="activity-details">
                <p>Joined Jam Session</p>
                <small>2 days ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;