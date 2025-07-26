/**
 * Chapter1pg5 - Chapter 1 Quiz
 * 
 * This component provides a comprehensive quiz to test users' understanding
 * of the concepts learned in Chapter 1, including stick control, rest notes,
 * metronome usage, and rhythmic fundamentals.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Chapter1/Chapter1pg5.css';
import config from '../../config';

const quizQuestions = [
  {
    question: 'What does a rest note (–) in a stick control pattern mean?',
    options: [
      'Hit the snare harder',
      'Hit the snare softer',
      'Do not hit the snare at all',
      'Hit the snare twice quickly'
    ],
    answer: 2,
    explanation: 'A rest note (–) means you should NOT hit the snare during that beat.'
  },
  {
    question: 'What is the purpose of the metronome in stick control exercises?',
    options: [
      'To make the exercise more difficult',
      'To help you maintain consistent timing',
      'To provide background music',
      'To count your score'
    ],
    answer: 1,
    explanation: 'The metronome helps you maintain consistent timing and rhythm during stick control exercises.'
  },
  {
    question: 'In a pattern like "R, L, R, rest", what should you do on the fourth beat?',
    options: [
      'Hit with your right hand',
      'Hit with your left hand',
      'Hit with both hands',
      'Do not hit anything'
    ],
    answer: 3,
    explanation: 'On the fourth beat (rest), you should not hit anything - just let that beat pass silently.'
  },
  {
    question: 'In a pattern with quarter notes and rests, how many beats does each quarter note last?',
    options: [
      '1 beat',
      '1/2 beat',
      '2 beats',
      '1/4 beat'
    ],
    answer: 0,
    explanation: 'Each quarter note lasts for 1 beat, which is the basic unit of time in most music.'
  },
  {
    question: 'What is the main benefit of alternating between right and left hands in stick control?',
    options: [
      'It makes the exercise easier to remember',
      'It develops hand independence and coordination',
      'It allows you to play faster',
      'It reduces fatigue in your hands'
    ],
    answer: 1,
    explanation: 'Alternating between hands develops hand independence and coordination, which is crucial for playing complex drum patterns.'
  }
];

export default function Chapter1pg5() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const [answeredWrong, setAnsweredWrong] = useState(false);
  const navigate = useNavigate();

  const handleOptionClick = (idx) => {
    if (selected !== null && !wrongAttempt) return; // Prevent further clicks after correct answer
    if (idx === quizQuestions[current].answer) {
      setSelected(idx);
      setShowExplanation(true);
      if (!answeredWrong) {
        setScore(score + 1);
      }
      setWrongAttempt(false);
    } else {
      setSelected(idx);
      setWrongAttempt(true);
      setShowExplanation(false);
      setAnsweredWrong(true);
    }
  };

  // Add this function to update chapter progress, only once per user (per session)
  const updateProgress = async () => {
    console.log('Updating chapter progress...'); // Debug log
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.API_BASE_URL}/api/chapter-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chapter_progress: 3, chapter1_page_progress: 6 }) // Set to the correct value as needed
      });
    } catch (err) { console.error('Progress update failed:', err); }
  };

  const handleNext = () => {
    if (current < quizQuestions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowExplanation(false);
      setWrongAttempt(false);
      setAnsweredWrong(false);
    } else {
      // User is finishing the last question, so update progress now
      updateProgress();
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setShowExplanation(false);
    setWrongAttempt(false);
    setAnsweredWrong(false);
  };

  // New handler for navigating to the congratulations page
  const handleNextPage = async () => {
    await updateProgress();
    navigate('/chapter1pg6');
  };

  const handleBack = () => {
    navigate('/chapter1pg4');
  };

  return (
    <div className="chapter1-container">
      <h1 className="chapter1-title" style={{marginBottom:'2.5rem'}}>Chapter 1 Quiz: Stick Control</h1>
      <div className="chapter1-quiz-card">
        {!showResult ? (
          <div className="chapter1-quiz-main-card">
            <div className="chapter1-quiz-progress">
              {current + 1} / {quizQuestions.length}
            </div>
            <div className="chapter1-quiz-question">
              <b>Q{current + 1}:</b> {quizQuestions[current].question}
            </div>
            <div className="chapter1-quiz-options-grid">
              <div className="chapter1-quiz-options-row">
                {quizQuestions[current].options.slice(0, 2).map((opt, idx) => (
                  <button
                    key={idx}
                    className={`chapter1-quiz-option${selected === idx ? (idx === quizQuestions[current].answer ? ' correct' : wrongAttempt && selected === idx ? ' wrong' : '') : ''}`}
                    onClick={() => handleOptionClick(idx)}
                    disabled={selected !== null && !wrongAttempt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="chapter1-quiz-options-row">
                {quizQuestions[current].options.slice(2, 4).map((opt, idx) => (
                  <button
                    key={idx+2}
                    className={`chapter1-quiz-option${selected === idx+2 ? (idx+2 === quizQuestions[current].answer ? ' correct' : wrongAttempt && selected === idx+2 ? ' wrong' : '') : ''}`}
                    onClick={() => handleOptionClick(idx+2)}
                    disabled={selected !== null && !wrongAttempt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {wrongAttempt && (
              <div className="chapter1-quiz-explanation try-again">
                Try Again
              </div>
            )}
            {showExplanation && (
              <div className="chapter1-quiz-explanation">
                Correct! {quizQuestions[current].explanation}
              </div>
            )}
            <div className="chapter1-quiz-nav">
              {showExplanation && (
                <button
                  className={`chapter1-nav-button${current === quizQuestions.length - 1 ? ' finish' : ''}`}
                  onClick={handleNext}
                  disabled={!showExplanation}
                >
                  {current === quizQuestions.length - 1 ? 'Finish' : '→'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="chapter1-quiz-result">
            <h2 style={{textAlign:'center'}}>Your Score: {score} / {quizQuestions.length}</h2>
            <div style={{margin: '1rem 0', textAlign:'center', fontSize:'1.1rem'}}>
              {score === quizQuestions.length
                ? 'Excellent! You mastered stick control fundamentals.'
                : score >= 4
                ? 'Good job! Review any mistakes and try again.'
                : 'Keep practicing! Review the material and try again.'}
            </div>
            <button className="chapter1-nav-button retry" onClick={handleRestart}>Retry Quiz</button>
          </div>
        )}
      </div>
      <div className="chapter1-nav-container chapter1-quiz-nav">
        <button className="chapter1-back-link" onClick={handleBack}>
          ← Back
        </button>
        {showResult && (
          <button className="chapter1-back-link" onClick={handleNextPage}>
            Next →
          </button>
        )}
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