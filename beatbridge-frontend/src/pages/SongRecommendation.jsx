import React, { useState, useEffect } from 'react';
import '../styles/SongRecommendation.css';

function SongRecommendation() {
  // State for genres, selected genre, recommendation, loading, and errors
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genreLoading, setGenreLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the static genre list from the backend on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch genres from backend
  const fetchGenres = async () => {
    setGenreLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/genres');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch genres');
      }
      setGenres(data.genres);
    } catch (err) {
      setError('Error fetching genres. Please try again later.');
      console.error('Error fetching genres:', err);
    }
    setGenreLoading(false);
  };

  // Handle selecting a single genre
  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
  };

  // Fetch a song recommendation for the selected genre
  const handleGetRecommendation = async () => {
    if (!selectedGenre) {
      setError('Please select a genre');
      return;
    }
    setLoading(true);
    setError('');
    setRecommendation(null);
    try {
      const response = await fetch('http://localhost:5000/api/recommend-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genres: [selectedGenre] }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendation');
      }
      setRecommendation(data);
    } catch (err) {
      setError(err.message || 'Error getting recommendation. Please try again.');
      console.error('Error getting recommendation:', err);
    }
    setLoading(false);
  };

  // Format duration from ms to 'Xmin Ys'
  const formatDuration = (ms) => {
    const sec = Math.floor(parseInt(ms, 10) / 1000);
    if (isNaN(sec) || sec <= 0) return 'Unknown';
    const mins = Math.floor(sec / 60);
    const remSecs = sec % 60;
    return `${mins}min ${remSecs}s`;
  };

  return (
    <div className="song-recommendation-container">
      <div className="song-recommendation-content">
        {/* Title and subtitle */}
        <h1 className="song-recommendation-title">🎵 Song Recommendation</h1>
        <p className="song-recommendation-subtitle">
          Select your favorite genres and discover amazing new music!
        </p>

        {/* Genre selection UI */}
        {genreLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading genres...</p>
          </div>
        ) : error && !recommendation ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={fetchGenres} className="retry-button">
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="genre-selection-section">
              <h2>Select Your Favorite Genres</h2>
              <p>Choose one or more genres to get personalized recommendations:</p>
              {/* Genre buttons grid */}
              <div className="genres-grid">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    className={`genre-button ${selectedGenre === genre.id ? 'selected' : ''}`}
                    onClick={() => handleGenreSelect(genre.id)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
              {/* Show selected genre and action button */}
              {selectedGenre && (
                <div className="selected-genres">
                  <p>Selected: {genres.find(g => g.id === selectedGenre)?.name}</p>
                  <button
                    onClick={handleGetRecommendation}
                    disabled={loading}
                    className="get-recommendation-button"
                  >
                    {loading ? (
                      <>
                        <div className="button-spinner"></div>
                        Getting Recommendation...
                      </>
                    ) : (
                      'Get Song Recommendation'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Error message if recommendation fails */}
            {error && recommendation && (
              <div className="error-message">{error}</div>
            )}

            {/* Recommendation card */}
            {recommendation && (
              <div className="recommendation-section">
                <div className="recommendation-header">
                  <h2>Your Recommendation 🎶</h2>
                  <p className="recommendation-message">{recommendation.message}</p>
                </div>

                <div className="song-card">
                  <div className="song-info">
                    <h3 className="song-title">{recommendation.recommendation.name}</h3>
                    <p className="song-artist">by {recommendation.recommendation.artist}</p>
                    
                    {recommendation.recommendation.album && (
                      <p className="song-album">
                        <strong>Album:</strong> {recommendation.recommendation.album}
                      </p>
                    )}
                    
                    {recommendation.recommendation.duration && (
                      <p className="song-duration">
                        <strong>Duration:</strong> {formatDuration(recommendation.recommendation.duration)}
                      </p>
                    )}
                    
                    {recommendation.recommendation.listeners > 0 && (
                      <p className="song-listeners">
                        <strong>Listeners:</strong> {recommendation.recommendation.listeners.toLocaleString()}
                      </p>
                    )}

                    {recommendation.recommendation.tags && recommendation.recommendation.tags.length > 0 && (
                      <div className="song-tags">
                        <strong>Tags:</strong>
                        <div className="tags-container">
                          {recommendation.recommendation.tags.slice(0, 5).map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="song-actions">
                    <a
                      href={recommendation.recommendation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lastfm-link"
                    >
                      🎵 Listen on Last.fm
                    </a>
                    
                    <button
                      onClick={handleGetRecommendation}
                      disabled={loading}
                      className="new-recommendation-button"
                    >
                      Get Another Recommendation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SongRecommendation; 