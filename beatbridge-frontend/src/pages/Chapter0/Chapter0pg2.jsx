import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Chapter0.css';

// SVGs for notes
const NoteSVG = ({ type, size = 40 }) => {
  switch (type) {
    case 'whole':
      // Open oval, no stem
      return (
        <svg width={size} height={size} viewBox="0 0 40 40">
          <ellipse cx="20" cy="20" rx="12" ry="8" fill="#fff" stroke="#232946" strokeWidth="2.2" />
        </svg>
      );
    case 'half':
      // Open oval with stem
      return (
        <svg width={size} height={size} viewBox="0 0 40 60">
          <ellipse cx="14" cy="40" rx="12" ry="8" fill="#fff" stroke="#232946" strokeWidth="2.2" />
          <rect x="24" y="10" width="2.5" height="30" fill="#232946" />
        </svg>
      );
    case 'quarter':
      // Filled oval with stem
      return (
        <svg width={size} height={size} viewBox="0 0 40 60">
          <ellipse cx="14" cy="40" rx="12" ry="8" fill="#232946" stroke="#232946" strokeWidth="2.2" />
          <rect x="24" y="10" width="2.5" height="30" fill="#232946" />
        </svg>
      );
    case 'eighth':
      // Filled oval with stem and one flag
      return (
        <svg width={size} height={size} viewBox="0 0 40 60">
          <ellipse cx="14" cy="40" rx="12" ry="8" fill="#232946" stroke="#232946" strokeWidth="2.2" />
          <rect x="24" y="10" width="2.5" height="30" fill="#232946" />
          <path d="M26 10 Q38 18 24 22" stroke="#232946" strokeWidth="2.2" fill="none" />
        </svg>
      );
    case 'sixteenth':
      // Filled oval with stem and two flags
      return (
        <svg width={size} height={size} viewBox="0 0 40 60">
          <ellipse cx="14" cy="40" rx="12" ry="8" fill="#232946" stroke="#232946" strokeWidth="2.2" />
          <rect x="24" y="10" width="2.5" height="30" fill="#232946" />
          <path d="M26 10 Q38 18 24 22" stroke="#232946" strokeWidth="2.2" fill="none" />
          <path d="M26 18 Q36 25 24 28" stroke="#232946" strokeWidth="2.2" fill="none" />
        </svg>
      );
    default:
      return null;
  }
};

// SVGs for rests
const RestSVG = ({ type, size = 40 }) => {
  switch (type) {
    case 'whole':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40"><rect x="10" y="18" width="20" height="6" fill="#232946" /></svg>
      );
    case 'half':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40"><rect x="10" y="12" width="20" height="6" fill="#232946" /></svg>
      );
    case 'quarter':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40"><path d="M20 10 Q18 18 22 22 Q18 26 20 30" stroke="#232946" strokeWidth="3" fill="none" /></svg>
      );
    case 'eighth':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40"><path d="M20 10 Q18 18 22 22 Q18 26 20 30" stroke="#232946" strokeWidth="3" fill="none" /><circle cx="24" cy="12" r="3" fill="#232946" /></svg>
      );
    case 'sixteenth':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40"><path d="M20 10 Q18 18 22 22 Q18 26 20 30" stroke="#232946" strokeWidth="3" fill="none" /><circle cx="24" cy="12" r="3" fill="#232946" /><circle cx="28" cy="16" r="2.2" fill="#232946" /></svg>
      );
    case 'thirtysecond':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40"><path d="M20 10 Q18 18 22 22 Q18 26 20 30" stroke="#232946" strokeWidth="3" fill="none" /><circle cx="24" cy="12" r="3" fill="#232946" /><circle cx="28" cy="16" r="2.2" fill="#232946" /><circle cx="32" cy="20" r="1.7" fill="#232946" /></svg>
      );
    default:
      return null;
  }
};

const notes = [
  { name: 'Whole Note', type: 'whole' },
  { name: 'Half Note', type: 'half' },
  { name: 'Quarter Note', type: 'quarter' },
  { name: '8th Note', type: 'eighth' },
  { name: '16th Note', type: 'sixteenth' },
  { name: '32nd Note', type: 'thirtysecond' },
];

const rests = [
  { name: 'Whole Rest', type: 'whole' },
  { name: 'Half Rest', type: 'half' },
  { name: 'Quarter Rest', type: 'quarter' },
  { name: '8th Rest', type: 'eighth' },
  { name: '16th Rest', type: 'sixteenth' },
  { name: '32nd Rest', type: 'thirtysecond' },
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

export default function Chapter0pg2() {
  const [showRests, setShowRests] = useState(false);

  return (
    <div className="chapter0-container">
      <h1 className="chapter0-title" style={{ marginBottom: '1.2rem' }}>Introduction to Drum Notation</h1>
      <div className="chapter0-description" style={{ marginTop: 0 }}>
        Drum notation is a way of writing down rhythms and beats using symbols for notes and rests. Understanding these symbols is essential for reading and playing drum music!
      </div>
      
      <div className="chapter0-cards-container">
        {/* Notes Card */}
        <div className={`chapter0-card chapter0-card-notes ${showRests ? 'hidden' : ''}`}>
          <h2 className="chapter0-card-title">Tree of Notes</h2>
          <table className="chapter0-table">
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
                  <td className="chapter0-table-cell center"><NoteSVG type={row.type} size={38} /></td>
                  <td className="chapter0-table-cell">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Arrow to next card */}
          <div className="chapter0-nav-container">
            <button 
              onClick={() => setShowRests(true)}
              className="chapter0-nav-button"
            >
              →
            </button>
          </div>
        </div>

        {/* Rests Card */}
        <div className={`chapter0-card chapter0-card-rests ${showRests ? 'visible' : ''}`}>
          <h2 className="chapter0-card-title">Tree of Rests</h2>
          <table className="chapter0-table">
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
                  <td className="chapter0-table-cell center"><RestSVG type={row.type} size={38} /></td>
                  <td className="chapter0-table-cell">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Arrow to previous card */}
          <div className="chapter0-nav-container">
            <button 
              onClick={() => setShowRests(false)}
              className="chapter0-nav-button"
            >
              ←
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div style={{ textAlign: 'center', marginTop: '3.5rem', display: 'flex', justifyContent: 'center', gap: '2.5rem' }}>
        <Link to="/chapter-0" className="chapter0-back-link">
          ← Back
        </Link>
        <Link to="/rhythm-trainer-chapters" className="chapter0-back-link">
          Next →
        </Link>
      </div>
    </div>
  );
} 