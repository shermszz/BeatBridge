import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/RhythmTrainerChapters.css';
import config from '../config';

const CHAPTERS = [
  {
    id: 1,
    title: "Introduction",
    description: "Get familiar with the drum kit and learn the basics of drumming!",
    difficulty: "First-Timer",
    duration: "10 min",
    icon: "🥁",
    color: "#e74c3c"
  },
  {
    id: 2,
    title: "Rhythm Fundamentals",
    description: "Master quarter notes, eighth notes stick patterns!",
    difficulty: "First-Timer",
    duration: "20 min",
    icon: "🎵",
    color: "#3498db"
  },
  {
    id: 3,
    title: "Coordination",
    description: "Develop hand and foot coordination skills",
    difficulty: "Beginner",
    duration: "25 min",
    icon: "🤝",
    color: "#f39c12"
  },
  {
    id: 4,
    title: "Groove Patterns",
    description: "Learn popular drum grooves and fills",
    difficulty: "Beginner",
    duration: "30 min",
    icon: "🎶",
    color: "#9b59b6"
  },
  {
    id: 5,
    title: "Speed Building",
    description: "Increase your playing speed and endurance",
    difficulty: "Intermediate",
    duration: "35 min",
    icon: "⚡",
    color: "#e67e22"
  },
  {
    id: 6,
    title: "Advanced Techniques",
    description: "Master complex drumming techniques",
    difficulty: "Intermediate",
    duration: "40 min",
    icon: "🔥",
    color: "#e74c3c"
  }
];

export default function RhythmTrainerChapters() {
  const [showModal, setShowModal] = useState(false);
  const [checkedSkill, setCheckedSkill] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkillLevel = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCheckedSkill(true);
          return;
        }
        const response = await fetch(`${config.API_BASE_URL}/api/get-customization`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.skill_level === 'Advanced') {
            setShowModal(true);
          }
        }
      } catch (err) {
        // fail silently
      } finally {
        setCheckedSkill(true);
      }
    };
    fetchSkillLevel();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="chapters-container">
      {/* Modal for advanced users */}
      {showModal && (
        <div className="advanced-modal-overlay">
          <div className="advanced-modal">
            <button className="close-modal-btn" onClick={handleCloseModal}>&times;</button>
            <h2 style={{ marginTop: '1rem', fontWeight: 700, fontSize: '2rem', color: '#222' }}>Hello Drummer!</h2>
            <div className="modal-description" style={{ marginBottom: '2.3rem', color: '#222', fontSize: '1.08rem' }}>
              <p>As an <b>advanced</b> drummer, the lessons in the Rhythm Trainer may feel a bit too simple for your current skill level.</p>
              <p>To keep challenging yourself and continue improving, we recommend heading to our <b>Song Recommendation</b> system or joining a <b>Jam Session</b> for more advanced practice.</p>
              <p>Of course, feel free to explore and revisit any Rhythm Trainer chapters as you wish!</p>
            </div>
            <div className="modal-actions">
              <Link to="/song-recommendation" className="modal-link-btn">Go to Song Recommendation</Link>
              <Link to="/jam-session" className="modal-link-btn">Go to Jam Session</Link>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem' }}>
              You can close this and continue with the Rhythm Trainer chapters as usual.
            </p>
          </div>
        </div>
      )}
      <div className="chapters-header">
        <h1 className="chapters-title">Rhythm Trainer Chapters</h1>
        <p className="chapters-subtitle">
          Choose a chapter to start your drumming journey
        </p>
      </div>
      
      <div className="chapters-grid">
        {CHAPTERS.map((chapter, idx) => (
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
            {idx === 0 ? (
              <Link to="/chapter-0" className="start-chapter-btn">
                Start Chapter 0
              </Link>
            ) : (
              <button className="start-chapter-btn">
                Start Chapter {idx}
              </button>
            )}
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