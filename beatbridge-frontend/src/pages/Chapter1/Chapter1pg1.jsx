/**
 * Drum Kit Guided Tour for Chapter 0 (Start Tour below drum kit)
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Chapter1/Chapter1pg1.css';

export default function Chapter1pg1() {
  const navigate = useNavigate();
  return (
    <div className="chapter1-container">
      <h1 className="chapter1-title">Chapter 1: Stick Control (Quarter Note & Rest)</h1>
      <div className="chapter1-description-card">
        <div className="chapter1-description">
          <p>
            Welcome to Chapter 1! In this chapter, you'll learn about stick control using the snare drum, focusing on quarter notes and rests. You'll practice basic stick patterns, play along with a metronome, and build your rhythmic foundation for drumming.
          </p>
          <p>
            The exercises will help you develop coordination, timing, and control using alternating right (R) and left (L) hand strokes. Let's get started!
          </p>
        </div>
      </div>
      <div className="chapter1-button-row">
        <button
          className="chapter1-back-link"
          onClick={() => navigate('/chapter1pg2')}
        >
          Next →
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '-3rem', display: 'flex', justifyContent: 'center', marginTop: '0rem'}}>
        <button
          className="chapter1-back-link"
          onClick={() => navigate('/chapter1-dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
} 