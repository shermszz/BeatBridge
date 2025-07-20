import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Chapter0.css';

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
        <Link to="/rhythm-trainer-chapters" className="chapter0-back-link">
          Next →
        </Link>
      </div>
    </div>
  );
} 