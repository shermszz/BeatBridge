import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Chapter0pg1-3.css';

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

  const handleOptionClick = (idx) => {
    setSelected(idx);
    setShowExplanation(true);
    if (idx === quizQuestions[current].answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (current < quizQuestions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setShowExplanation(false);
  };

  return (
    <div className="chapter0-container">
      <h1 className="chapter0-title">Chapter 0 Quiz: Notes & Rests</h1>
      <div className="chapter0-quiz-card">
        {!showResult ? (
          <>
            <div className="chapter0-quiz-question">
              <b>Q{current + 1}:</b> {quizQuestions[current].question}
            </div>
            <div className="chapter0-quiz-options">
              {quizQuestions[current].options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`chapter0-quiz-option${selected === idx ? (idx === quizQuestions[current].answer ? ' correct' : ' wrong') : ''}`}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              ))}
            </div>
            {showExplanation && (
              <div className="chapter0-quiz-explanation">
                {selected === quizQuestions[current].answer ? 'Correct! ' : 'Incorrect. '}
                {quizQuestions[current].explanation}
              </div>
            )}
            <div className="chapter0-quiz-nav">
              <button
                className="chapter0-nav-button"
                onClick={handleNext}
                disabled={selected === null}
              >
                {current === quizQuestions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </>
        ) : (
          <div className="chapter0-quiz-result">
            <h2>Your Score: {score} / {quizQuestions.length}</h2>
            <div style={{margin: '1rem 0'}}>
              {score === quizQuestions.length
                ? 'Excellent! You mastered notes and rests.'
                : score >= 3
                ? 'Good job! Review any mistakes and try again.'
                : 'Keep practicing! Review the material and try again.'}
            </div>
            <button className="chapter0-nav-button" onClick={handleRestart}>Retry Quiz</button>
          </div>
        )}
      </div>
      <div className="chapter0-nav-container chapter0-quiz-nav">
        <Link to="/chapter0pg4" className="chapter0-back-link">
          ← Back
        </Link>
        <Link to="/rhythm-trainer-chapters" className="chapter0-back-link">
          Next →
        </Link>
      </div>
    </div>
  );
} 