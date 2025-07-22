import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Chapter0pg1-3.css';

const restDescriptions = [
  {
    title: 'Introduction to Rests!',
    desc: [
      "Rests are symbols that indicate silence in music. Each rest tells you how long to pause or not play. Let's explore the different types of rests you'll see in drum music!",
    ]
  },
  {
    title: 'Whole Rest (Semibreve Rest)',
    desc: [
      "Shown as a filled-in rectangle hanging below the second line from the top of the staff.",
      "Represents a full measure of silence, or four beats in common time.",
      "Longest common rest used in standard notation."
    ]
  },
  {
    title: 'Half Rest (Minim Rest)',
    desc: [
      "Filled-in rectangle sitting on top of the middle line of the staff.",
      "Indicates two beats of silence in common time.",
      "Half as long as a whole rest."
    ]
  },
  {
    title: 'Quarter Rest (Crotchet Rest)',
    desc: [
      "Squiggly vertical line resembling a stylized 'Z' with a 'C' or the number '3'.",
      "Stands for one beat of silence.",
      "Most frequently used rest in a wide range of rhythms."
    ]
  },
  {
    title: 'Eighth Rest (Quaver Rest)',
    desc: [
      "Drawn as a slash with a single flag or hook curling to the right at the top.",
      "Represents half a beat of silence.",
      "Commonly used for faster, subdivided passages."
    ]
  },
  {
    title: 'Sixteenth Rest (Semiquaver Rest)',
    desc: [
      "Similar to the eighth rest but with two flags or hooks.",
      "Lasts for a quarter of a beat of silence.",
      "Appears in rapid or intricate rhythmic sections."
    ]
  },
];

const restImages = [
  null,
  require('../../styles/images/Chapter0/semibreve-rest.png'),
  require('../../styles/images/Chapter0/minim-rest.png'),
  require('../../styles/images/Chapter0/crotchet-rest.png'),
  require('../../styles/images/Chapter0/quaver-rest.png'),
  require('../../styles/images/Chapter0/semiquaver-rest.png'),
];

const restTable = [
  {
    american: 'Whole rest',
    british: 'Semibreve rest',
    type: 'whole',
    value: '4 beats',
  },
  {
    american: 'Half rest',
    british: 'Minim rest',
    type: 'half',
    value: '2 beats',
  },
  {
    american: 'Quarter rest',
    british: 'Crotchet rest',
    type: 'quarter',
    value: '1 beat',
  },
  {
    american: 'Eighth rest',
    british: 'Quaver rest',
    type: 'eighth',
    value: '1/2 of a beat',
  },
  {
    american: 'Sixteenth rest',
    british: 'Semiquaver rest',
    type: 'sixteenth',
    value: '1/4 of a beat',
  },
];

function RestDemoGrid({ type }) {
  // Map rest type to duration in beats (out of 4)
  const boxCounts = {
    whole: 4,
    half: 4,
    quarter: 4,
    eighth: 8,
    sixteenth: 16,
  };
  const intervalMap = {
    whole: 700,
    half: 700,
    quarter: 700,
    eighth: 350,
    sixteenth: 175,
  };
  const boxes = boxCounts[type] || 4;
  const interval = intervalMap[type] || 700;
  const [playhead, setPlayhead] = React.useState(0);
  const audioRef = React.useRef(null);
  React.useEffect(() => {
    setPlayhead(0);
    const id = setInterval(() => {
      setPlayhead(p => {
        const next = (p + 1) % boxes;
        // Play snare sound for pink boxes
        if (
          (type === 'half' && (next === 2 || next === 3)) ||
          (type === 'quarter' && (next >= 1 && next <= 3)) ||
          (type === 'eighth' && (next >= 1 && next <= 7)) ||
          (type === 'sixteenth' && (next >= 1 && next <= 15))
        ) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }
        }
        return next;
      });
    }, interval);
    return () => clearInterval(id);
  }, [type, boxes, interval]);
  let gridWidth = 0;
  if (type === 'sixteenth') gridWidth = 8 * 36 + 7 * 11;
  else if (type === 'eighth') gridWidth = 8 * 36 + 7 * 11;
  else gridWidth = 4 * 36 + 3 * 11;

  // Helper to determine box color and content
  function getBoxStyle(i) {
    // Whole rest: all gray rest
    if (type === 'whole') {
      return { background: '#bfc9d1', content: <span style={{ fontSize: 18, fontWeight: 900 }}>⏸</span> };
    }
    // Half rest: 1st and 2nd box rest, 3rd and 4th pink (snare)
    if (type === 'half') {
      if (i === 0 || i === 1) return { background: '#bfc9d1', content: <span style={{ fontSize: 18, fontWeight: 900 }}>⏸</span> };
      if (i === 2 || i === 3) return { background: '#ffb3c6', content: <span style={{ width: 12, height: 12, display: 'inline-block', borderRadius: '50%', background: '#232946', margin: 'auto' }}></span> };
      return { background: '#232946', content: '' };
    }
    // Quarter rest: 1st box rest, 2nd-4th pink (snare)
    if (type === 'quarter') {
      if (i === 0) return { background: '#bfc9d1', content: <span style={{ fontSize: 18, fontWeight: 900 }}>⏸</span> };
      if (i >= 1 && i <= 3) return { background: '#ffb3c6', content: <span style={{ width: 12, height: 12, display: 'inline-block', borderRadius: '50%', background: '#232946', margin: 'auto' }}></span> };
      return { background: '#232946', content: '' };
    }
    // Eighth rest: 1st box rest, 2-8 pink (snare)
    if (type === 'eighth') {
      if (i === 0) return { background: '#bfc9d1', content: <span style={{ fontSize: 18, fontWeight: 900 }}>⏸</span> };
      if (i >= 1 && i <= 7) return { background: '#ffb3c6', content: <span style={{ width: 12, height: 12, display: 'inline-block', borderRadius: '50%', background: '#232946', margin: 'auto' }}></span> };
      return { background: '#232946', content: '' };
    }
    // Sixteenth rest: 1st box rest, 2-16 pink (snare)
    if (type === 'sixteenth') {
      if (i === 0) return { background: '#bfc9d1', content: <span style={{ fontSize: 18, fontWeight: 900 }}>⏸</span> };
      if (i >= 1 && i <= 15) return { background: '#ffb3c6', content: <span style={{ width: 12, height: 12, display: 'inline-block', borderRadius: '50%', background: '#232946', margin: 'auto' }}></span> };
      return { background: '#232946', content: '' };
    }
    return { background: '#232946', content: '' };
  }

  // Render grid
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <audio ref={audioRef} src={process.env.PUBLIC_URL + '/sounds/Snare.mp3'} preload="auto" />
      {type === 'sixteenth' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', margin: '0.3rem 0 0.5rem 0', justifyContent: 'center', alignItems: 'center', width: gridWidth }}>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', alignItems: 'center', width: gridWidth }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const { background, content } = getBoxStyle(i);
              return (
                <div key={i} style={{
                  width: 36,
                  height: 36,
                  lineHeight: '36px',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  background,
                  border: playhead === i ? '3px solid #ffe066' : '2px solid #888',
                  boxShadow: playhead === i ? '0 0 12px 2px #ffe06688' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  color: background === '#bfc9d1' ? '#232946' : '#fff',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}>
                  {content}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', alignItems: 'center', width: gridWidth }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const idx = i + 8;
              const { background, content } = getBoxStyle(idx);
              return (
                <div key={idx} style={{
                  width: 36,
                  height: 36,
                  lineHeight: '36px',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  background,
                  border: playhead === idx ? '3px solid #ffe066' : '2px solid #888',
                  boxShadow: playhead === idx ? '0 0 12px 2px #ffe06688' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  color: background === '#bfc9d1' ? '#232946' : '#fff',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ) : type === 'eighth' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', margin: '0.3rem 0 0.5rem 0', justifyContent: 'center', alignItems: 'center', width: gridWidth }}>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', alignItems: 'center', width: gridWidth }}>
            {Array.from({ length: 4 }).map((_, i) => {
              const { background, content } = getBoxStyle(i);
              return (
                <div key={i} style={{
                  width: 36,
                  height: 36,
                  lineHeight: '36px',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  background,
                  border: playhead === i ? '3px solid #ffe066' : '2px solid #888',
                  boxShadow: playhead === i ? '0 0 12px 2px #ffe06688' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  color: background === '#bfc9d1' ? '#232946' : '#fff',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}>
                  {content}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', alignItems: 'center', width: gridWidth }}>
            {Array.from({ length: 4 }).map((_, i) => {
              const idx = i + 4;
              const { background, content } = getBoxStyle(idx);
              return (
                <div key={idx} style={{
                  width: 36,
                  height: 36,
                  lineHeight: '36px',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  background,
                  border: playhead === idx ? '3px solid #ffe066' : '2px solid #888',
                  boxShadow: playhead === idx ? '0 0 12px 2px #ffe06688' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  color: background === '#bfc9d1' ? '#232946' : '#fff',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.7rem', margin: '0.3rem 0 0.5rem 0', justifyContent: 'center', alignItems: 'center', width: gridWidth }}>
          {Array.from({ length: boxes }).map((_, i) => {
            const { background, content } = getBoxStyle(i);
            return (
              <div key={i} style={{
                width: 36,
                height: 36,
                lineHeight: '36px',
                boxSizing: 'border-box',
                borderRadius: 8,
                background,
                border: playhead === i ? '3px solid #ffe066' : '2px solid #888',
                boxShadow: playhead === i ? '0 0 12px 2px #ffe06688' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
                color: background === '#bfc9d1' ? '#232946' : '#fff',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Chapter0pg3() {
  const [restCardIdx, setRestCardIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');
  const handleNext = () => {
    setSlideDirection('slide-left');
    setTimeout(() => {
      setRestCardIdx(idx => Math.min(restDescriptions.length - 1, idx + 1));
      setSlideDirection('');
    }, 300);
  };
  const handlePrev = () => {
    setSlideDirection('slide-right');
    setTimeout(() => {
      setRestCardIdx(idx => Math.max(0, idx - 1));
      setSlideDirection('');
    }, 300);
  };

  return (
    <div className="chapter0-container">
      <h1 className="chapter0-title" style={{ marginBottom: '1.2rem' }}>Introduction to Drum Rests</h1>
      <div className="chapter0-description" style={{ marginTop: 0 }}>
        Drum rests are symbols that indicate when to be silent in music. Understanding these symbols is essential for reading and playing drum music!
      </div>
      {/* Rest Card Carousel */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0 2.5rem 0' }}>
        <div className={`chapter0-note-carousel-card${slideDirection ? ' ' + slideDirection : ''}`} style={{ background: '#232946', borderRadius: 16, boxShadow: '0 2px 16px #0004', padding: '2.2rem 2.5rem', minWidth: 400, maxWidth: 520, color: '#fff', textAlign: 'center', position: 'relative', transition: 'transform 0.3s, opacity 0.3s' }}>
          <div style={{ display: 'flex', flexDirection: restCardIdx === 0 ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: restCardIdx === 0 ? 0 : '1.5rem', marginBottom: '1.5rem', textAlign: restCardIdx === 0 ? 'center' : 'left' }}>
            <div style={{ flex: 1, textAlign: restCardIdx === 0 ? 'center' : 'left' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#ffb3b3', marginBottom: '1.1rem' }}>{restDescriptions[restCardIdx].title}</h3>
              {restCardIdx === 0 ? (
                <div style={{ fontSize: '1.08rem', color: '#fff', margin: 0, textAlign: 'center', whiteSpace: 'pre-line' }}>
                  {restDescriptions[0].desc.join('\n\n')}
                </div>
              ) : (
                <ul style={{ fontSize: '1.08rem', color: '#fff', margin: 0, paddingLeft: '1.2rem', textAlign: 'left', listStyle: 'disc' }}>
                  {restDescriptions[restCardIdx].desc.map((point, i) => (
                    <li key={i} style={{ marginBottom: '0.6rem' }}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
            {restImages[restCardIdx] && (
              <img 
                src={restImages[restCardIdx]} 
                alt={restDescriptions[restCardIdx].title} 
                style={{ width: restCardIdx === 1 ? 44 : 56, height: restCardIdx === 1 ? 44 : 56, objectFit: 'contain', display: 'block' }} 
              />
            )}
          </div>
          {restCardIdx >= 1 && restCardIdx <= 5 && <RestDemoGrid type={['whole','half','quarter','eighth','sixteenth'][restCardIdx-1]} />}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', marginTop: '2.2rem' }}>
            <div style={{ width: 48, display: 'flex', justifyContent: 'center' }}>
              {restCardIdx > 0 && (
                <button
                  className="chapter0-nav-button"
                  onClick={handlePrev}
                >
                  ←
                </button>
              )}
            </div>
            <span style={{ fontSize: '1rem', color: '#eebebe', minWidth: 48, textAlign: 'center' }}>{restCardIdx + 1} / {restDescriptions.length}</span>
            <div style={{ width: 48, display: 'flex', justifyContent: 'center' }}>
              {restCardIdx < restDescriptions.length - 1 && (
                <button
                  className="chapter0-nav-button"
                  onClick={handleNext}
                >
                  →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Tree of Rests Table */}
      <div className="chapter0-cards-container" style={{ maxWidth: 820 }}>
        <div className={`chapter0-card chapter0-card-rests visible`} style={{ background: '#232946' }}>
          <h2 className="chapter0-card-title">Tree of Rests</h2>
          <table className="chapter0-table" style={{ maxWidth: 760 }}>
            <thead className="chapter0-table-header">
              <tr>
                <th>American / German rest names</th>
                <th>British rest names</th>
                <th className="center">Rest symbol</th>
                <th>Rest value</th>
              </tr>
            </thead>
            <tbody>
              {restTable.map((row, idx) => (
                <tr key={row.type} className="chapter0-table-row">
                  <td className="chapter0-table-cell">{row.american}</td>
                  <td className="chapter0-table-cell bold">{row.british}</td>
                  <td className="chapter0-table-cell center"><img src={restImages[idx+1]} alt={row.american} style={{ width: row.type === 'whole' ? 28 : 32, height: row.type === 'whole' ? 28 : 32, objectFit: 'contain', display: 'inline-block' }} /></td>
                  <td className="chapter0-table-cell">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Navigation */}
      <div style={{ textAlign: 'center', marginTop: '-3rem', display: 'flex', justifyContent: 'center', gap: '2.5rem' }}>
        <Link to="/chapter0pg2" className="chapter0-back-link">
          ← Back
        </Link>
        <Link to="/Chapter0/Chapter0pg4" className="chapter0-back-link">
          Next →
        </Link>
      </div>
    </div>
  );
} 