import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Page shown after registration for optional user preferences
const Customisation = () => {
  const navigate = useNavigate();

  // store selections in component state 
  // Need to store them in a database later?
  const [skill, setSkill] = useState('');
  const [practice, setPractice] = useState('');
  const [genres, setGenres] = useState([]);

  // toggle a genre in the selected list
  const toggleGenre = (genre) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app selections could be sent to the backend here
    console.log({ skill, practice, genres });
    navigate('/home');
  };

  const skillOptions = ['First-timer', 'Beginner', 'Casual drummer', 'Experienced'];
  const practiceOptions = ['Casual', 'Regular', 'Unstoppable', 'Not sure yet'];
  const genreOptions = ['Rock', 'Pop', 'Blues', 'Funk', 'Jazz', 'Metal', 'Hip-Hop', 'Electronic', 'Classical'];

  return (
    <section className="hero">
      <h1>Tell us about yourself</h1>
      <form onSubmit={handleSubmit}>
        {/* Select drum skill level */}
        <div className="mb-3">
          <p>What is your current drum skill level?</p>
          {skillOptions.map((level) => (
            <button
              type="button"
              key={level}
              className="get-started-btn"
              onClick={() => setSkill(level)}
              style={{ background: skill === level ? '#e03e3e' : undefined, margin: '0.25rem' }}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Select practice preference */}
        <div className="mb-3">
          <p>What practice suits you?</p>
          {practiceOptions.map((option) => (
            <button
              type="button"
              key={option}
              className="get-started-btn"
              onClick={() => setPractice(option)}
              style={{ background: practice === option ? '#e03e3e' : undefined, margin: '0.25rem' }}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Select favourite genres */}
        <div className="mb-3">
          <p>Select your favourite genre(s)</p>
          {genreOptions.map((g) => (
            <button
              type="button"
              key={g}
              className="get-started-btn"
              onClick={() => toggleGenre(g)}
              style={{ background: genres.includes(g) ? '#e03e3e' : undefined, margin: '0.25rem' }}
            >
              {g}
            </button>
          ))}
        </div>

        <button type="submit" className="get-started-btn">
          Continue
        </button>
      </form>
    </section>
  );
};

export default Customisation;