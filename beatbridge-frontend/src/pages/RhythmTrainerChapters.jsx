import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/RhythmTrainerChapters.css';

const CHAPTERS = [
  {
    id: 1,
    title: "Basic Beats",
    description: "Learn fundamental drum patterns and timing",
    difficulty: "Beginner",
    duration: "15 min",
    icon: "🥁",
    color: "#e74c3c"
  },
  {
    id: 2,
    title: "Rhythm Fundamentals",
    description: "Master quarter notes, eighth notes, and basic rhythms",
    difficulty: "Beginner",
    duration: "20 min",
    icon: "🎵",
    color: "#3498db"
  },
  {
    id: 3,
    title: "Coordination",
    description: "Develop hand and foot coordination skills",
    difficulty: "Intermediate",
    duration: "25 min",
    icon: "🤝",
    color: "#f39c12"
  },
  {
    id: 4,
    title: "Groove Patterns",
    description: "Learn popular drum grooves and fills",
    difficulty: "Intermediate",
    duration: "30 min",
    icon: "🎶",
    color: "#9b59b6"
  },
  {
    id: 5,
    title: "Speed Building",
    description: "Increase your playing speed and endurance",
    difficulty: "Advanced",
    duration: "35 min",
    icon: "⚡",
    color: "#e67e22"
  },
  {
    id: 6,
    title: "Advanced Techniques",
    description: "Master complex drumming techniques",
    difficulty: "Advanced",
    duration: "40 min",
    icon: "🔥",
    color: "#e74c3c"
  }
];

export default function RhythmTrainerChapters() {
  return (
    <div className="chapters-container">
      <div className="chapters-header">
        <h1 className="chapters-title">Rhythm Trainer Chapters</h1>
        <p className="chapters-subtitle">
          Choose a chapter to start your drumming journey
        </p>
      </div>
      
      <div className="chapters-grid">
        {CHAPTERS.map((chapter) => (
          <div 
            key={chapter.id} 
            className="chapter-card"
            style={{ '--accent-color': chapter.color }}
          >
            <div className="chapter-icon">{chapter.icon}</div>
            <div className="chapter-content">
              <h3 className="chapter-title">{chapter.title}</h3>
              <p className="chapter-description">{chapter.description}</p>
              <div className="chapter-meta">
                <span className="chapter-difficulty">{chapter.difficulty}</span>
                <span className="chapter-duration">{chapter.duration}</span>
              </div>
            </div>
            <button className="start-chapter-btn">
              Start Chapter
            </button>
          </div>
        ))}
      </div>
      
      <div className="chapters-footer">
        <Link to="/rhythm-trainer" className="back-to-trainer-btn">
          ← Back to Virtual Drum
        </Link>
      </div>
    </div>
  );
} 