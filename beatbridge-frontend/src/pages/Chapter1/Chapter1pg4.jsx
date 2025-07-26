import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Chapter1/Chapter1pg3.css';
import config from '../../config';

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

const exercises = [
  { name: 'Exercise 1', pattern: ['R', 'L', 'R', 'rest'] },
  { name: 'Exercise 2', pattern: ['R', 'rest', 'R', 'L'] },
  { name: 'Exercise 3', pattern: ['R', 'L', 'rest', 'L'] },
  { name: 'Exercise 4', pattern: ['R', 'rest', 'R', 'rest', 'R', 'rest', 'R', 'L'] },
  { name: 'Exercise 5', pattern: ['R', 'rest', 'R', 'L', 'R', 'rest', 'R', 'L'] },
  { name: 'Exercise 6', pattern: ['R', 'L', 'R', 'rest', 'R', 'L', 'R', 'rest'] },
  { name: 'Exercise 7', pattern: ['R', 'L', 'rest', 'L', 'R', 'rest', 'R', 'L'] },
];

export default function Chapter1pg3() {
  const navigate = useNavigate();
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [userHits, setUserHits] = useState([]); // 'R', 'L', 'rest', or null for each step
  const [snareHit, setSnareHit] = useState(false);
  const [stickAnim, setStickAnim] = useState({ left: false, right: false });
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | 'rest-correct'
  const [isPlaying, setIsPlaying] = useState(false); 
  const [bpm] = useState(65); 
  const [currentBeat, setCurrentBeat] = useState(-1); 
  const [canHit, setCanHit] = useState(false); 
  const pattern = exercises[exerciseIdx].pattern;
  const audioCtx = useRef(null);
  const snareBuffer = useRef(null);

  // Add this function to update chapter progress, only once per user (per session)
  const updatePageProgress = async () => {
    console.log('Calling updatePageProgress (chapter1_page_progress=5)');
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.API_BASE_URL}/api/chapter-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chapter1_page_progress: 5 })
      });
    } catch (err) { console.error('Progress update failed:', err); }
  };

  // Load snare sound
  useEffect(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    fetch('/sounds/Snare.mp3')
      .then(res => res.arrayBuffer())
      .then(buf => audioCtx.current.decodeAudioData(buf))
      .then(decoded => { snareBuffer.current = decoded; });
  }, []);

  // Play metronome click (same as JamSession)
  function playMetronome() {
    if (!audioCtx.current) return;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.type = 'square';
    osc.frequency.value = 1800;
    gain.gain.value = 0.18;
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    osc.stop(audioCtx.current.currentTime + 0.07);
  }
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
      setCurrentBeat(-1);
      setCanHit(false);
      return;
    }
    setCurrentBeat(0);
    setCanHit(true);
    const interval = 60000 / bpm;
    playMetronome();
    const id = setInterval(() => {
      setCurrentBeat(beat => (beat + 1) % pattern.length);
      setCanHit(true);
      playMetronome();
      setTimeout(() => setCanHit(false), Math.min(600, interval * 0.9)); 
    }, interval);
    setTimeout(() => setCanHit(false), Math.min(600, interval * 0.9));
    return () => clearInterval(id);
  }, [isPlaying, bpm, pattern.length]);

  // Track if user pressed during a rest
  const restPressedRef = useRef(false);
  const lastProcessedRestStep = useRef(-1);

  // Handle key press (metronome version)
  const handleKeyDown = useCallback((e) => {
    if (!isPlaying) return;
    let hit = null;
    if (e.key === 'j' || e.key === 'J') hit = 'R';
    if (e.key === 'd' || e.key === 'D') hit = 'L';
    if (!hit) return;
    if (stepIdx >= pattern.length) return;

    // Animate stick
    setStickAnim(anim => ({ ...anim, [hit === 'R' ? 'right' : 'left']: true }));
    setTimeout(() => setStickAnim(anim => ({ ...anim, [hit === 'R' ? 'right' : 'left']: false })), 120);
    // Snare flash
    setSnareHit(true);
    setTimeout(() => setSnareHit(false), 120);
    // Play sound
    playSnare();

    // If not in hit window, show ❌ and reset
    if (!canHit) {
      setFeedback('incorrect');
      setTimeout(() => {
        setStepIdx(0);
        setUserHits([]);
        setFeedback(null);
        restPressedRef.current = false;
      }, 700);
      return;
    }

    // If this step is a rest, pressing is a mistake
    if (pattern[stepIdx] === 'rest') {
      restPressedRef.current = true; // prevent green tick
      setFeedback('incorrect');
      setTimeout(() => {
        setStepIdx(0);
        setUserHits([]);
        setFeedback(null);
        restPressedRef.current = false;
      }, 700);
      return;
    }

    // Check correctness for R/L
    const correct = hit === pattern[stepIdx];
    setFeedback(correct ? 'correct' : 'incorrect');
    if (correct) {
      setTimeout(() => setFeedback(null), 300);
      setUserHits(hits => {
        const newHits = [...hits];
        newHits[stepIdx] = hit;
        return newHits;
      });
      setStepIdx(idx => idx + 1);
    } else {
      setTimeout(() => {
        setStepIdx(0);
        setUserHits([]);
        setFeedback(null);
        restPressedRef.current = false;
      }, 700);
    }
    setCanHit(false); // only one hit per beat
    restPressedRef.current = true;
  }, [stepIdx, pattern, canHit, isPlaying]);

  // Listen for keydown
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // On each metronome beat, if it's a rest and user did NOT press, show green tick and advance
  useEffect(() => {
    if (!isPlaying || stepIdx >= pattern.length) return;
    if (
      pattern[stepIdx] === 'rest' &&
      canHit === false &&
      !restPressedRef.current &&
      lastProcessedRestStep.current !== stepIdx
    ) {
      setFeedback('rest-correct');
      setTimeout(() => setFeedback(null), 300);
      setUserHits(hits => {
        const newHits = [...hits];
        newHits[stepIdx] = 'rest';
        return newHits;
      });
      setStepIdx(idx => idx + 1);
      lastProcessedRestStep.current = stepIdx; // Mark this rest as processed
      return;
    }
    if (canHit === false) restPressedRef.current = false;
    if (canHit === true) lastProcessedRestStep.current = -1; // Reset for next beat
  }, [canHit, isPlaying, pattern, stepIdx]);

  // Reset on exercise change
  useEffect(() => {
    setStepIdx(0);
    setUserHits([]);
    setFeedback(null);
    restPressedRef.current = false;
  }, [exerciseIdx]);

  // Stick control visual: snare + sticks
  const stickVisual = (
    <div style={{ position: 'relative', width: 180, height: 100, margin: '0 auto 2.2rem auto' }}>
      <SnareSVG snareHit={snareHit} />
      <StickSVG side="left" active={stickAnim.left} />
      <StickSVG side="right" active={stickAnim.right} />
    </div>
  );

  // Render pattern as boxes
  const patternBoxes = (
    <div className={`stick-pattern-bar${canHit && isPlaying ? ' metronome-flash' : ''}`}>
      {pattern.map((s, i) => {
        let state = '';
        if (i < stepIdx) state = userHits[i] === s ? (s === 'rest' ? 'rest-correct' : 'correct') : 'incorrect';
        else if (i === stepIdx) state = 'active';
        return (
          <div key={i} className={`stick-pattern-step ${state}`}>{s === 'rest' ? <span className="rest-symbol">–</span> : s}</div>
        );
      })}
    </div>
  );

  // Metronome controls
  const metronomeControls = (
    <div className="metronome-controls" style={{ marginBottom: '1.2rem' }}>
      <button onClick={() => setIsPlaying(p => !p)} className="metronome-play-btn">
        {isPlaying ? 'Stop' : 'Play'}
      </button>
    </div>
  );

  return (
    <div className="chapter1-container">
      <h1 className="chapter1-title">Stick Control 2: Integrating Rest Notes</h1>
      <div className="chapter1-exercise-card-nav-wrapper">
        <div className="chapter1-exercise-card">
          <div className="chapter1-description">
            Now, we will be integrating rest notes into your stick control! For each exercise, press <b style={{color: '#ffb3b3'}}>J</b> for right hand (R) and <b style={{color: '#ffb3b3'}}>D</b> for left hand (L) <b>in time with the metronome</b>. Do <b>NOT</b> play the snare during a rest (–) box. Once you are ready, press 'Play' to begin!
          </div>
          {metronomeControls}
          <div className="chapter1-exercise-title">{exercises[exerciseIdx].name} / {exercises.length}</div>
          {stickVisual}
          {patternBoxes}
          {/* Show right arrow below patternBoxes only when exercise is complete and not last exercise */}
          {stepIdx >= pattern.length && exerciseIdx < exercises.length - 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="chapter1-nav-button right" onClick={() => setExerciseIdx(idx => Math.min(exercises.length - 1, idx + 1))}>→</button>
            </div>
          )}
          {feedback && stepIdx < pattern.length && (
            <div className={`stick-feedback ${feedback}`}>
              {feedback === 'correct' && '✅'}
              {feedback === 'incorrect' && '❌'}
              {feedback === 'rest-correct' && '✅'}
            </div>
          )}
          {/* Show congratulatory message when exercise is complete */}
          {stepIdx >= pattern.length && (
            <div className="stick-feedback complete" style={{ fontSize: '1.2rem' }}>
              {exerciseIdx === exercises.length - 1
                ? 'Congratulations on finishing all exercises!'
                : 'Nice one! Move on to the next exercise.'}
            </div>
          )}
        </div>
      </div>
      <div className="chapter1-bottom-nav-buttons" style={{ textAlign: 'center', marginTop: '2.5rem'}}>
        <button className="chapter1-back-link" onClick={() => navigate('/chapter1pg2')}>← Back</button>
        {stepIdx >= pattern.length && exerciseIdx === exercises.length - 1 && (
          <button className="chapter1-back-link" onClick={async () => {
            await updatePageProgress();
            navigate('/chapter1pg5');
          }}>Next →</button>
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: '0rem', display: 'flex', justifyContent: 'center' }}>
        <button className="chapter1-back-link" onClick={() => navigate('/chapter1-dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
} 