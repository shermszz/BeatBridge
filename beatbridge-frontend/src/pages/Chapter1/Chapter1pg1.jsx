/**
 * Drum Kit Guided Tour for Chapter 0 (Start Tour below drum kit)
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Chapter1/Chapter1pg1.css';
import config from '../../config';

export default function Chapter1pg1() {
  const navigate = useNavigate();
  // Card carousel state
  const [cardIdx, setCardIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');
  const handleNext = () => {
    setSlideDirection('slide-left');
    setTimeout(() => {
      setCardIdx(idx => Math.min(1, idx + 1));
      setSlideDirection('');
    }, 300);
  };
  const handlePrev = () => {
    setSlideDirection('slide-right');
    setTimeout(() => {
      setCardIdx(idx => Math.max(0, idx - 1));
      setSlideDirection('');
    }, 300);
  };

  // Stick Control State
  const [bpm, setBpm] = useState(60);
  const [bpmInput, setBpmInput] = useState('60');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const audioCtx = useRef(null);
  const snareBuffer = useRef(null);
  const steps = ['R', 'L', 'R', 'L'];
  const [snareHit, setSnareHit] = useState(false);

  // Keep bpmInput in sync with bpm
  useEffect(() => {
    setBpmInput(String(bpm));
  }, [bpm]);

  // Load snare sound
  useEffect(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    fetch('/sounds/Snare.mp3')
      .then(res => res.arrayBuffer())
      .then(buf => audioCtx.current.decodeAudioData(buf))
      .then(decoded => { snareBuffer.current = decoded; });
  }, []);

  // Play snare sound
  function playSnare() {
    if (audioCtx.current && snareBuffer.current) {
      const src = audioCtx.current.createBufferSource();
      src.buffer = snareBuffer.current;
      src.connect(audioCtx.current.destination);
      src.start();
    }
  }

  // Metronome interval
  useEffect(() => {
    if (!isPlaying) {
      setCurrentStep(-1);
      return;
    }
    setCurrentStep(0);
    const interval = 60000 / bpm;
    const id = setInterval(() => {
      setCurrentStep(prev => {
        const next = (prev + 1) % steps.length;
        playSnare();
        setSnareHit(true);
        setTimeout(() => setSnareHit(false), 120);
        return next;
      });
    }, interval);
    // Play snare immediately on start
    playSnare();
    setSnareHit(true);
    setTimeout(() => setSnareHit(false), 120);
    return () => clearInterval(id);
  }, [isPlaying, bpm]);

  // Reset step when stopped
  useEffect(() => {
    if (!isPlaying) setCurrentStep(-1);
  }, [isPlaying]);

  const handleBpmInputChange = (e) => {
    setBpmInput(e.target.value);
  };
  const clampBpm = (val) => Math.max(40, Math.min(200, val));
  const commitBpmInput = () => {
    const num = parseInt(bpmInput, 10);
    if (!isNaN(num)) setBpm(clampBpm(num));
    else setBpmInput(String(bpm));
  };

  // Add this function to update chapter progress, only once per user (per session)
  const updatePageProgress = async () => {
    console.log('Calling updatePageProgress (chapter1_page_progress=2)');
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.API_BASE_URL}/api/chapter-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chapter1_page_progress: 2 })
      });
    } catch (err) { console.error('Progress update failed:', err); }
  };

  // Stick SVGs for visual demo
  const SnareSVG = ({ snareHit }) => (
    <svg width="180" height="120" viewBox="0 0 180 150" style={{ display: 'block', margin: '0 auto' }}>
      {/* Drum shell (body) */}
      <rect cx="90" cy="90" rx="60" ry="22" fill="#444" stroke="#222" strokeWidth="3" />
      {/* Drum shell side (rectangle) */}
      <rect x="30" y="60" width="120" height="65" rx="18" fill="#676767" stroke="#222" strokeWidth="3" />
      {/* Gold rim (bottom) */}
      <ellipse cx="90" cy="128" rx="60" ry="15" fill="#FFD54F" stroke="#B8860B" strokeWidth="3" />
      {/* Gold rim (top) */}
      <ellipse cx="90" cy="60" rx="60" ry="20" fill="#FFD54F" stroke="#B8860B" strokeWidth="3" />
      {/* Drum head */}
      <ellipse cx="90" cy="60" rx="55" ry="18" fill="#f8f8f8" stroke="#ccc" strokeWidth="2" />
      {/* Visual effect: flash when hit */}
      {snareHit && (
        <ellipse cx="90" cy="60" rx="46" ry="15" fill="#fff8b0" fillOpacity="0.7" stroke="#ffe066" strokeWidth="4" style={{ filter: 'blur(2px)' }} />
      )}
      {/* Drum lugs (vertical lines) */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * 2 * Math.PI;
        const x1 = 90 + 56 * Math.cos(angle);
        const y1 = 60 + 20 * Math.sin(angle);
        const x2 = 90 + 56 * Math.cos(angle);
        const y2 = 128 + 12 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#B8860B" strokeWidth="4" />;
      })}
      {/* Drum lugs (circles) */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * 2 * Math.PI;
        const x = 90 + 60 * Math.cos(angle);
        const y = 60 + 22 * Math.sin(angle);
        return <circle key={i} cx={x} cy={y} r="5" fill="#FFD54F" stroke="#B8860B" strokeWidth="2" />;
      })}
    </svg>
  );
  const StickSVG = ({ side, active }) => {
    // side: 'left' or 'right'
    // active: boolean (if true, stick is hitting the drum)
    const isLeft = side === 'left';
    // Stick position/rotation
    const baseX = isLeft ? 60 : 120;
    const baseY = 6;
    const angle = isLeft ? (active ? -40 : -20) : (active ? 40 : 20);
    return (
      <svg width="70" height="70" style={{ position: 'absolute', left: baseX - 35, top: baseY - 10, pointerEvents: 'none', zIndex: 2 }}>
        <g transform={`rotate(${angle} 35 10)`}>
          {/* Stick body */}
          <rect x="30" y="10" width="10" height="45" rx="4" fill="#e0b97d" stroke="#b48a4a" strokeWidth="2" />
          {/* Stick tip */}
          <ellipse cx="35" cy="10" rx="7" ry="5" fill="#f5e1b7" stroke="#b48a4a" strokeWidth="1" />
        </g>
      </svg>
    );
  };

  // Stick control UI (previous design)
  const stickRLBar = (
    <div className="stick-control-bar" style={{ marginBottom: '1.2rem', marginTop: '1rem' }}>
      {steps.map((s, i) => (
        <div
          key={i}
          className={`stick-control-step${currentStep === i ? ' active' : ''}`}
        >
          {s}
        </div>
      ))}
    </div>
  );

  // Stick control visual: snare + sticks
  const stickVisual = (
    <div style={{ position: 'relative', width: 180, height: 100, margin: '0 auto 2.8rem auto' }}>
      <SnareSVG snareHit={snareHit} />
      <StickSVG side="left" active={currentStep === 1 || currentStep === 3} />
      <StickSVG side="right" active={currentStep === 0 || currentStep === 2} />
    </div>
  );

  const metronomeControls = (
    <div className="metronome-controls">
      <button onClick={() => setIsPlaying(p => !p)} className="metronome-play-btn">
        {isPlaying ? 'Stop' : 'Play'}
      </button>
      <label style={{marginLeft: '1.5rem', marginRight: '0.5rem'}}>BPM:</label>
      <input
        type="number"
        min={40}
        max={200}
        value={bpmInput}
        onChange={handleBpmInputChange}
        onBlur={commitBpmInput}
        onKeyDown={e => { if (e.key === 'Enter') commitBpmInput(); }}
        className="metronome-bpm-input"
        style={{width: '4rem'}}
      />
    </div>
  );

  return (
    <div className="chapter1-container">
      <h1 className="chapter1-title">Chapter 1: Introduction to Stick Control</h1>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2.5rem 0 2.5rem 0' }}>
        <div className={`chapter1-card-carousel${slideDirection ? ' ' + slideDirection : ''}`} style={{ background: '#232946', borderRadius: 16, boxShadow: '0 2px 16px #0004', padding: '2.2rem 2.5rem', minWidth: 600, maxWidth: 720, color: '#fff', textAlign: 'center', position: 'relative', transition: 'transform 0.3s, opacity 0.3s' }}>
          {cardIdx === 0 && (
            <div>
              <div className="chapter1-description-card" style={{ background: 'transparent', boxShadow: 'none', margin: 0, padding: 0 }}>
                <div className="chapter1-description">
                  <p>
                    Welcome to Chapter 1!
                  </p>
                  <p>
                    In this chapter, you'll learn about stick control using the snare drum, focusing on quarter notes and rests. You'll practice basic stick patterns, play along with a metronome, and build your rhythmic foundation for drumming.
                  </p>
                  <p>
                    The exercises will help you develop coordination, timing, and control using alternating right (R) and left (L) hand strokes. Let's get started!
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2.2rem' }}>
                <button className="chapter0-nav-button" onClick={handleNext}>
                  →
                </button>
              </div>
            </div>
          )}
          {cardIdx === 1 && (
            <div>
              <div className="stick-control-explanation">
                <p>
                  Let's put your hands into action! The first step in stick control is learning to alternate your right (R) and left (L) hands evenly, just like walking. Below, you'll see a simple pattern: R L R L. Each letter represents a stroke with your right or left hand.
                </p>
                <p>
                  For now, just press play, watch the highlighted pattern, and listen to the snare pattern. Visualise how your hands would move with each beat. Don't worry about playing along yet—this is just a demonstration to help you get a feel for the rhythm and the flow of alternating hands. Practising will come next!
                </p>
              </div>
              <div className="stick-control-exercise">
                <h2 className="stick-control-title">Stick Control 1: R L R L (Quarter Notes)</h2>
                {stickVisual}
                {stickRLBar}
                {metronomeControls}
              </div>
              {/* Red back arrow inside card */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2.2rem' }}>
                <button className="chapter0-nav-button" onClick={handlePrev}>
                  ←
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Navigation Buttons always at the bottom */}
      <div className="chapter1-bottom-nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', marginTop: '2.5rem' }}>
        <button className="chapter1-back-link" onClick={async () => {
          await updatePageProgress();
          navigate('/chapter1pg2');
        }}>
          Next →
        </button>
        <button className="chapter1-back-link" onClick={() => navigate('/chapter1-dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
} 