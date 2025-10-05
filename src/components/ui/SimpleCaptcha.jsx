import React, { useState, useEffect } from 'react';
import './SimpleCaptcha.css';

const SimpleCaptcha = ({ onVerify, onAnswerChange }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showError, setShowError] = useState(false);

  const generateQuestion = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let result;
    let questionText;
    
    if (op === '+') {
      result = a + b;
      questionText = `${a} + ${b}`;
    } else {
      result = a - b;
      questionText = `${a} - ${b}`;
    }
    
    setQuestion(questionText);
    setAnswer(result.toString());
    setUserAnswer('');
    setIsVerified(false);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleSubmit = () => {
    const verified = userAnswer === answer;
    if (verified) {
      setIsVerified(true);
      setShowError(false);
      onVerify(true);
    } else {
      setShowError(true);
    }
  };

  const handleRefresh = () => {
    generateQuestion();
    setShowError(false);
    onVerify(false);
  };

  return (
    <div className="simple-captcha">
      <div className="captcha-header">
        <span className="captcha-label">Розв'яжіть приклад:</span>
      </div>
      <div className="captcha-content">
        <span className="captcha-question">{question} =</span>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => {
            const value = e.target.value;
            setUserAnswer(value);
            setShowError(false);
            
            // Автоматична перевірка при введенні
            if (value && value === answer) {
              setIsVerified(true);
              onVerify(true);
            } else {
              setIsVerified(false);
              onVerify(false);
            }
            
            onAnswerChange && onAnswerChange(value);
          }}
          placeholder="?"
          className={`captcha-input ${isVerified ? 'verified' : ''}`}
        />
        {isVerified && <span className="verified-icon">✓</span>}
      </div>
      {showError && <div className="captcha-error-inline">Неправильна відповідь, спробуйте ще раз</div>}
      <div className="captcha-actions">
        <button type="button" onClick={handleRefresh} className="refresh-btn">
          🔄 Нове завдання
        </button>
      </div>
    </div>
  );
};

export default SimpleCaptcha;