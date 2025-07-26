/**
 * Chapter1pg3 - Introduction to Rest Notes
 * 
 * This component introduces users to rest notes in stick control patterns.
 * It demonstrates how to incorporate silence (rests) into rhythmic patterns
 * and provides an interactive demonstration of R L R rest pattern.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Chapter1/Chapter1pg1.css';
import '../../styles/Chapter1/Chapter1pg4.css';
import config from '../../config';

export default function Chapter1pg3() {
  const navigate = useNavigate();
  // Stick Control State
  const [bpm, setBpm] = useState(60);
  const [bpmInput, setBpmInput] = useState('60');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const audioCtx = useRef(null);
  const snareBuffer = useRef(null);
  // R L R rest
  const steps = ['R', 'L', 'R', 'rest'];
  const [snareHit, setSnareHit] = useState(false);

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
        if (steps[next] !== 'rest') {
          playSnare();
          setSnareHit(true);
          setTimeout(() => setSnareHit(false), 120);
        }
        return next;
      });
    }, interval);
    // Play snare immediately on start if not rest
    if (steps[0] !== 'rest') {
      playSnare();
      setSnareHit(true);
      setTimeout(() => setSnareHit(false), 120);
    }
    return () => clearInterval(id);
  }, [isPlaying, bpm]);

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
    console.log('Calling updatePageProgress (chapter1_page_progress=4)');
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.API_BASE_URL}/api/chapter-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chapter1_page_progress: 4 })
      });
    } catch (err) { console.error('Progress update failed:', err); }
  };

  // SVGs
  const SnareSVG = ({ snareHit }) => (
    <svg width="180" height="120" viewBox="0 0 180 150" style={{ display: 'block', margin: '0 auto' }}>
      <rect cx="90" cy="90" rx="60" ry="22" fill="#444" stroke="#222" strokeWidth="3" />
      <rect x="30" y="60" width="120" height="65" rx="18" fill="#676767" stroke="#222" strokeWidth="3" />
      <ellipse cx="90" cy="128" rx="60" ry="15" fill="#FFD54F" stroke="#B8860B" strokeWidth="3" />
      <ellipse cx="90" cy="60" rx="60" ry="20" fill="#FFD54F" stroke="#B8860B" strokeWidth="3" />
      <ellipse cx="90" cy="60" rx="55" ry="18" fill="#f8f8f8" stroke="#ccc" strokeWidth="2" />
      {snareHit && (
        <ellipse cx="90" cy="60" rx="46" ry="15" fill="#fff8b0" fillOpacity="0.7" stroke="#ffe066" strokeWidth="4" style={{ filter: 'blur(2px)' }} />
      )}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * 2 * Math.PI;
        const x1 = 90 + 56 * Math.cos(angle);
        const y1 = 60 + 20 * Math.sin(angle);
        const x2 = 90 + 56 * Math.cos(angle);
        const y2 = 128 + 12 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#B8860B" strokeWidth="4" />;
      })}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * 2 * Math.PI;
        const x = 90 + 60 * Math.cos(angle);
        const y = 60 + 22 * Math.sin(angle);
        return <circle key={i} cx={x} cy={y} r="5" fill="#FFD54F" stroke="#B8860B" strokeWidth="2" />;
      })}
    </svg>
  );
  const StickSVG = ({ side, active }) => {
    const isLeft = side === 'left';
    const baseX = isLeft ? 60 : 120;
    const baseY = 6;
    const angle = isLeft ? (active ? -40 : -20) : (active ? 40 : 20);
    return (
      <svg width="70" height="70" style={{ position: 'absolute', left: baseX - 35, top: baseY - 10, pointerEvents: 'none', zIndex: 2 }}>
        <g transform={`rotate(${angle} 35 10)`}>
          <rect x="30" y="10" width="10" height="45" rx="4" fill="#e0b97d" stroke="#b48a4a" strokeWidth="2" />
          <ellipse cx="35" cy="10" rx="7" ry="5" fill="#f5e1b7" stroke="#b48a4a" strokeWidth="1" />
        </g>
      </svg>
    );
  };

  // Stick control UI
  const stickRLBar = (
    <div className="stick-control-bar" style={{ marginBottom: '1.2rem', marginTop: '1rem' }}>
      {steps.map((s, i) => (
        <div
          key={i}
          className={`stick-control-step${currentStep === i ? ' active' : ''}`}
        >
          {s === 'rest' ? (
            <img 
              src={require('../../styles/images/Chapter0/crotchet-rest.png')} 
              alt="rest" 
              style={{ height: 32, marginTop: 2, filter: currentStep === i ? 'brightness(0) saturate(100%) invert(81%) sepia(13%) saturate(7492%) hue-rotate(312deg) brightness(101%) contrast(101%)' : 'none' }}
            />
          ) : s}
        </div>
      ))}
    </div>
  );

  // Stick control visual: snare + sticks
  const stickVisual = (
    <div style={{ position: 'relative', width: 180, height: 100, margin: '0 auto 2.8rem auto' }}>
      <SnareSVG snareHit={snareHit && steps[currentStep] !== 'rest'} />
      <StickSVG side="left" active={currentStep === 1} />
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
      <h1 className="chapter1-title">Stick Control: Quarter Note Pattern with Rest</h1>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2.5rem 0 2.5rem 0' }}>
        <div className="chapter1-card-carousel" style={{ background: '#232946', borderRadius: 16, boxShadow: '0 2px 16px #0004', padding: '2.2rem 2.5rem', minWidth: 600, maxWidth: 720, color: '#fff', textAlign: 'center', position: 'relative', transition: 'transform 0.3s, opacity 0.3s' }}>
          <div className="stick-control-explanation">
            <p>
              Let's now explore a new stick control pattern that includes a rest! If you recall, the quarter rest note (crotchet rest) is a note where you do not play on that beat.
            </p>
            <p>
              Press play and adjust the BPM to your desired speed, and watch the highlighted pattern, and listen to the snare. When the rest symbol appears, notice there is <b>no sound</b>—this is your moment to pause. Visualise your hands moving with each beat, and get used to the flow of playing and resting!
            </p>
          </div>
          <div className="stick-control-exercise">
            <h2 className="stick-control-title">Stick Control: R L R (rest) (Quarter Notes)</h2>
            {stickVisual}
            {stickRLBar}
            {metronomeControls}
          </div>
        </div>
      </div>
      <div className="chapter1-bottom-nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', marginTop: '2.5rem' }}>
        <button className="chapter1-back-link" onClick={() => navigate('/chapter1pg2')}>
          ← Back
        </button>
        <button className="chapter1-back-link" onClick={() => navigate('/chapter1-dashboard')}>
          Back to Dashboard
        </button>
        <button className="chapter1-back-link" onClick={async () => {
          await updatePageProgress();
          navigate('/chapter1pg4');
        }}>
          Next →
        </button>
      </div>
    </div>
  );
}
