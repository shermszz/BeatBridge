import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Customisation.css';

// Page shown after registration for optional user preferences
const Customisation = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // store selections in component state 
  const [skill, setSkill] = useState('');
  const [practice, setPractice] = useState('');
  const [genres, setGenres] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      navigate('/login');
    }
  }, [navigate]);

  // Check if all required fields are filled
  useEffect(() => {
    setIsFormValid(skill !== '' && practice !== '' && genres.length > 0);
  }, [skill, practice, genres]);

  // toggle a genre in the selected list
  const toggleGenre = (genre) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If form is not valid or already submitting, do nothing
    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send customization data to backend
      const response = await fetch('/api/save-customization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          skill_level: skill,
          practice_frequency: practice,
          favorite_genres: genres
        })
      });

      if (response.ok) {
        navigate('/home');
      } else if (response.status === 401) {
        // If unauthorized, redirect to login
        navigate('/login');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save customization');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillOptions = [
    { value: 'First-timer', description: 'I\'m new to my instrument' },
    { value: 'Beginner', description: 'I only know some basics' },
    { value: 'Intermediate', description: 'I can play many songs' },
    { value: 'Advanced', description: 'I can play most songs & solos' }
  ];

  const practiceOptions = [
    { value: 'Casual', description: '1-2 days / week' },
    { value: 'Regular', description: '3 days / week', recommended: true },
    { value: 'Unstoppable', description: '4+ days / week' },
    { value: 'Not sure yet', description: 'I\'ll decide later' }
  ];

  const genreOptions = [
    'Rock', 'Pop', 'Blues', 'Funk', 'Jazz', 
    'Metal', 'Hip-Hop', 'Electronic', 'Classical',
    'Alternative & Indie', 'World', 'Country & Roots'
  ];

  return (
    <section className="hero">
      <h1>Tell us about yourself</h1>
      <form onSubmit={handleSubmit}>
        {/* Select drum skill level */}
        <div className="customisation-section">
          <h2>What's your current level?</h2>
          <p className="section-subtitle">We'll get you on the right track</p>
          <div className="options-grid">
            {skillOptions.map(({ value, description }) => (
              <button
                type="button"
                key={value}
                className={`customisation-option${skill === value ? ' selected' : ''}`}
                onClick={() => setSkill(value)}
              >
                <span className="option-title">{value}</span>
                <span className="option-description">{description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Select practice preference */}
        <div className="customisation-section">
          <h2>What practice suits you?</h2>
          <p className="section-subtitle">We recommend just 3 days a week to progress fast!</p>
          <div className="options-grid">
            {practiceOptions.map(({ value, description, recommended }) => (
              <button
                type="button"
                key={value}
                className={`customisation-option${practice === value ? ' selected' : ''}${recommended ? ' recommended' : ''}`}
                onClick={() => setPractice(value)}
              >
                <span className="option-title">{value}</span>
                <span className="option-description">{description}</span>
                {recommended && <span className="recommended-badge">RECOMMENDED</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Select favourite genres */}
        <div className="customisation-section">
          <h2>Pick 1 or more you'd like to play</h2>
          <p className="section-subtitle">You can choose more later</p>
          <div className="genre-grid">
            {genreOptions.map((genre) => (
              <button
                type="button"
                key={genre}
                className={`genre-option${genres.includes(genre) ? ' selected' : ''}`}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
                {genres.includes(genre) && <span className="checkmark">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className={`continue-btn${!isFormValid ? ' disabled' : ''}${isSubmitting ? ' submitting' : ''}`}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </section>
  );
};

export default Customisation;