// RhythmTrainer.jsx
// Rhythm Trainer page: virtual drum kit, feature description, and practice dashboard link

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RhythmTrainer.css';
import TargetIcon from '../styles/images/RhythmTrainerIcons/target.png';
import MusicNoteIcon from '../styles/images/RhythmTrainerIcons/music-note.png';
import LightningIcon from '../styles/images/RhythmTrainerIcons/lightning.png';
import LadderIcon from '../styles/images/RhythmTrainerIcons/ladder.png';

// Drum definitions and default keybinds
const DRUMS = [
  { name: 'Crash', defaultKey: 'C', file: '/sounds/Crash.mp3' },
  { name: 'Hi-Hat', defaultKey: 'H', file: '/sounds/Hi-Hat.mp3' },
  { name: 'Snare', defaultKey: 'S', file: '/sounds/Snare.mp3' },
  { name: 'Kick', defaultKey: 'K', file: '/sounds/Kick.mp3' },
];

const LOCAL_KEYBINDS_KEY = 'rhythm_trainer_keybinds';

// Helper to get initial keybinds from localStorage or defaults
function getInitialKeybinds() {
  const saved = localStorage.getItem(LOCAL_KEYBINDS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === DRUMS.length) {
        return parsed;
      }
    } catch {}
  }
  return DRUMS.map(d => d.defaultKey);
}

export default function RhythmTrainer() {
  // Refs and state
  const audioRefs = useRef([]); // For playing drum sounds
  const [keybinds, setKeybinds] = useState(getInitialKeybinds()); // Keybinds for each drum
  const [editingIdx, setEditingIdx] = useState(null); // Which keybind is being edited
  const [error, setError] = useState(''); // Error for keybind editing
  const [activeDrumIdxs, setActiveDrumIdxs] = useState([]); // Indices of drums currently being played (for green highlight)

  // Save keybinds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_KEYBINDS_KEY, JSON.stringify(keybinds));
  }, [keybinds]);

  // Keydown handler for playing drums
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingIdx !== null) return; // Don't play while editing
      const idx = keybinds.findIndex(k => k.toLowerCase() === e.key.toLowerCase());
      if (idx !== -1) {
        // Play sound and highlight drum
        const audio = audioRefs.current[idx];
        if (audio) {
          audio.currentTime = 0;
          audio.play();
        }
        setActiveDrumIdxs(prev => [...prev, idx]);
        setTimeout(() => {
          setActiveDrumIdxs(prev => prev.filter(i => i !== idx));
        }, 150);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keybinds, editingIdx]);

  // Keydown handler for editing keybind
  useEffect(() => {
    if (editingIdx === null) return;
    const handleEditKey = (e) => {
      const newKey = e.key.length === 1 ? e.key.toUpperCase() : '';
      if (!newKey) return;
      if (keybinds.includes(newKey)) {
        setError('Key already in use!');
        return;
      }
      setKeybinds(prev => prev.map((k, i) => i === editingIdx ? newKey : k));
      setEditingIdx(null);
      setError('');
    };
    window.addEventListener('keydown', handleEditKey);
    return () => window.removeEventListener('keydown', handleEditKey);
  }, [editingIdx, keybinds]);

  // Once clicked on "Change", start editing a keybind
  const handleEditClick = (idx) => {
    setEditingIdx(idx);
    setError('');
  };

  // Reset all keybinds to default settings
  const handleReset = () => {
    setKeybinds(DRUMS.map(d => d.defaultKey));
    setError('');
  };

  // Handler: Play drum by click (also highlights)
  const handleDrumClick = (idx) => {
    const audio = audioRefs.current[idx];
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
    setActiveDrumIdxs(prev => [...prev, idx]);
    setTimeout(() => {
      setActiveDrumIdxs(prev => prev.filter(i => i !== idx));
    }, 150);
  };

  // --- Render ---
  return (
    <div className="rhythm-trainer-container">
      {/* Main Title */}
      <h1 className="rhythm-trainer-title" style={{ fontSize: '3.2rem', fontWeight: 800, letterSpacing: '0.03em', marginBottom: '0.5rem', color: '#ffb3b3', textShadow: '0 4px 24px #ff5a36a0' }}>
        Rhythm Trainer
      </h1>

      {/* About Section (Top) */}
      <div className="about-section">
        <div className="description-section">
          <h2 className="section-title">About Rhythm Trainer</h2>
          <div className="description-content">
            <p className="description-text">
              Rhythm Trainer is designed to teach beginners the fundamentals of drumming. 
              Our interactive learning system combines virtual drum practice with structured 
              lessons to help you develop essential drumming skills.
            </p>
            {/* Features grid */}
            <div className="features-list">
              <div className="feature-item">
                <img src={TargetIcon} alt="Target" className="feature-icon-img" />
                <span>Learn basic drum patterns and timing</span>
              </div>
              <div className="feature-item">
                <img src={MusicNoteIcon} alt="Music Note" className="feature-icon-img" />
                <span>Master rhythm fundamentals and coordination</span>
              </div>
              <div className="feature-item">
                <img src={LightningIcon} alt="Lightning" className="feature-icon-img" />
                <span>Build speed and endurance gradually</span>
              </div>
              <div className="feature-item">
                <img src={LadderIcon} alt="Ladder" className="feature-icon-img" />
                <span>Step-by-step chapters for progressive learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Virtual Drum Section (Middle, Card) */}
      <div className="virtual-drum-section">
        <h2 className="section-title">Virtual Drum Kit</h2>
        <p className="description-text">
          Try out the virtual drum kit for a taste of what you'll be interacting with in our structured lessons!
        </p>
        {/* Drum pads */}
        <div className="drum-pad-row">
          {DRUMS.map((drum, idx) => (
            <div key={drum.name} className="drum-pad-col">
              <button
                className={`drum-pad-btn${activeDrumIdxs.includes(idx) ? ' active-drum' : ''}`}
                onClick={() => handleDrumClick(idx)}
              >
                {drum.name}
              </button>
              <span className="drum-key-label">
                Key: {editingIdx === idx ? <em>Press a key...</em> : keybinds[idx]}
              </span>
              <button
                className="change-key-btn"
                onClick={() => handleEditClick(idx)}
                disabled={editingIdx !== null}
              >
                Change
              </button>
              {/* Audio element for drum sound */}
              <audio ref={el => audioRefs.current[idx] = el} src={drum.file} preload="auto" />
            </div>
          ))}
        </div>
        {/* Reset keybinds button */}
        <div className="reset-btn-row">
          <button
            className="reset-keybinds-btn"
            onClick={handleReset}
          >
            Reset Keybinds
          </button>
        </div>
        {/* Error message for keybinds */}
        {error && <div className="keybind-error">{error}</div>}
        {/* Instructions for keybinds*/}
        <p className="rhythm-trainer-desc">
          Press the keys <b>{keybinds.join(', ')}</b> or click the drums to play!<br />
          You can change the keybinds above.
        </p>
      </div>
      {/* Start Practising Button (Bottom, Centered) */}
      <div className="start-practising-section">
        <Link to="/rhythm-trainer-chapters" className="start-practising-btn">
          Start Practising Now!
        </Link>
      </div>
    </div>
  );
} 