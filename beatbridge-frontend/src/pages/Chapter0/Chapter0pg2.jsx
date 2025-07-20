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
      {/* Rest Descriptions - only show above tree if rest tree is visible */}
      {/* (Removed rest description above tree) */}
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