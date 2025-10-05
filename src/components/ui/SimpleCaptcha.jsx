import React, { useState, useEffect } from 'react';
import './SimpleCaptcha.css';

const SimpleCaptcha = ({ onVerify }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateQuestion = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let result;
    let questionText;
    
    if (op === '+') {
      result = a + b;
      questionText = `${a} + ${b} = ?`;
    } else {
      result = a - b;
      questionText = `${a} - ${b} = ?`;
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
    setIsVerified(verified);
    onVerify(verified);
  };

  const handleRefresh = () => {
    generateQuestion();
    onVerify(false);
  };

  return (
    <div className="simple-captcha">
      <div className="captcha-question">
        <span>{question}</span>
        <button type="button" onClick={handleRefresh} className="refresh-btn">
          🔄
        </button>
      </div>
      <div className="captcha-input">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onBlur={handleSubmit}
          placeholder="Відповідь"
          className={isVerified ? 'verified' : ''}
        />
        {isVerified && <span className="verified-icon">✓</span>}
      </div>
    </div>
  );
};

export default SimpleCaptcha;