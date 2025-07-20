import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Chapter0.css';

const notes = [
  { name: 'Whole Note', type: 'whole' },
  { name: 'Half Note', type: 'half' },
  { name: 'Quarter Note', type: 'quarter' },
  { name: '8th Note', type: 'eighth' },
  { name: '16th Note', type: 'sixteenth' },
  { name: '32nd Note', type: 'thirtysecond' },
];

const noteTable = [
  {
    american: 'Whole note',
    british: 'Semibreve',
    type: 'whole',
    value: '4 beats',
  },
  {
    american: 'Half note',
    british: 'Minim',
    type: 'half',
    value: '2 beats',
  },
  {
    american: 'Quarter note',
    british: 'Crotchet',
    type: 'quarter',
    value: '1 beat',
  },
  {
    american: 'Eighth note',
    british: 'Quaver',
    type: 'eighth',
    value: '1/2 of a beat',
  },
  {
    american: 'Sixteenth note',
    british: 'Semiquaver',
    type: 'sixteenth',
    value: '1/4 of a beat',
  },
];

const noteDescriptions = [
  {
    title: 'Introduction to Music Notes!',
    desc: [
      "Musical notes are symbols that represent the duration and pitch of a sound. In drum notation, notes tell you when and how long to play a drum or cymbal. Let's explore the different types of notes you'll see in drum music!",
    ]
  },
  {
    title: 'Whole Note (Semibreve)',
    desc: [
      "Represented by a hollow oval note head without a stem.",
      "Longest common note value in standard music notation.",
      "Lasts for four beats in common time.",
      "Indicates a sound should be held steadily for an entire measure."
    ]
  },
  {
    title: 'Half Note (Minim)',
    desc: [
      "Shown as a hollow oval note head with a straight stem.",
      "Lasts for two beats in common time (half the length of a whole note).",
      "Maintains longer tones while allowing more rhythmic movement."
    ]
  },
  {
    title: 'Quarter Note (Crotchet)',
    desc: [
      "Filled-in oval note head with a straight stem.",
      "Lasts for one beat in common time.",
      "Standard pulse in most musical rhythms; fundamental for counting beats."
    ]
  },
  {
    title: 'Eighth Note (Quaver)',
    desc: [
      "Filled-in oval note head with a stem and a single flag.",
      "Lasts for half a beat in common time.",
      "Often appears in pairs or groups, adding speed and lively motion."
    ]
  },
  {
    title: 'Sixteenth Note (Semiquaver)',
    desc: [
      "Filled-in oval note head, a stem, and two flags.",
      "Lasts for a quarter of a beat in common time.",
      "Used in very fast rhythmic sections for intricate musical patterns."
    ]
  },
];

const noteImages = [
  null,
  require('../../styles/images/Chapter0/semibreve.png'),
  require('../../styles/images/Chapter0/minim.png'),
  require('../../styles/images/Chapter0/crotchet.png'),
  require('../../styles/images/Chapter0/quaver.png'),
  require('../../styles/images/Chapter0/semiquaver.png'),
];

function WholeNoteDemoGrid() {
  const [playhead, setPlayhead] = React.useState(0);
  const audioRef = React.useRef(null);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlayhead(p => {
        const next = (p + 1) % 4;
        if (next === 0 && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        return next;
      });
    }, 500);
    // Play sound immediately on mount
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <audio ref={audioRef} src={process.env.PUBLIC_URL + '/sounds/Snare.mp3'} preload="auto" />
      <div style={{ display: 'flex', gap: '1.2rem', margin: '1.5rem 0 0.5rem 0', justifyContent: 'center' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: i === 0 ? '#ffb3b3' : '#232946',
            border: playhead === i ? '3px solid #ffe066' : '2px solid #888',
            boxShadow: playhead === i ? '0 0 12px 2px #ffe06688' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: i === 0 ? '#232946' : '#fff',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}>
            {i === 0 ? '●' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteDemoGrid({ type }) {
  // Map note type to duration in beats (out of 4)
  const noteBeats = {
    whole: 4,
    half: 2,
    quarter: 1,
    eighth: 1, // 1 box filled, but 8 boxes total
    sixteenth: 1, // 1 box filled, but 16 boxes total
  };
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
  const beats = noteBeats[type] || 0;
  const boxes = boxCounts[type] || 4;
  const interval = intervalMap[type] || 500;
  const [playhead, setPlayhead] = React.useState(0);
  const audioRef = React.useRef(null);
  React.useEffect(() => {
    setPlayhead(0);
    const id = setInterval(() => {
      setPlayhead(p => {
        const next = (p + 1) % boxes;
        // Play sound at the correct boxes for each note type
        if (
          (type === 'whole' && next === 0) ||
          (type === 'half' && (next === 0 || next === 2)) ||
          (type === 'quarter' && (next === 0 || next === 1 || next === 2 || next === 3)) ||
          (type === 'eighth' && next < 8) ||
          (type === 'sixteenth')
        ) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }
        }
        return next;
      });
    }, interval);
    // Play sound immediately on mount for whole, half, quarter, eighth, sixteenth
    if (
      (type === 'whole') ||
      (type === 'half') ||
      (type === 'quarter') ||
      (type === 'eighth') ||
      (type === 'sixteenth')
    ) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
    return () => clearInterval(id);
  }, [type, boxes, interval]);
  // For each box, fill if within the note's duration (always just the first box for these demos)
  let gridWidth = 0;
  if (type === 'sixteenth') gridWidth = 8 * 36 + 7 * 11; // 8 boxes per row, 7 gaps, 2 rows
  else if (type === 'eighth') gridWidth = 8 * 36 + 7 * 11;
  else gridWidth = 4 * 36 + 3 * 11;
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <audio ref={audioRef} src={process.env.PUBLIC_URL + '/sounds/Snare.mp3'} preload="auto" />
      {type === 'sixteenth' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', margin: '1.5rem 0 0.5rem 0', justifyContent: 'center', alignItems: 'center', width: gridWidth }}>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', width: gridWidth }}>
            {Array.from({ length: 8 }).map((_, i) => {
              let fill = false;
              if (type === 'whole' && i === 0) fill = true;
              else if (type === 'half' && (i === 0 || i === 2)) fill = true;
              else if (type === 'quarter' && (i === 0 || i === 1 || i === 2 || i === 3)) fill = true;
              else if (type === 'eighth') fill = true;
              else if (type === 'sixteenth') fill = true;
              return (
                <div key={i} style={{
                  width: 36,
                  height: 36,
                  lineHeight: '36px',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  background: fill ? '#ffb3b3' : '#232946',
                  border: playhead === i ? '3px solid #ffe066' : '2px solid #888',
                  boxShadow: playhead === i ? '0 0 12px 2px #ffe06688' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  color: fill ? '#232946' : '#fff',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}>
                  {fill ? <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#232946', display: 'inline-block' }}></span> : ''}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', width: gridWidth }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const idx = i + 8;
              let fill = false;
              if (type === 'whole' && idx === 0) fill = true;
              else if (type === 'half' && (idx === 0 || idx === 2)) fill = true;
              else if (type === 'quarter' && (idx === 0 || idx === 1 || idx === 2 || idx === 3)) fill = true;
              else if (type === 'eighth') fill = true;
              else if (type === 'sixteenth') fill = true;
              return (
                <div key={idx} style={{
                  width: 36,
                  height: 36,
                  lineHeight: '36px',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  background: fill ? '#ffb3b3' : '#232946',
                  border: playhead === idx ? '3px solid #ffe066' : '2px solid #888',
                  boxShadow: playhead === idx ? '0 0 12px 2px #ffe06688' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  color: fill ? '#232946' : '#fff',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}>
                  {fill ? <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#232946', display: 'inline-block' }}></span> : ''}
                </div>
              );
            })}
          </div>
        </div>
      ) : type === 'eighth' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', margin: '1.5rem 0 0.5rem 0', justifyContent: 'center', alignItems: 'center', width: gridWidth }}>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', width: gridWidth }}>
            {Array.from({ length: 4 }).map((_, i) => {
              let fill = false;
              if (type === 'whole' && i === 0) fill = true;
              else if (type === 'half' && (i === 0 || i === 2)) fill = true;
              else if (type === 'quarter' && (i === 0 || i === 1 || i === 2 || i === 3)) fill = true;
              else if (type === 'eighth') fill = true;
              else if (type === 'sixteenth') fill = true;
              return (
                <div key={i} style={{
                  width: 36,
                  height: 36,
                  lineHeight: '36px',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  background: fill ? '#ffb3b3' : '#232946',
                  border: playhead === i ? '3px solid #ffe066' : '2px solid #888',
                  boxShadow: playhead === i ? '0 0 12px 2px #ffe06688' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  color: fill ? '#232946' : '#fff',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}>
                  {fill ? <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#232946', display: 'inline-block' }}></span> : ''}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', width: gridWidth }}>
            {Array.from({ length: 4 }).map((_, i) => {
              const idx = i + 4;
              let fill = false;
              if (type === 'whole' && idx === 0) fill = true;
              else if (type === 'half' && (idx === 0 || idx === 2)) fill = true;
              else if (type === 'quarter' && (idx === 0 || idx === 1 || idx === 2 || idx === 3)) fill = true;
              else if (type === 'eighth') fill = true;
              else if (type === 'sixteenth') fill = true;
              return (
                <div key={idx} style={{
                  width: 36,
                  height: 36,
                  lineHeight: '36px',
                  boxSizing: 'border-box',
                  borderRadius: 8,
                  background: fill ? '#ffb3b3' : '#232946',
                  border: playhead === idx ? '3px solid #ffe066' : '2px solid #888',
                  boxShadow: playhead === idx ? '0 0 12px 2px #ffe06688' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  color: fill ? '#232946' : '#fff',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}>
                  {fill ? <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#232946', display: 'inline-block' }}></span> : ''}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.7rem', margin: '1.5rem 0 0.5rem 0', justifyContent: 'center', width: gridWidth }}>
          {Array.from({ length: boxes }).map((_, i) => {
            let fill = false;
            if (type === 'whole' && i === 0) fill = true;
            else if (type === 'half' && (i === 0 || i === 2)) fill = true;
            else if (type === 'quarter' && (i === 0 || i === 1 || i === 2 || i === 3)) fill = true;
            else if (type === 'eighth') fill = true;
            else if (type === 'sixteenth') fill = true;
            return (
              <div key={i} style={{
                width: 36,
                height: 36,
                lineHeight: '36px',
                boxSizing: 'border-box',
                borderRadius: 8,
                background: fill ? '#ffb3b3' : '#232946',
                border: playhead === i ? '3px solid #ffe066' : '2px solid #888',
                boxShadow: playhead === i ? '0 0 12px 2px #ffe06688' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
                color: fill ? '#232946' : '#fff',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}>
                {fill ? <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#232946', display: 'inline-block' }}></span> : ''}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Chapter0pg2() {
  const [noteCardIdx, setNoteCardIdx] = useState(0);
  // Add sliding animation for the notes card carousel
  const [slideDirection, setSlideDirection] = useState('');
  const handleNext = () => {
    setSlideDirection('slide-left');
    setTimeout(() => {
      setNoteCardIdx(idx => Math.min(noteDescriptions.length - 1, idx + 1));
      setSlideDirection('');
    }, 300);
  };
  const handlePrev = () => {
    setSlideDirection('slide-right');
    setTimeout(() => {
      setNoteCardIdx(idx => Math.max(0, idx - 1));
      setSlideDirection('');
    }, 300);
  };

  // Scroll to the active table when switching
  const notesRef = React.useRef(null);
  React.useEffect(() => {
    if (notesRef.current) {
      notesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [noteCardIdx]);

  return (
    <div className="chapter0-container">
      <h1 className="chapter0-title" style={{ marginBottom: '1.2rem' }}>Introduction to Drum Notation</h1>
      <div className="chapter0-description" style={{ marginTop: 0 }}>
        Drum notation is a way of writing down rhythms and beats using symbols for notes and rests. Understanding these symbols is essential for reading and playing drum music!
      </div>
      {/* Note Card Carousel - always visible */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0 2.5rem 0' }}>
        <div className={`chapter0-note-carousel-card${slideDirection ? ' ' + slideDirection : ''}`} style={{ background: '#232946', borderRadius: 16, boxShadow: '0 2px 16px #0004', padding: '2.2rem 2.5rem', minWidth: 400, maxWidth: 520, color: '#fff', textAlign: 'center', position: 'relative', transition: 'transform 0.3s, opacity 0.3s' }}>
          <div style={{ display: 'flex', flexDirection: noteCardIdx === 0 ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: noteCardIdx === 0 ? 0 : '1.5rem', marginBottom: '1.5rem', textAlign: noteCardIdx === 0 ? 'center' : 'left' }}>
            <div style={{ flex: 1, textAlign: noteCardIdx === 0 ? 'center' : 'left' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#ffb3b3', marginBottom: '1.1rem' }}>{noteDescriptions[noteCardIdx].title}</h3>
              {noteCardIdx === 0 ? (
                <div style={{ fontSize: '1.08rem', color: '#fff', margin: 0, textAlign: 'center', whiteSpace: 'pre-line' }}>
                  {noteDescriptions[0].desc.join('\n\n')}
                </div>
              ) : noteCardIdx >= 1 && noteCardIdx <= 5 ? (
                <>
                  <ul style={{ fontSize: '1.08rem', color: '#fff', margin: 0, paddingLeft: '1.2rem', textAlign: 'left', listStyle: 'disc' }}>
                    {noteDescriptions[noteCardIdx].desc.map((point, i) => (
                      <li key={i} style={{ marginBottom: '0.6rem' }}>{point}</li>
                    ))}
                  </ul>
                  <NoteDemoGrid type={['whole','half','quarter','eighth','sixteenth'][noteCardIdx-1]} />
                </>
              ) : (
                <ul style={{ fontSize: '1.08rem', color: '#fff', margin: 0, paddingLeft: '1.2rem', textAlign: 'left', listStyle: 'disc' }}>
                  {noteDescriptions[noteCardIdx].desc.map((point, i) => (
                    <li key={i} style={{ marginBottom: '0.6rem' }}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
            {noteImages[noteCardIdx] && (
              <img 
                src={noteImages[noteCardIdx]} 
                alt={noteDescriptions[noteCardIdx].title} 
                style={{ width: noteCardIdx === 1 ? 44 : 56, height: noteCardIdx === 1 ? 44 : 56, objectFit: 'contain', display: 'block' }} 
              />
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', marginTop: '2.2rem' }}>
            <div style={{ width: 48, display: 'flex', justifyContent: 'center' }}>
              {noteCardIdx > 0 && (
                <button
                  className="chapter0-nav-button"
                  onClick={handlePrev}
                >
                  ←
                </button>
              )}
            </div>
            <span style={{ fontSize: '1rem', color: '#eebebe', minWidth: 48, textAlign: 'center' }}>{noteCardIdx + 1} / {noteDescriptions.length}</span>
            <div style={{ width: 48, display: 'flex', justifyContent: 'center' }}>
              {noteCardIdx < noteDescriptions.length - 1 && (
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

      <div className="chapter0-cards-container" style={{ maxWidth: 820}}>
        {/* Notes Card */}
        <div className={`chapter0-card chapter0-card-notes`} style={{ background: '#232946', marginBottom: '2.5rem' }}>
          <h2 className="chapter0-card-title">Tree of Notes</h2>
          <table className="chapter0-table" style={{ maxWidth: 760 }}>
            <thead className="chapter0-table-header">
              <tr>
                <th>American / German note names</th>
                <th>British note names</th>
                <th className="center">Note symbol</th>
                <th>Note value</th>
              </tr>
            </thead>
            <tbody>
              {noteTable.map((row, idx) => (
                <tr key={row.type} className="chapter0-table-row">
                  <td className="chapter0-table-cell">{row.american}</td>
                  <td className="chapter0-table-cell bold">{row.british}</td>
                  <td className="chapter0-table-cell center">
                    <img src={noteImages[idx+1]} alt={row.american} style={{ width: row.type === 'whole' ? 28 : 32, height: row.type === 'whole' ? 28 : 32, objectFit: 'contain', display: 'inline-block' }} />
                  </td>
                  <td className="chapter0-table-cell">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Navigation */}
      <div style={{ textAlign: 'center', marginTop: '-3rem', display: 'flex', justifyContent: 'center', gap: '2.5rem' }}>
        <Link to="/chapter-0" className="chapter0-back-link">
          ← Back
        </Link>
        <Link to="/chapter0pg3" className="chapter0-back-link">
          Next →
        </Link>
      </div>
    </div>
  );
} 