import React, { useEffect, useRef, useState } from 'react';
import '../styles/RhythmTrainer.css';

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
  const audioRefs = useRef([]);
  const [keybinds, setKeybinds] = useState(getInitialKeybinds());
  const [editingIdx, setEditingIdx] = useState(null);
  const [error, setError] = useState('');

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
        const audio = audioRefs.current[idx];
        if (audio) {
          audio.currentTime = 0;
          audio.play();
        }
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

  return (
    <div className="rhythm-trainer-container">
      <h1 className="rhythm-trainer-title">Rhythm Trainer</h1>
      <div className="drum-pad-row">
        {DRUMS.map((drum, idx) => (
          <div key={drum.name} className="drum-pad-col">
            <button
              className="drum-pad-btn"
              onClick={() => {
                const audio = audioRefs.current[idx];
                if (audio) {
                  audio.currentTime = 0;
                  audio.play();
                }
              }}
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
      <div className="reset-btn-row">
        <button
          className="reset-keybinds-btn"
          onClick={handleReset}
        >
          Reset Keybinds
        </button>
      </div>
      {error && <div className="keybind-error">{error}</div>}
      <p className="rhythm-trainer-desc">
        Press the keys <b>{keybinds.join(', ')}</b> or click the drums to play!<br />
        You can change the keybinds above.
      </p>
    </div>
  );
} 