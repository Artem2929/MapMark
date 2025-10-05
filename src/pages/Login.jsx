import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';

import AuthLoader from '../components/ui/AuthLoader';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Перевіряємо чи користувач вже авторизований
  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return '';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      return t('login.validation.emailInvalid');
    }
    
    // Перевірка на кирилицю
    const cyrillicRegex = /[а-яё]/i;
    if (cyrillicRegex.test(emailValue)) {
      return t('login.validation.emailCyrillic');
    }
    
    return '';
  };

  const validateEmailOnBlur = (emailValue) => {
    if (!emailValue.trim()) {
      return t('login.validation.emailRequired');
    }
    return validateEmail(emailValue);
  };

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email.trim() && 
           emailRegex.test(email.trim()) && 
           password && 
           password.length >= 6;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Базова валідація
    if (!email.trim()) {
      setError(t('login.validation.emailRequired'));
      setLoading(false);
      return;
    }
    
    if (!password) {
      setError(t('login.validation.passwordRequired'));
      setLoading(false);
      return;
    }

    try {
      await authService.login(email.trim(), password);
      // Успішний логін - перенаправляємо на головну
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      // Очищуємо пароль при помилці
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError(t('login.validation.emailForReset'));
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      alert(t('login.resetPasswordSuccess', { email }));
      setShowForgotPassword(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-wrapper">
          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">{t('login.subtitle')}</p>
          
          <div className="error-container">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
          
          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailTouched) {
                      setEmailError(validateEmail(e.target.value));
                    }
                  }}
                  onBlur={() => {
                    setEmailTouched(true);
                    setEmailError(validateEmailOnBlur(email));
                  }}
                  placeholder={t('login.emailPlaceholder')}
                  autoComplete="off"
                  className={emailError && emailTouched ? 'input-error' : ''}
                  required
                />
                {emailError && emailTouched && (
                  <div className="field-error">{emailError}</div>
                )}
              </div>
              
              <div className="form-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => {
                    if (email && !emailTouched) {
                      setEmailTouched(true);
                      setEmailError(validateEmailOnBlur(email));
                    }
                  }}
                  placeholder={t('login.passwordPlaceholder')}
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👀' : '🙈'}
                </button>
              </div>
              
              <button type="submit" className="login-btn" disabled={loading || !isFormValid()}>
                {loading ? (
                  <div className="btn-loading">
                    <div className="btn-spinner"></div>
                    {t('login.loginButtonLoading')}
                  </div>
                ) : (
                  t('login.loginButton')
                )}
              </button>
              

              
              <button 
                type="button" 
                className="forgot-password-btn"
                onClick={() => {
                  setShowForgotPassword(true);
                  setEmailError('');
                  setEmailTouched(false);
                  setError('');
                }}
              >
                {t('login.forgotPassword')}
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
                  placeholder={t('login.resetEmailPlaceholder')}
                  required
                />
              </div>
              
              <button type="submit" className="login-btn" disabled={loading || !email.trim()}>
                {loading ? t('login.resetPasswordLoading') : t('login.resetPassword')}
              </button>
              
              <button 
                type="button" 
                className="forgot-password-btn"
                onClick={() => {
                  setShowForgotPassword(false);
                  setEmailError('');
                  setEmailTouched(false);
                  setError('');
                }}
              >
                {t('login.backToLogin')}
              </button>
            </form>
          )}
          
          <div className="login-footer">
            <p>{t('login.noAccount')} <Link to="/register">{t('login.registerLink')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;