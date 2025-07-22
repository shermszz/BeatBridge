// RhythmTrainer.jsx
// Rhythm Trainer page: virtual drum kit, feature description, and practice dashboard link

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RhythmTrainer.css';
import TargetIcon from '../styles/images/RhythmTrainerIcons/target.png';
import MusicNoteIcon from '../styles/images/RhythmTrainerIcons/music-note.png';
import LightningIcon from '../styles/images/RhythmTrainerIcons/lightning.png';
import LadderIcon from '../styles/images/RhythmTrainerIcons/ladder.png';
import VirtualDrumKit from '../styles/images/virtualDrumKit.jpg';

// Drum definitions with multiple key bindings and positions
const DRUMS = [
  { 
    name: 'Crash', 
    keys: ['y'], 
    file: '/sounds/Crash.mp3', 
    type: 'cymbal',
    style: { top: '17%', left: '25%', width: '12%' }
  },
  { 
    name: 'Ride', 
    keys: ['u'], 
    file: '/sounds/Ride.mp3',
    type: 'cymbal',
    style: { top: '18%', right: '18%', width: '12%' }
  },
  { 
    name: 'Hi-Hat Open', 
    keys: ['e'], 
    file: '/sounds/Open Hihat.mp3', 
    type: 'cymbal',
    style: { top: '27%', left: '12%', width: '10%' }
  },
  { 
    name: 'Hi-Hat Closed', 
    keys: ['r'], 
    file: '/sounds/Hi-Hat.mp3', 
    type: 'cymbal',
    style: { top: '27%', left: '21.5%', width: '10%' }
  },
  { 
    name: 'High Tom', 
    keys: ['c'], 
    file: '/sounds/High Tom.mp3',
    type: 'tom',
    style: { top: '30%', left: '32%', width: '15%' }
  },
  { 
    name: 'Low Tom', 
    keys: ['g'], 
    file: '/sounds/Low Tom.mp3',
    type: 'tom',
    style: { top: '30%', right: '32%', width: '15%' }
  },
  { 
    name: 'Floor Tom', 
    keys: ['h'], 
    file: '/sounds/Floor Tom.mp3',
    type: 'tom',
    style: { top: '45%', right: '15%', width: '18%' }
  },
  { 
    name: 'Snare', 
    keys: ['j'], 
    file: '/sounds/Snare.mp3',
    type: 'snare',
    style: { top: '42%', left: '24%', width: '15%' }
  },
  { 
    name: 'Bass', 
    keys: ['s'], 
    file: '/sounds/Kick.mp3',
    type: 'bass',
    style: { top: '50%', left: '50%', transform: 'translateX(-50%)', width: '20%' }
  },
];

const LOCAL_KEYBINDS_KEY = 'rhythm_trainer_keybinds';

// Helper to get initial keybinds from localStorage or defaults
function getInitialKeybinds() {
  const saved = localStorage.getItem(LOCAL_KEYBINDS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Validate the saved keybinds match our current drum structure
      if (Array.isArray(parsed) && parsed.every((bind, i) => 
        Array.isArray(bind) && bind.length === DRUMS[i].keys.length)) {
        return parsed;
      }
    } catch {}
  }
  return DRUMS.map(d => d.keys);
}

export default function RhythmTrainer() {
  // Refs and state
  const audioRefs = useRef([]); // For playing drum sounds
  const [keybinds, setKeybinds] = useState(getInitialKeybinds()); // Keybinds for each drum
  const [showShortcuts, setShowShortcuts] = useState(true); // Toggle for showing shortcuts
  const [editingDrum, setEditingDrum] = useState(null); // Which drum is being edited
  const [editingKeyIdx, setEditingKeyIdx] = useState(null); // Which key in the drum's bindings is being edited
  const [error, setError] = useState(''); // Error for keybind editing
  const [activeDrumIdxs, setActiveDrumIdxs] = useState([]); // Indices of drums currently being played
  const keybindCardRef = useRef(null);
  const drumKitContainerRef = useRef(null);
  const [drumKitHeight, setDrumKitHeight] = useState(null);

  // Synchronize drum kit container height with keybind card
  useEffect(() => {
    if (keybindCardRef.current) {
      setDrumKitHeight(keybindCardRef.current.offsetHeight);
    }
  }, [keybinds, showShortcuts, editingDrum, editingKeyIdx]);

  // Save keybinds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_KEYBINDS_KEY, JSON.stringify(keybinds));
  }, [keybinds]);

  // Keydown handler for playing drums
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      // Find the first drum that has this key in its bindings
      const drumIdx = DRUMS.findIndex(drum => 
        keybinds[DRUMS.indexOf(drum)].some(k => k.toLowerCase() === key)
      );

      if (drumIdx !== -1) {
        handleDrumClick(drumIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keybinds]);

  // Keydown handler for editing keybind
  useEffect(() => {
    if (editingDrum === null || editingKeyIdx === null) return;
    
    const handleEditKey = (e) => {
      const newKey = e.key.toLowerCase();
      if (newKey.length !== 1) return;

      // Check if key is already used in any drum's bindings
      const isKeyUsed = DRUMS.some((drum, drumIdx) => 
        keybinds[drumIdx].some(k => k.toLowerCase() === newKey)
      );

      if (isKeyUsed) {
        setError('Key already in use!');
        return;
      }

      setKeybinds(prev => prev.map((drumKeys, idx) => 
        idx === editingDrum 
          ? drumKeys.map((k, keyIdx) => keyIdx === editingKeyIdx ? newKey : k)
          : drumKeys
      ));
      setEditingDrum(null);
      setEditingKeyIdx(null);
      setError('');
    };

    window.addEventListener('keydown', handleEditKey);
    return () => window.removeEventListener('keydown', handleEditKey);
  }, [editingDrum, editingKeyIdx, keybinds]);

  // Once clicked on "Change", start editing a keybind
  const handleEditClick = (drumIdx, keyIdx) => {
    setEditingDrum(drumIdx);
    setEditingKeyIdx(keyIdx);
    setError('');
  };

  // Reset all keybinds to default settings
  const handleReset = () => {
    setKeybinds(DRUMS.map(d => d.keys));
    setError('');
  };

  // Handler: Play drum by click
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

      {/* Virtual Drum Section (Middle) */}
      <div className="virtual-drum-section">
        <h2 className="section-title">Virtual Drum Kit</h2>
        <p style={{ color: '#fff', textAlign: 'center', marginTop: '0.5rem', marginBottom: '2rem', fontSize: '1.08rem', opacity: 0.85 }}>
          This is a preview of the virtual drum kit you will be interacting with!
        </p>
        {/* Flex row for drum kit and keybind controls */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: '2.5rem', width: '100%' }}>
          <div
            className="drum-kit-container"
            style={{ flex: '1 1 0', maxWidth: 700, height: drumKitHeight ? drumKitHeight : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            ref={drumKitContainerRef}
          >
            <img src={VirtualDrumKit} alt="Virtual Drum Kit" className="drum-kit-image" style={{ maxHeight: drumKitHeight ? drumKitHeight : '100%', width: '100%', objectFit: 'contain' }} />
            <div className="drum-kit-overlay">
              {DRUMS.map((drum, idx) => (
                <div
                  key={drum.name}
                  className={`drum ${drum.type} ${activeDrumIdxs.includes(idx) ? 'active' : ''}`}
                  style={drum.style}
                  // REMOVED onClick from here
                >
                  <div className="drum-hotspot"></div>
                  {showShortcuts && (
                    <div className="key-label">
                      {keybinds[idx][0].toUpperCase()}
                    </div>
                  )}
                  <audio
                    ref={el => audioRefs.current[idx] = el}
                    src={drum.file}
                    preload="auto"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Keybind Controls to the right */}
          <div
            className="keybind-controls"
            style={{ flex: '0 0 340px', minWidth: 300, marginTop: 0 }}
            ref={keybindCardRef}
          >
            <h3>Customize Key Bindings</h3>
            <div className="keybind-grid">
              {DRUMS.map((drum, drumIdx) => (
                <div key={drum.name} className="keybind-row">
                  <span className="drum-name">{drum.name}:</span>
                  <div className="key-buttons">
                    {keybinds[drumIdx].map((key, keyIdx) => (
                      <button
                        key={keyIdx}
                        className="key-button"
                        onClick={() => handleEditClick(drumIdx, keyIdx)}
                        disabled={editingDrum !== null}
                      >
                        {editingDrum === drumIdx && editingKeyIdx === keyIdx ? 
                          'Press a key...' : 
                          key.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="reset-keybinds-btn" onClick={handleReset}>
              Reset All Keybinds
            </button>
            <button 
              className="shortcuts-toggle-btn"
              onClick={() => setShowShortcuts(!showShortcuts)}
            >
              {showShortcuts ? 'Hide shortcuts' : 'Show shortcuts'}
            </button>
            {error && <div className="keybind-error">{error}</div>}
          </div>
        </div>
      </div>

      {/* Start Practising Button (Bottom) */}
      <div className="start-practising-section">
        <Link to="/rhythm-trainer-chapters" className="start-practising-btn">
          Start Practising Now!
        </Link>
      </div>
    </div>
  );
} 