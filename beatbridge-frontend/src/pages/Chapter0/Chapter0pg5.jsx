/**
 * Chapter0pg5 - Chapter 0 Quiz
 * 
 * This component provides a comprehensive quiz to test users' understanding
 * of the concepts learned in Chapter 0, including note values, rest notes,
 * and basic music notation fundamentals.

 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Chapter0/Chapter0pg5.css';
import config from '../../config';

/**
 * Quiz questions configuration
 * Contains 5 multiple-choice questions covering Chapter 0 concepts
 * Each question has options, correct answer, and explanation
 */
const quizQuestions = [
  {
    question: 'What is the duration of a Whole Note (Semibreve)?',
    options: ['1 beat', '2 beats', '4 beats', '1/2 of a beat'],
    answer: 2,
    explanation: 'A Whole Note (Semibreve) lasts for 4 beats.'
  },
  {
    question: 'Which rest symbol represents a full measure of silence (4 beats)?',
    options: ['Quarter Rest', 'Whole Rest', 'Eighth Rest', 'Half Rest'],
    answer: 1,
    explanation: 'A Whole Rest (Semibreve Rest) represents 4 beats of silence.'
  },
  {
    question: 'What does a Quarter Note (Crotchet) look like?',
    options: [
      'A hollow oval note head without a stem',
      'A filled-in oval note head with a straight stem',
      'A hollow oval note head with a straight stem',
      'A filled-in oval note head with a stem and a single flag'
    ],
    answer: 1,
    explanation: 'A Quarter Note (Crotchet) is a filled-in oval note head with a straight stem.'
  },
  {
    question: 'How long does an Eighth Rest (Quaver Rest) last?',
    options: ['1 beat', '2 beats', '1/2 of a beat', '1/4 of a beat'],
    answer: 2,
    explanation: 'An Eighth Rest (Quaver Rest) lasts for 1/2 of a beat.'
  },
  {
    question: 'Which of the following is TRUE about a Sixteenth Note (Semiquaver)?',
    options: [
      'It lasts for two beats',
      'It is used in very fast rhythmic sections',
      'It is the longest note value',
      'It is represented by a hollow oval note head'
    ],
    answer: 1,
    explanation: 'A Sixteenth Note (Semiquaver) is used in very fast rhythmic sections.'
  }
];

export default function Chapter0pg5() {
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
        body: JSON.stringify({ 
          chapter_progress: 2,
          chapter0_page_progress: 6 
        })
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
    navigate('/chapter0pg6');
  };

  const handleBack = () => {
    navigate('/chapter0pg4');
  };

  return (
    <div className="chapter0-container">
      <h1 className="chapter0-title" style={{marginBottom:'2.5rem'}}>Chapter 0 Quiz: Notes & Rests</h1>
      <div className="chapter0-quiz-card">
        {!showResult ? (
          <div className="chapter0-quiz-main-card">
            <div className="chapter0-quiz-progress">
              {current + 1} / {quizQuestions.length}
            </div>
            <div className="chapter0-quiz-question">
              <b>Q{current + 1}:</b> {quizQuestions[current].question}
            </div>
            <div className="chapter0-quiz-options-grid">
              <div className="chapter0-quiz-options-row">
                {quizQuestions[current].options.slice(0, 2).map((opt, idx) => (
                  <button
                    key={idx}
                    className={`chapter0-quiz-option${selected === idx ? (idx === quizQuestions[current].answer ? ' correct' : wrongAttempt && selected === idx ? ' wrong' : '') : ''}`}
                    onClick={() => handleOptionClick(idx)}
                    disabled={selected !== null && !wrongAttempt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="chapter0-quiz-options-row">
                {quizQuestions[current].options.slice(2, 4).map((opt, idx) => (
                  <button
                    key={idx+2}
                    className={`chapter0-quiz-option${selected === idx+2 ? (idx+2 === quizQuestions[current].answer ? ' correct' : wrongAttempt && selected === idx+2 ? ' wrong' : '') : ''}`}
                    onClick={() => handleOptionClick(idx+2)}
                    disabled={selected !== null && !wrongAttempt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {wrongAttempt && (
              <div className="chapter0-quiz-explanation try-again">
                Try Again
              </div>
            )}
            {showExplanation && (
              <div className="chapter0-quiz-explanation">
                Correct! {quizQuestions[current].explanation}
              </div>
            )}
            <div className="chapter0-quiz-nav">
              {showExplanation && (
                <button
                  className={`chapter0-nav-button${current === quizQuestions.length - 1 ? ' finish' : ''}`}
                  onClick={handleNext}
                  disabled={!showExplanation}
                >
                  {current === quizQuestions.length - 1 ? 'Finish' : '→'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="chapter0-quiz-result">
            <h2 style={{textAlign:'center'}}>Your Score: {score} / {quizQuestions.length}</h2>
            <div style={{margin: '1rem 0', textAlign:'center', fontSize:'1.1rem'}}>
              {score === quizQuestions.length
                ? 'Excellent! You mastered the basics of notes and rests.'
                : score >= 3
                ? 'Good job! Review any mistakes and try again.'
                : 'Keep practicing! Review the material and try again.'}
            </div>
            <button className="chapter0-nav-button retry" onClick={handleRestart}>Retry Quiz</button>
          </div>
        )}
      </div>
      <div className="chapter0-nav-container chapter0-quiz-nav">
        <button className="chapter0-back-link" onClick={handleBack}>
          ← Back
        </button>
        {showResult && (
          <button className="chapter0-back-link" onClick={handleNextPage}>
            Next →
          </button>
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: '-3rem', display: 'flex', justifyContent: 'center', marginTop: '0rem'}}>
        <button
          className="chapter0-back-link"
          onClick={() => navigate('/chapter0-dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
} 