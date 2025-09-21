import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Симуляція логіну - зберігаємо userId в localStorage
    const userId = 'user123'; // В реальному додатку це буде з API
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', email);
    
    // Редірект на головну сторінку
    navigate('/');
    window.location.reload(); // Оновлюємо сторінку для оновлення header
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Будь ласка, введіть email для скидання паролю');
      return;
    }
    alert(`Інструкції для скидання паролю надіслані на ${email}`);
    setShowForgotPassword(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-wrapper">
          <h1 className="login-title">Вхід в MapMark</h1>
          <p className="login-subtitle">Увійдіть, щоб продовжити</p>
          
          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введіть ваш email"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введіть ваш пароль"
                  required
                />
              </div>
              
              <button type="submit" className="login-btn">
                Увійти
              </button>
              
              <button 
                type="button" 
                className="forgot-password-btn"
                onClick={() => setShowForgotPassword(true)}
              >
                Забули пароль?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="login-form">
              <div className="form-group">
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введіть ваш email для скидання паролю"
                  required
                />
              </div>
              
              <button type="submit" className="login-btn">
                Скинути пароль
              </button>
              
              <button 
                type="button" 
                className="forgot-password-btn"
                onClick={() => setShowForgotPassword(false)}
              >
                Назад до входу
              </button>
            </form>
          )}
          
          <div className="login-footer">
            <p>Немає акаунту? <Link to="/register">Зареєструватися</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;