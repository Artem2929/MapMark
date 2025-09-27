import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import googleAuthService from '../services/googleAuthService';
import AuthLoader from '../components/ui/AuthLoader';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      return 'Введіть коректний email (наприклад: user@example.com)';
    }
    
    // Перевірка на кирилицю
    const cyrillicRegex = /[а-яё]/i;
    if (cyrillicRegex.test(emailValue)) {
      return 'Email не може містити кириличні символи';
    }
    
    return '';
  };

  const validateEmailOnBlur = (emailValue) => {
    if (!emailValue.trim()) {
      return 'Email обов\'язковий';
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
      setError('Введіть email');
      setLoading(false);
      return;
    }
    
    if (!password) {
      setError('Введіть пароль');
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
      setError('Будь ласка, введіть email для скидання паролю');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      alert(`Інструкції для скидання паролю надіслані на ${email}`);
      setShowForgotPassword(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const userData = await googleAuthService.signIn();
      
      // Зберігаємо дані користувача
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userName', userData.name);
      localStorage.setItem('userImage', userData.imageUrl);
      localStorage.setItem('authProvider', 'google');
      localStorage.setItem('googleToken', userData.token);
      
      // Можна відправити дані на сервер для реєстрації/авторизації
      try {
        await authService.googleLogin({
          googleId: userData.id,
          email: userData.email,
          name: userData.name,
          imageUrl: userData.imageUrl,
          token: userData.token
        });
      } catch (serverError) {
        console.warn('Server registration failed, using local auth:', serverError);
      }
      
      // Перенаправляємо на головну сторінку
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Помилка входу через Google. Спробуйте ще раз.');
    } finally {
      setGoogleLoading(false);
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
                  {showPassword ? '👁️' : '👁️‍🗨️'}
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
              
              <div className="divider">
                <span>або</span>
              </div>
              
              <button 
                type="button" 
                className="google-login-btn" 
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
              >
                {googleLoading ? (
                  <div className="btn-loading">
                    <div className="btn-spinner"></div>
                    Вхід через Google...
                  </div>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('login.googleLogin')}
                  </>
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