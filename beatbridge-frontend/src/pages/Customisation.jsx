import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Customisation.css';
import config from '../config';

// Page shown after registration for optional user preferences
const Customisation = () => {
  const navigate = useNavigate();
  const [customizations, setCustomizations] = useState({
    skill_level: '',
    practice_frequency: '',
    favorite_genres: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
// Error handling
  const [validationErrors, setValidationErrors] = useState({
    skill: '',
    practice: '',
    genres: ''
  });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // store selections in component state 
  const [skill, setSkill] = useState('');
  const [practice, setPractice] = useState('');
  const [genres, setGenres] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  // Add state for genres
  const [genresList, setGenresList] = useState([]);
  const [genreLoading, setGenreLoading] = useState(true);
  const [genreError, setGenreError] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      navigate('/login');
      return;
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

  const validateForm = () => {
    const errors = {
      skill: '',
      practice: '',
      genres: ''
    };

    if (!skill) {
      errors.skill = 'Please select your skill level';
    }
    if (!practice) {
      errors.practice = 'Please select your practice frequency';
    }
    if (genres.length === 0) {
      errors.genres = 'Please select at least one genre';
    }

    setValidationErrors(errors);
    return Object.values(errors).every(error => error === '');
  };

  const handleCustomizationChange = (type, value) => {
    if (type === 'genres') {
      setCustomizations(prev => ({
        ...prev,
        favorite_genres: prev.favorite_genres.includes(value)
          ? prev.favorite_genres.filter(g => g !== value)
          : [...prev.favorite_genres, value]
      }));
    } else {
      setCustomizations(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/save-customization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill_level: skill,
          practice_frequency: practice,
          favorite_genres: genres
        })
      });

      if (response.ok) {
        alert('Customizations saved successfully!');
        navigate('/home');
      } else {
        alert('Failed to save customizations');
      }
    } catch (error) {
      console.error('Error saving customizations:', error);
      alert('Error saving customizations');
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

  useEffect(() => {
    const fetchGenres = async () => {
      setGenreLoading(true);
      setGenreError('');
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/genres`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch genres');
        }
        setGenresList(data.genres);
      } catch (err) {
        setGenreError('Error fetching genres. Please try again later.');
        setGenresList([]);
      }
      setGenreLoading(false);
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/get-customization`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          // If customisation exists, redirect to home
          navigate('/home');
        }
        // If 404, do nothing (show the form)
      } catch (error) {
        // Optionally handle network errors
        console.error('Error fetching customisation:', error);
      }
    };
    fetchCustomization();
  }, [navigate]);

  return (
    <section className="hero">
      <h1>Tell us about yourself</h1>
      <form onSubmit={handleSave}>
        {/* Select drum skill level */}
        <div className="customisation-section">
          <h2>What's your current level?</h2>
          <p className="section-subtitle">We'll get you on the right track.</p>
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
          <h2>Pick 1 or more genres you'd like to play</h2>
          <p className="section-subtitle">You can choose more later.</p>
          <div className="genre-grid">
            {genreLoading ? (
              <div>Loading genres...</div>
            ) : genreError ? (
              <div>{genreError}</div>
            ) : (
              genresList.map((genre) => (
                <button
                  type="button"
                  key={genre.id || genre.name}
                  className={`genre-option${genres.includes(genre.name) ? ' selected' : ''}`}
                  onClick={() => toggleGenre(genre.name)}
                >
                  {genre.name}
                  {genres.includes(genre.name) && <span className="checkmark">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Error Messages Section - Only visible after submit attempt (Pressing Continue) */}
        {hasAttemptedSubmit && (
          <div className="error-messages">
            {validationErrors.skill && (
              <p className="error-text">{validationErrors.skill}</p>
            )}
            {validationErrors.practice && (
              <p className="error-text">{validationErrors.practice}</p>
            )}
            {validationErrors.genres && (
              <p className="error-text">{validationErrors.genres}</p>
            )}
            {error && <p className="error-text">{error}</p>}
          </div>
        )}

        <button 
          type="submit" 
          className={`continue-btn${!isFormValid ? ' disabled' : ''}${isSubmitting ? ' submitting' : ''}`}
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </section>
  );
};

export default Customisation;