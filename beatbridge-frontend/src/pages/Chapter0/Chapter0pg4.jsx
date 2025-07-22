import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Chapter0pg4.css';

// Define multiple rhythm patterns
const rhythms = [
  // 1. pink pink pink pink
  [
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
  ],
  // 2. pink pink rest rest
  [
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
  ],
  // 3. pink rest pink rest
  [
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
  ],
  // 4. pink pink rest rest pink pink rest rest
  [
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
  ],
  // 5. pink rest rest pink pink rest rest pink
  [
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
  ],
  // 6. pink rest pink rest pink pink rest rest
  [
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
  ],
  // 7. rest pink pink rest rest pink rest pink
  [
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
  ],
  // 8. pink rest pink rest pink rest pink pink
  [
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
  ],
  // 9. pink rest pink rest pink pink rest rest pink rest pink rest pink pink rest rest (16 boxes, 16th note)
  [
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
  ],
  // 10. pink pink pink rest pink pink rest rest pink rest pink rest pink pink rest rest (16 boxes, 16th note)
  [
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'note', label: 'Note' },
    { type: 'note', label: 'Note' },
    { type: 'rest', label: 'Rest' },
    { type: 'rest', label: 'Rest' },
  ],
];

export default function Chapter0pg4() {
  const [rhythmIdx, setRhythmIdx] = useState(0);
  const pattern = rhythms[rhythmIdx];
  const [playhead, setPlayhead] = useState(0);
  const [userHits, setUserHits] = useState(Array(pattern.length).fill(false));
  const [feedback, setFeedback] = useState('');
  const audioRef = useRef(null);
  const interval = 1000; // ms per box (slightly slower)
  const totalBoxes = pattern.length;
  const [isPlaying, setIsPlaying] = useState(true);
  const [highlightStates, setHighlightStates] = useState(Array(pattern.length).fill(''));
  const [completed, setCompleted] = useState(false);

  // Reset state when rhythm changes
  useEffect(() => {
    setPlayhead(0);
    setUserHits(Array(pattern.length).fill(false));
    setHighlightStates(Array(pattern.length).fill(''));
    setFeedback('');
    setCompleted(false);
  }, [rhythmIdx]);

  // Playhead auto-advance
  useEffect(() => {
    if (!isPlaying) return;
    setFeedback('');
    setPlayhead(0);
    // Set faster interval for 8-box patterns (rhythm 4 and 5)
    let playInterval = interval;
    if (pattern.length === 8) {
      playInterval = interval / 2;
    } else if (pattern.length === 16) {
      playInterval = interval / 4; // 4x faster for 16th note (175ms if interval is 700ms)
    }
    const id = setInterval(() => {
      setPlayhead(p => (p + 1) % totalBoxes);
    }, playInterval);
    return () => clearInterval(id);
  }, [isPlaying, totalBoxes, rhythmIdx]);

  // Spacebar handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && isPlaying && !completed) {
        let newHighlights = Array(pattern.length).fill('');
        let newUserHits = [...userHits];
        if (pattern[playhead].type === 'note') {
          // Play snare
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }
          setFeedback('Good!');
          newHighlights[playhead] = 'green';
          newUserHits[playhead] = true;
        } else {
          setFeedback('Oops! That was a rest.');
          newHighlights[playhead] = 'red';
          // Reset all pink box hits if user hits a rest
          newUserHits = Array(pattern.length).fill(false);
        }
        setHighlightStates(newHighlights);
        setUserHits(newUserHits);
        setTimeout(() => {
          setHighlightStates(Array(pattern.length).fill(''));
        }, 350);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playhead, isPlaying, pattern, userHits, completed]);

  // Check for completion
  useEffect(() => {
    // Only check pink boxes
    const allHit = pattern.every((item, idx) => item.type !== 'note' || userHits[idx]);
    if (allHit && !completed) {
      setCompleted(true);
      if (rhythmIdx === rhythms.length - 1) {
        setFeedback('Great job! All Rhythms completed.');
      } else {
        setFeedback('Great job! Move on to the next rhythm.');
      }
    }
  }, [userHits, pattern, completed]);

  // Helper to determine feedback class
  function getFeedbackClass(feedback) {
    if (feedback === 'Good!') return 'chapter0-feedback good';
    if (feedback && feedback.startsWith('Great job!')) return 'chapter0-feedback rhythm-complete';
    if (feedback && feedback !== 'Good!') return 'chapter0-feedback bad';
    return 'chapter0-feedback';
  }

  // Box rendering
  const isSixteenBox = pattern.length === 16;
  const gridWidth = isSixteenBox ? (8 * 36 + 7 * 11) : (pattern.length * 36 + (pattern.length - 1) * 11);

  return (
    <div className="chapter0-container">
      <h1 className="chapter0-title">Practice: Notes & Rests</h1>
      <div className={"chapter0-practice-card" + (isSixteenBox ? " tall" : "")}>
        <div className="chapter0-description">
          Practise the rhythm below! Press <b>spacebar</b> when the yellow highlight is on a <b style={{color:'#ffb3b3'}}>pink</b> box (note/minim). Do not press for <b style={{color:'#bfc9d1'}}>grey</b> boxes (rests).<br/>
          <span style={{fontSize:'1.1rem', color:'#bfc9d1', display:'block', marginTop: '1.3rem', fontSize: '1rem'}}>Rhythm {rhythmIdx+1} of {rhythms.length}</span>
        </div>
        <audio ref={audioRef} src={process.env.PUBLIC_URL + '/sounds/Snare.mp3'} preload="auto" />
        {isSixteenBox ? (
          <div className="chapter0-practice-grid-16" style={{width: gridWidth}}>
            <div className="chapter0-practice-row">
              {pattern.slice(0, 8).map((item, i) => (
                <div key={i} className={`chapter0-practice-box${playhead === i ? ' active' : ''}${item.type === 'note' ? ' note' : ' rest'}${highlightStates[i] === 'green' ? ' highlight-green' : ''}${highlightStates[i] === 'red' ? ' highlight-red' : ''}${userHits[i] && item.type === 'note' ? ' completed' : ''}`}> 
                  {item.type === 'note' ? <span className="chapter0-practice-dot"></span> : <span className="chapter0-practice-rest">⏸</span>}
                </div>
              ))}
            </div>
            <div className="chapter0-practice-row">
              {pattern.slice(8, 16).map((item, i) => (
                <div key={i+8} className={`chapter0-practice-box${playhead === i+8 ? ' active' : ''}${item.type === 'note' ? ' note' : ' rest'}${highlightStates[i+8] === 'green' ? ' highlight-green' : ''}${highlightStates[i+8] === 'red' ? ' highlight-red' : ''}${userHits[i+8] && item.type === 'note' ? ' completed' : ''}`}> 
                  {item.type === 'note' ? <span className="chapter0-practice-dot"></span> : <span className="chapter0-practice-rest">⏸</span>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="chapter0-practice-grid" style={{width: gridWidth}}>
            {pattern.map((item, i) => (
              <div key={i} className={`chapter0-practice-box${playhead === i ? ' active' : ''}${item.type === 'note' ? ' note' : ' rest'}${highlightStates[i] === 'green' ? ' highlight-green' : ''}${highlightStates[i] === 'red' ? ' highlight-red' : ''}${userHits[i] && item.type === 'note' ? ' completed' : ''}`}> 
                {item.type === 'note' ? <span className="chapter0-practice-dot"></span> : <span className="chapter0-practice-rest">⏸</span>}
              </div>
            ))}
          </div>
        )}
        {completed && rhythmIdx < rhythms.length - 1 && (
          <button className="chapter0-nav-button" onClick={() => setRhythmIdx(rhythmIdx+1)}>→</button>
        )}
      </div>
      <div className={getFeedbackClass(feedback)}>{feedback}</div>
      <div className="chapter0-nav-container chapter0-practice-nav">
        <Link to="/chapter0pg3" className="chapter0-back-link">
          ← Back
        </Link>
        <Link to="/chapter0pg5" className="chapter0-back-link">
          Next →
        </Link>
      </div>
    </div>
  );
} 