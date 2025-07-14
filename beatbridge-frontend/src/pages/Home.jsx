import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import config from '../config';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
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
        const response = await fetch(`${config.API_BASE_URL}/api/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
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

  useEffect(() => {
    const fetchFavorites = async () => {
      setFavoritesLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        setFavorites([]);
      } finally {
        setFavoritesLoading(false);
      }
    };
    fetchFavorites();
  }, []);

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
              <span>Resume Training</span>
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

        {/* Song Recommendation Section with Favorites */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Song Recommendation</h2>
            <button className="continue-session-btn" onClick={() => navigate('/song-recommendation')}>
              <span className="btn-icon">🎵</span>
              <span>Discover Music</span>
            </button>
          </div>
          <div className="favorites-dashboard-section">
            <h3 className="favorites-section-title">Your Favorite Songs</h3>
            {favoritesLoading ? (
              <div className="favorites-loading">Loading...</div>
            ) : favorites.length === 0 ? (
              <div className="favorites-empty">No favorite songs yet.</div>
            ) : (
              <div className="favorites-list-scroll">
                {favorites.map(fav => (
                  <div
                    key={fav.id}
                    className="favorite-song-item"
                    onClick={() => navigate('/song-recommendation', { state: { showFavorites: true } })}
                    onMouseOver={e => e.currentTarget.classList.add('hovered')}
                    onMouseOut={e => e.currentTarget.classList.remove('hovered')}
                  >
                    <span className="favorite-song-icon">🎵</span>
                    <div className="favorite-song-info">
                      <span className="favorite-song-title">{fav.song_name}</span>
                      <span className="favorite-song-artist">by <span className="favorite-song-artist-name">{fav.artist_name}</span></span>
                    </div>
                    {fav.tags && fav.tags.length > 0 && (
                      <span className="favorite-genre-badge">
                        {typeof fav.tags[0] === 'object' ? fav.tags[0].name : fav.tags[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Jam Session Card (replaces Recent Activity) */}
        <div className="dashboard-card">
          <h2>Jam Session</h2>
          <div style={{ color: '#ffb3b3', fontWeight: 600, fontSize: '1.5rem', marginTop: '7rem', fontStyle: 'italic', textAlign: 'center'}}>
            🎸 Coming soon!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;