/**
 * Drum Kit Guided Tour for Chapter 0 (Start Tour below drum kit)
 */
import React, { useRef, useState } from 'react';
import '../../styles/Chapter0.css';
import VirtualDrumKit from '../../styles/images/virtualDrumKit.jpg';
import { Link } from 'react-router-dom';

const DRUMS = [
  { name: 'Crash Cymbal', file: '/sounds/Crash.mp3', style: { top: '8.5%', left: '20%', width: '13%' }, description: 'The crash cymbal is medium to large cymbal designed to be struck hard, and it produces a loud, explosive accent, usually marking transitions between song sections or dramatic moments.' },
  { name: 'Ride Cymbal', file: '/sounds/Ride.mp3', style: { top: '9%', right: '8%', width: '13%' }, description: 'The ride cymbal is a large, heavy cymbal placed to the drummer’s right. It provides a steady rhythmic pattern, often used in jazz and rock.' },
  { name: 'Hi-Hat (Open)', file: '/sounds/Open Hihat.mp3', style: { top: '22%', left: '15%', width: '10%' }, description: 'Played with the cymbals partially or completely apart, the open hi-hat produces a bright, shimmering sound with a sizzle and a long, sustaining decay. Drummers use it for dynamic accents and to create a sense of motion in rhythmic patterns..' },
  { name: 'Hi-Hat (Closed)', file: '/sounds/Hi-Hat.mp3', style: { top: '22%', left: '28%', width: '10%' }, description: 'When the hi-hat pedal is pressed, bringing the cymbals tightly together, the closed hi-hat delivers a sharp, concise “chick” sound with little sustain. This crisp sound is crucial for timekeeping, especially in genres such as rock or pop.' },
  { name: 'High Tom', file: '/sounds/High Tom.mp3', style: { top: '21%', left: '40%', width: '12%' }, description: 'As the smallest tom, the high tom generates a resonant, higher-pitched tone. Its lighter sound makes it perfect for adding depth above the main groove.' },
  { name: 'Low Tom', file: '/sounds/Low Tom.mp3', style: { top: '21%', right: '33%', width: '12%' }, description: 'The low tom sits between the high tom and the floor tom in both size and pitch. It creates a full, warm tone that blends well in rhythmic transitions, smoothly connecting higher and deeper drums within the kit.' },
  { name: 'Floor Tom', file: '/sounds/Floor Tom.mp3', style: { top: '40%', right: '20%', width: '16%' }, description: 'The largest tom on the set, the floor tom offers a powerful, deep, and booming resonance. It’s often used for dramatic fills, big accents, and adding weight to song climaxes, carrying impact across many musical genres.' },
  { name: 'Snare Drum', file: '/sounds/Snare.mp3', style: { top: '38%', left: '28%', width: '13%' }, description: 'The snare drum is characterized by its shallow cylindrical shape and distinctive "snap" sound. It sits between the drummer’s knees and provides sharp accents, backbeat, and rhythmic fills' },
  { name: 'Bass Drum', file: '/sounds/Kick.mp3', style: { top: '50%', left: '50%', transform: 'translateX(-50%)', width: '22%' }, description: 'The bass drum, also known as the kick drum, is positioned on the floor and played with a foot pedal. It produces a deep, low-frequency thump that forms the rhythmic foundation of most music.' },
];

export default function Chapter0pg1() {
  const audioRefs = useRef([]);
  const [tourStep, setTourStep] = useState(null); // null = not started, 0+ = current drum
  const [activeDrumIdx, setActiveDrumIdx] = useState(null);
  const drumKitRef = useRef(null);
  // Track if the user has finished the tour
  const [tourFinished, setTourFinished] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);

  // When tourStep changes to null after the last drum, set tourFinished
  React.useEffect(() => {
    if (tourStep !== null) setTourStarted(true);
    if (tourStarted && tourStep === null && activeDrumIdx === null) {
      setTourFinished(true);
    }
  }, [tourStep, activeDrumIdx, tourStarted]);

  const playDrum = idx => {
    const audio = audioRefs.current[idx];
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
    setActiveDrumIdx(idx);
    setTimeout(() => setActiveDrumIdx(null), 150);
  };

  // Helper to get drum part's pixel position relative to drum kit image
  const getDrumPosition = (drum) => {
    const kit = drumKitRef.current;
    if (!kit) return { x: 0, y: 0 };
    const rect = kit.getBoundingClientRect();
    // Parse percent values
    const top = parseFloat(drum.style.top) / 100;
    let left = drum.style.left ? parseFloat(drum.style.left) / 100 : null;
    let right = drum.style.right ? parseFloat(drum.style.right) / 100 : null;
    const width = drum.style.width ? parseFloat(drum.style.width) / 100 : 0.1;
    // X: left or right based
    let x;
    if (left !== null) x = rect.left + rect.width * left + rect.width * width / 2;
    else if (right !== null) x = rect.right - rect.width * right - rect.width * width / 2;
    else x = rect.left + rect.width / 2;
    // Y: top
    const y = rect.top + rect.height * top + rect.height * width / 2;
    return { x, y };
  };

  // Overlay and tour logic
  let overlay = null;
  let tourBox = null;
  // Arrow removed
  if (tourStep !== null) {
    // Get drum position
    const drum = DRUMS[tourStep];
    const kit = drumKitRef.current;
    let drumPos = { x: 0, y: 0 };
    let boxPos = { x: 0, y: 0 };
    let boxSide = 'right';
    let boxWidth = 380;
    let boxHeight = 200;
    let kitRect = { left: 0, top: 0, right: 0, width: 0, height: 0 };
    if (kit) {
      const rect = kit.getBoundingClientRect();
      // Get bounding rect relative to page
      const pageRect = kit.getBoundingClientRect();
      kitRect = {
        left: kit.offsetLeft,
        top: kit.offsetTop,
        right: kit.offsetLeft + kit.offsetWidth,
        width: kit.offsetWidth,
        height: kit.offsetHeight,
      };
      // Calculate drum position relative to kit container
      const top = parseFloat(drum.style.top) / 100;
      let left = drum.style.left ? parseFloat(drum.style.left) / 100 : null;
      let right = drum.style.right ? parseFloat(drum.style.right) / 100 : null;
      const width = drum.style.width ? parseFloat(drum.style.width) / 100 : 0.1;
      let x;
      if (left !== null) x = kitRect.width * left + kitRect.width * width / 2;
      else if (right !== null) x = kitRect.width - kitRect.width * right - kitRect.width * width / 2;
      else x = kitRect.width / 2;
      const y = kitRect.height * top + kitRect.height * width / 2;
      drumPos = { x, y };
      // Decide left or right
      // Force High Tom (index 4) to be on the left
      if (tourStep === 4) {
        boxSide = 'left';
      } else if (drum.style.left && parseFloat(drum.style.left) < 30) boxSide = 'left';
      else if (drum.style.right && parseFloat(drum.style.right) < 30) boxSide = 'right';
      else if (drum.style.left && parseFloat(drum.style.left) > 50) boxSide = 'right';
      else boxSide = 'right';
      // Vertically center box to drum, clamp to kit container and below header (relative to page)
      let headerHeight = 80; // Adjust if your header is taller
      // Calculate the minimum y relative to the kit container so the box never overlaps the header
      const kitTopOnPage = pageRect.top + window.scrollY;
      let yBox = drumPos.y - boxHeight / 2;
      const minY = Math.max(0, headerHeight - kitTopOnPage);
      yBox = Math.max(minY, Math.min(yBox, kitRect.height - boxHeight));
      boxPos.y = yBox;
      if (boxSide === 'left') boxPos.x = -boxWidth - 63; // 48px margin
      else boxPos.x = kitRect.width + 24;
      // Arrow removed
    }
    // Overlay 
    overlay = <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1200, borderRadius: 10 }} />;
    // Tour box 
    tourBox = (
      <div
        key={tourStep}
        className="chapter0-tourbox-fadein"
        style={{
          position: 'absolute',
          left: boxPos.x,
          top: boxPos.y,
          zIndex: 2200,
          background: '#2d3350', 
          borderRadius: 12,
          padding: '2.5rem 1.5rem',
          color: '#fff',
          boxShadow: '0 3px 40px 0 #000b, 0 0 0 4pxrgb(251, 156, 156)', // stronger shadow and accent border
          minWidth: boxWidth,
          maxWidth: boxWidth,
          textAlign: 'center',
          transition: 'box-shadow 0.2s',
        }}
      >
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.7rem', color: '#ffb3b3' }}>{drum.name}</h2>
        <p style={{ fontSize: '1.05rem', marginBottom: '1.2rem' }}>{drum.description}</p>
        <button
          className="chapter0-play-btn"
          style={{ background: '#ffb3b3', color: '#232946', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: '0.5rem' }}
          onClick={() => playDrum(tourStep)}
        >
          ▶ Play Sound
        </button>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
          <button
            className="chapter0-play-btn"
            style={{ background: '#eee', color: '#232946', border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
            onClick={() => {
              if (tourStep === 0) setTourStep(null);
              else setTourStep(tourStep - 1);
            }}
          >
            Back
          </button>
          <button
            className="chapter0-play-btn"
            style={{ background: '#ffb3b3', color: '#232946', border: 'none', borderRadius: 8, padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
            onClick={() => setTourStep(tourStep < DRUMS.length - 1 ? tourStep + 1 : null)}
          >
            {tourStep < DRUMS.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    );
  }

  // Marker for the current drum in the tour
  const DrumMarker = ({ drum, isActive }) => {
    // Position marker using drum.style (top/left/right/width)
    const markerSize = 34;
    const style = {
      position: 'absolute',
      zIndex: 2500,
      width: markerSize,
      height: markerSize,
      borderRadius: '50%',
      background: isActive ? '#4be04b' : '#3cb371',
      border: '3px solid #fff',
      boxShadow: isActive ? '0 0 16px 6px #4be04b88' : '0 2px 8px 0 #0006',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: 20,
      transition: 'background 0.2s, box-shadow 0.2s',
      pointerEvents: 'none',
      // Positioning
      top: drum.style.top,
      left: drum.style.left || undefined,
      right: drum.style.right || undefined,
      transform: 'translate(-50%, -50%)',
    };
    // Use 'HO' for Hi-Hat (Open), 'HC' for Hi-Hat (Closed), else first letter
    let label = drum.name[0];
    if (drum.name === 'Hi-Hat (Open)') label = 'HO';
    else if (drum.name === 'Hi-Hat (Closed)') label = 'HC';
    return <div style={style}>{label}</div>;
  };

  return (
    <div className="chapter0-container">
      {/* Overlay for the whole website, rendered at the top level when tour is active */}
      {tourStep !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.45)', zIndex: 2000 }} />
      )}
      <h1 className="chapter0-title">Introduction to the Drum Kit</h1>
      <div className="chapter0-description">
        <p>
          The drum kit is a collection of drums and cymbals played by a single drummer. Each part of the kit has its own unique sound and role in music.
        </p>
        <p>
          Feel free to take a guided tour below to learn about each part!
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div className="chapter0-drum-kit-container" style={{ position: 'relative' }}>
          <img ref={drumKitRef} src={VirtualDrumKit} alt="Virtual Drum Kit" className="chapter0-drum-kit-image" />
          {/* Marker for current drum in tour */}
          {tourStep !== null && (
            <DrumMarker drum={DRUMS[tourStep]} isActive={activeDrumIdx === tourStep} />
          )}
          {/* overlay is now rendered at the top level, so remove it here */}
          {tourBox}
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2.5rem' }}>
          {tourStep === null && (
            <button
              className="chapter0-play-btn"
              style={{ background: '#ffb3b3', color: '#232946', border: 'none', borderRadius: 8, padding: '0.8rem 1.5rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', margin: '0 auto', display: 'block' }}
              onClick={() => setTourStep(0)}
            >
              Start Tour
            </button>
          )}
        </div>
      </div>
      {tourFinished && (
          <div className="chapter0-fadein-message" style={{ marginTop: '2.5rem', marginBottom: '-2rem', textAlign: 'center', fontSize: '1.18rem', color: '#fff', background: '#2d3350', borderRadius: 12, padding: '1.5rem 2rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 2px 16px #0004' }}>
            Now that you learn all the parts of the drums, it's time to learn some of the basics of drum notations!
          </div>
        )}
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link to="/rhythm-trainer-chapters" className="chapter0-back-link">
            ← Back
          </Link>
          
          <Link to="/chapter0pg2" className="chapter0-back-link">
            Next →
          </Link>
          
        </div>
      </div>
      {/* Audio elements for each drum */}
      {DRUMS.map((drum, idx) => (
        <audio
          key={drum.name}
          ref={el => audioRefs.current[idx] = el}
          src={drum.file}
          preload="auto"
        />
      ))}
    </div>
  );
} 