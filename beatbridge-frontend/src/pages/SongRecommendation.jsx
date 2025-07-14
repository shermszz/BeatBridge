import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/SongRecommendation.css';
import config from '../config';

function SongRecommendation() {
  // Get navigation state (e.g., showFavorites) from router
  const location = useLocation();
  // State for genres, selected genre, recommendation, loading, and errors
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genreLoading, setGenreLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  // showFavorites controls whether the favorites section is shown
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Fetch the static genre list and favorites from backend on mount
  useEffect(() => {
    fetchGenres();
    fetchFavorites();
    // If navigated with state.showFavorites, open the favorites section automatically
    if (location.state && location.state.showFavorites) {
      setShowFavorites(true);
    }
  }, []);

  // Fetch genres from backend
  const fetchGenres = async () => {
    setGenreLoading(true);
    setError('');
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/genres`);
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

  // Fetch user's favorites
  const fetchFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const data = await response.json();
      setFavorites(data.favorites);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
    setFavoritesLoading(false);
  };

  // Handle selecting a single genre
  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
  };

  // Add song to favorites
  const handleAddToFavorites = async (song) => {
    try {
      console.log('Adding song to favorites:', song); // Debug log
      const token = localStorage.getItem('token');

      // Process tags to ensure they are strings
      const processedTags = (song.tags || []).map(tag => 
        typeof tag === 'object' ? tag.name : tag
      );

      const response = await fetch(`${config.API_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          song_name: song.name || '',
          artist_name: typeof song.artist === 'object' ? song.artist.name : song.artist || '',
          album_name: song.album || '',
          song_url: song.url || '',
          duration: song.duration || null,
          album_image: song.album_image || null,
          rhythm_complexity: recommendation.rhythm_complexity,
          tempo_rating: recommendation.tempo_rating,
          skill_level: recommendation.skill_level,
          tags: processedTags
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add to favorites');
      }

      // Refresh favorites list
      fetchFavorites();
      alert('Song added to favorites!');
    } catch (err) {
      console.error('Error adding to favorites:', err);
      alert(err.message || 'Failed to add to favorites');
    }
  };

  // Remove song from favorites
  const handleRemoveFromFavorites = async (favoriteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      // Update favorites list
      setFavorites(favorites.filter(f => f.id !== favoriteId));
      alert('Song removed from favorites!');
    } catch (err) {
      console.error('Error removing from favorites:', err);
      alert('Failed to remove from favorites');
    }
  };

  // Format duration from ms to 'Xmin Ys'
  const formatDuration = (ms) => {
    const sec = Math.floor(parseInt(ms, 10) / 1000);
    if (isNaN(sec) || sec <= 0) return 'Unknown';
    const mins = Math.floor(sec / 60);
    const remSecs = sec % 60;
    return `${mins}min ${remSecs}s`;
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

    const maxRetries = 2;
    let retryCount = 0;

    const fetchRecommendation = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please log in to get recommendations');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(`${config.API_BASE_URL}/api/recommend-song`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ genres: [selectedGenre] }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to get recommendation');
        }
        return data;
      } catch (err) {
        if (err.name === 'AbortError') {
          throw new Error('Request took too long. Retrying...');
        }
        throw err;
      }
    };

    while (retryCount < maxRetries) {
      try {
        const data = await fetchRecommendation();
        // Add artificial delay
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
        setRecommendation(data);
        break;
      } catch (err) {
        retryCount++;
        if (retryCount === maxRetries) {
          setError(err.message.replace('Retrying...', 'Please try again.'));
          console.error('Error getting recommendation:', err);
        } else {
          console.log(`Retry ${retryCount}/${maxRetries}:`, err.message);
          // Wait a short time before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="song-recommendation-container">
      <div className="song-recommendation-content">
        {/* Title and subtitle */}
        <h1 className="song-recommendation-title">🎵 Song Recommendation</h1>
        <p className="song-recommendation-subtitle">
          Select your favorite genres and discover amazing new music!
        </p>

        {/* View Favorites Button */}
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className="view-favorites-button"
        >
          {showFavorites ? 'Back to Recommendations' : 'View My Favorites'}
        </button>

        {/* Favorites List */}
        {showFavorites ? (
          <div className="favorites-section">
            <h2>My Favorite Songs</h2>
            {favoritesLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading favorites...</p>
              </div>
            ) : favorites.length === 0 ? (
              <p className="no-favorites">No favorite songs yet. Start adding some!</p>
            ) : (
              <div className="favorites-list">
                {favorites.map((favorite) => (
                                <div key={favorite.id} className="song-card">
                <div className="album-art-container">
                  {favorite.album_image ? (
                    <img 
                      src={favorite.album_image} 
                      alt={`${favorite.album_name || 'Album'} artwork`}
                      className="album-art"
                    />
                  ) : (
                    <div className="album-art-placeholder">
                      <span>🎵</span>
                    </div>
                  )}
                </div>
                <div className="song-info">
                  <h3 className="song-title">{favorite.song_name}</h3>
                  <p className="song-artist">by {favorite.artist_name}</p>
                  {favorite.album_name && (
                    <p className="song-album">Album: {favorite.album_name}</p>
                  )}
                  <p className="song-duration">
                    Duration: {formatDuration(favorite.duration)}
                  </p>

                  {/* Rhythm and Tempo Ratings */}
                  <div className="song-ratings">
                    <div className="rating-item">
                      <span className="rating-label">Rhythm Complexity: </span>
                      <span className="rating-stars">
                        {[...Array(4)].map((_, index) => (
                          <span
                            key={index}
                            className={index < favorite.rhythm_complexity ? "filled-stars" : "empty-stars"}
                          >
                            {index < favorite.rhythm_complexity ? "★" : "☆"}
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className="rating-item">
                      <span className="rating-label">Tempo Challenge: </span>
                      <span className="rating-stars">
                        {[...Array(4)].map((_, index) => (
                          <span
                            key={index}
                            className={index < favorite.tempo_rating ? "filled-stars" : "empty-stars"}
                          >
                            {index < favorite.tempo_rating ? "★" : "☆"}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>

                  {/* Skill Level Context */}
                  {favorite.skill_level && (
                    <div className="skill-context">
                      <div className="skill-header">
                        <h4 className="skill-level">Recommended for {favorite.skill_level} drummers</h4>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {favorite.tags && favorite.tags.length > 0 && (
                    <div className="song-tags">
                      {favorite.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {typeof tag === 'object' ? tag.name : tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="song-actions">
                    <a
                      href={favorite.song_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="listen-button"
                    >
                      Listen on Last.fm
                    </a>
                    <button
                      onClick={() => handleRemoveFromFavorites(favorite.id)}
                      className="remove-favorite-button"
                    >
                      Remove from Favorites
                    </button>
                  </div>
                </div>
              </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Recommendation Display */}
            {!showFavorites && (
              <div className="recommendation-section">
                {/* Genre Selection */}
                <div className="genre-selection">
                  <h2>Select a Genre</h2>
                  {genreLoading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading genres...</p>
                    </div>
                  ) : (
                    <div className="genre-grid">
                      {genres.map((genre) => (
                        <button
                          key={genre.id}
                          onClick={() => handleGenreSelect(genre.id)}
                          className={`genre-button ${selectedGenre === genre.id ? 'selected' : ''}`}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleGetRecommendation}
                    className="get-recommendation-button"
                    disabled={!selectedGenre || loading}
                  >
                    {loading ? 'Getting Recommendation...' : 'Get Recommendation'}
                  </button>
                </div>

                {/* Error Display */}
                {error && <p className="error-message">{error}</p>}

                {/* Recommendation Result */}
                {recommendation && recommendation.recommendation && (
                  <div className="recommendation-result">
                    <div className="song-card">
                      {recommendation.recommendation.album_image ? (
                        <div className="album-art-container">
                          <img 
                            src={recommendation.recommendation.album_image} 
                            alt={`${recommendation.recommendation.album} album art`}
                            className="album-art"
                          />
                        </div>
                      ) : (
                        <div className="album-art-placeholder">
                          <span>🎵</span>
                        </div>
                      )}
                      <div className="song-info">
                        <h3 className="song-title">{recommendation.recommendation.name}</h3>
                        <p className="song-artist">
                          by {typeof recommendation.recommendation.artist === 'object' 
                              ? recommendation.recommendation.artist.name 
                              : recommendation.recommendation.artist}
                        </p>
                        {recommendation.recommendation.album && (
                          <p className="song-album">
                            Album: {recommendation.recommendation.album}
                          </p>
                        )}
                        <p className="song-duration">
                          Duration: {formatDuration(recommendation.recommendation.duration)}
                        </p>

                        {/* Rhythm and Tempo Ratings */}
                        <div className="song-ratings">
                          <div className="rating-item">
                            <span className="rating-label">Rhythm Complexity: </span>
                            <span className="rating-stars">
                              {[...Array(4)].map((_, index) => (
                                <span
                                  key={index}
                                  className={index < recommendation.rhythm_complexity ? "filled-stars" : "empty-stars"}
                                >
                                  {index < recommendation.rhythm_complexity ? "★" : "☆"}
                                </span>
                              ))}
                            </span>
                          </div>
                          <div className="rating-item">
                            <span className="rating-label">Tempo Challenge: </span>
                            <span className="rating-stars">
                              {[...Array(4)].map((_, index) => (
                                <span
                                  key={index}
                                  className={index < recommendation.tempo_rating ? "filled-stars" : "empty-stars"}
                                >
                                  {index < recommendation.tempo_rating ? "★" : "☆"}
                                </span>
                              ))}
                            </span>
                          </div>
                        </div>

                        {/* Skill Level Context */}
                        <div className="skill-context">
                          <div className="skill-header">
                            <h4 className="skill-level">Recommended for {recommendation.skill_level} drummers</h4>
                          </div>
                          <p className="skill-description">{recommendation.skill_context}</p>
                        </div>

                        <div className="song-tags">
                          {recommendation.recommendation.tags && recommendation.recommendation.tags.map((tag, index) => (
                            <span key={index} className="tag">
                              {typeof tag === 'object' ? tag.name : tag}
                            </span>
                          ))}
                        </div>
                        <div className="song-actions">
                          <a
                            href={recommendation.recommendation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="listen-button"
                          >
                            Listen on Last.fm
                          </a>
                          <button
                            onClick={() => handleAddToFavorites(recommendation.recommendation)}
                            className="add-favorite-button"
                          >
                            Add to Favorites
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SongRecommendation; 

// Helper function to determine rhythm complexity rating
const getRhythmComplexityRating = (timeSignature, skillLevel) => {
  if (skillLevel === 'Advanced') {
    if (!timeSignature || timeSignature === '4/4' || timeSignature === '3/4') {
      return <><span className="filled-stars">★</span><span className="empty-stars">☆☆☆</span></>;
    }
    if (timeSignature === '2/4') {
      return <><span className="filled-stars">★★</span><span className="empty-stars">☆☆</span></>;
    }
    if (timeSignature === '6/8') {
      return <><span className="filled-stars">★★★</span><span className="empty-stars">☆</span></>;
    }
    if (timeSignature === '5/4' || timeSignature === '7/8' || timeSignature === '12/8') {
      return <><span className="filled-stars">★★★★</span></>;
    }
    return <><span className="filled-stars">★★</span><span className="empty-stars">☆☆</span></>;
  }

  // For other skill levels
  if (!timeSignature || timeSignature === '4/4' || timeSignature === '3/4') {
    return <><span className="filled-stars">★</span><span className="empty-stars">☆☆☆</span></>;
  }
  if (timeSignature === '2/4') {
    return <><span className="filled-stars">★★</span><span className="empty-stars">☆☆</span></>;
  }
  if (timeSignature === '6/8' || timeSignature === '12/8') {
    return <><span className="filled-stars">★★★</span><span className="empty-stars">☆</span></>;
  }
  return <><span className="filled-stars">★★★★</span></>;
};

// Helper function to determine tempo challenge rating
const getTempoRating = (bpm, skillLevel) => {
  if (!bpm) {
    if (skillLevel === 'Advanced') {
      return <><span className="filled-stars">★★★</span><span className="empty-stars">☆</span></>;
    }
    if (skillLevel === 'First-timer') {
      return <><span className="filled-stars">★</span><span className="empty-stars">☆☆☆</span></>;
    }
    return <><span className="filled-stars">★★</span><span className="empty-stars">☆☆</span></>;
  }

  if (skillLevel === 'Advanced') {
    if (bpm >= 160) return <><span className="filled-stars">★★★★</span></>;
    if (bpm >= 140) return <><span className="filled-stars">★★★</span><span className="empty-stars">☆</span></>;
    if (bpm >= 120) return <><span className="filled-stars">★★</span><span className="empty-stars">☆☆</span></>;
    return <><span className="filled-stars">★</span><span className="empty-stars">☆☆☆</span></>;
  }

  // For other skill levels
  if (skillLevel === 'First-timer') {
    if (bpm <= 85) return <><span className="filled-stars">★</span><span className="empty-stars">☆☆☆</span></>;
    if (bpm <= 100) return <><span className="filled-stars">★★</span><span className="empty-stars">☆☆</span></>;
    if (bpm <= 120) return <><span className="filled-stars">★★★</span><span className="empty-stars">☆</span></>;
    return <><span className="filled-stars">★★★★</span></>;
  }
  if (skillLevel === 'Beginner') {
    if (bpm <= 85) return <><span className="filled-stars">★</span><span className="empty-stars">☆☆☆</span></>;
    if (bpm <= 100) return <><span className="filled-stars">★★</span><span className="empty-stars">☆☆</span></>;
    if (bpm <= 120) return <><span className="filled-stars">★★★</span><span className="empty-stars">☆</span></>;
    return <><span className="filled-stars">★★★★</span></>;
  }
  // Intermediate
  if (bpm <= 100) return <><span className="filled-stars">★★</span><span className="empty-stars">☆☆</span></>;
  if (bpm <= 120) return <><span className="filled-stars">★★★</span><span className="empty-stars">☆</span></>;
  return <><span className="filled-stars">★★★★</span></>;
}; 