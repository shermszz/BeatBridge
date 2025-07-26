import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import config from '../config';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [chapterProgress, setChapterProgress] = useState({
    chapter_progress: 1,
    chapter0_page_progress: 1,
    chapter1_page_progress: 1
  });
  const [progressLoading, setProgressLoading] = useState(true);
  const [animateProgress, setAnimateProgress] = useState(false);
  const navigate = useNavigate();

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
    const fetchChapterProgress = async () => {
      setProgressLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/chapter-progress`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('API Response Data:', data);
          setChapterProgress(data);
        }
      } catch (error) {
        console.error('Error fetching chapter progress:', error);
              } finally {
          setProgressLoading(false);
          // Trigger animation after data loads
          setTimeout(() => setAnimateProgress(true), 200);
        }
    };
    fetchChapterProgress();
  }, []);

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

  /**
   * Handles the "Resume Training" button click
   * Intelligently navigates users to the page they left off at based on their progress
   * 
   * Logic:
   * 1. If user has started Chapter 1 (progress > 1), take them to their current Chapter 1 page
   * 2. If user has started Chapter 0 (progress > 1), take them to their current Chapter 0 page
   * 3. If user hasn't started any chapters, take them to the Rhythm Trainer overview
   */
  const handleContinue = () => {
    // Extract progress data from state
    const { chapter0_page_progress, chapter1_page_progress } = chapterProgress;
    
    // Priority: Chapter 1 (more advanced) takes precedence over Chapter 0
    if (chapter1_page_progress > 1) {
      // User has started Chapter 1, navigate to their current page
      navigate(`/chapter1pg${chapter1_page_progress}`);
    } else if (chapter0_page_progress > 1) {
      // User has started Chapter 0, navigate to their current page
      navigate(`/chapter0pg${chapter0_page_progress}`);
    } else {
      // User hasn't started any chapters, go to rhythm trainer overview
      navigate('/rhythm-trainer');
    }
  };

  const handleMainStatsClick = () => {
    // Reset animation and trigger it again
    setAnimateProgress(false);
    setTimeout(() => setAnimateProgress(true), 100);
  };

  // Calculate overall progress based on chapter and page completion
  const calculateOverallProgress = () => {
    if (progressLoading) return { percentage: 0, status: 'Loading...' };
    
    // Each chapter has 5 pages (excluding celebration pages)
    const pagesPerChapter = 5;
    const totalChapters = 6; // Chapter 0, 1, 2, 3, 4, 5
    const totalPages = totalChapters * pagesPerChapter; // 30 total pages
    
    // Calculate completed pages for each chapter
    // Since each chapter has 6 pages total (including celebration), but we only want to count 5
    // We subtract 2 from the total to account for the 2 celebration pages (1 from each chapter)
    const totalRawPages = chapterProgress.chapter0_page_progress + chapterProgress.chapter1_page_progress;
    const totalCompletedPages = Math.max(0, totalRawPages - 2); // Subtract 2 celebration pages
    
    console.log('Chapter 0 Raw Pages:', chapterProgress.chapter0_page_progress);
    console.log('Chapter 1 Raw Pages:', chapterProgress.chapter1_page_progress);
    console.log('Total Raw Pages:', totalRawPages);
    console.log('Total Completed Pages (after subtracting celebration):', totalCompletedPages);
    
    console.log('Total Completed Pages:', totalCompletedPages);
    console.log('Total Pages:', totalPages);
    
    // Calculate percentage based on total pages completed
    const percentage = Math.round((totalCompletedPages / totalPages) * 100);
    
    console.log('Calculated Percentage:', percentage);
    
    // Calculate completed chapters (for display purposes)
    const completedChapters = Math.floor(totalCompletedPages / pagesPerChapter);
    
    let status = 'Getting Started';
    if (percentage >= 80) status = 'Outstanding Progress!';
    else if (percentage >= 60) status = 'Great Progress!';
    else if (percentage >= 40) status = 'Excellent Progress!';
    else if (percentage >= 20) status = 'Good Progress!';
    else status = 'Getting Started';
    
    return { 
      percentage, 
      status, 
      completedPages: completedChapters, 
      totalPages: totalChapters,
      totalCompletedPages,
      totalPossiblePages: totalPages
    };
  };

  const progressData = calculateOverallProgress();
  
  // Debug logging
  console.log('Chapter Progress State:', chapterProgress);
  console.log('Progress Data:', progressData);
  console.log('Animate Progress:', animateProgress);

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
        <div className="dashboard-card main-stats" onClick={handleMainStatsClick} style={{ cursor: 'pointer' }}>
          <div className="card-header">
            <h2>Overall Progress</h2>
            <button className="continue-session-btn" onClick={handleContinue}>
              <span className="btn-icon">▶</span>
              <span>Resume Training</span>
            </button>
          </div>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{progressData.percentage}%</span>
              <span className="score-change">{progressData.completedPages}/{progressData.totalPages} Ch</span>
            </div>
            <div className="score-status">
              <span className="status-label">{progressData.status}</span>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${animateProgress ? 'animate-progress' : ''}`} 
                  style={{ 
                    width: animateProgress ? 'var(--target-width)' : `${progressData.percentage}%`,
                    '--target-width': `${progressData.percentage}%`
                  }}
                ></div>
                <div className="progress-markers">
                  <span>Ch 0</span>
                  <span>Ch 1</span>
                  <span>Ch 2</span>
                  <span>Ch 3</span>
                  <span>Ch 4</span>
                  <span>Ch 5</span>
                  <span>Finish</span>
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
              <div className="favorites-empty">No favorite songs added yet!</div>
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

        {/* Jam Session Card */}
        <div className="dashboard-card">
          <h2>Jam Session</h2>
          <div style={{ color: '#ffb3b3', fontWeight: 600, fontSize: '1.5rem', marginTop: '3rem', fontStyle: 'italic', textAlign: 'center'}}>
            🎸 Coming soon!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;