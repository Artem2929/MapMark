import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CountrySelect from '../components/ui/CountrySelect';
import CustomSelect from '../components/ui/CustomSelect';
import PasswordStrength from '../components/ui/PasswordStrength';
import SimpleCaptcha from '../components/ui/SimpleCaptcha';
import EmailService from '../services/emailService';
import authService from '../services/authService';
import { validateRegistrationForm } from '../utils/registerValidation';
import AuthLoader from '../components/ui/AuthLoader';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    role: 'user',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [nameError, setNameError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      return t('register.validation.emailInvalid');
    }
    
    const cyrillicRegex = /[а-яё]/i;
    if (cyrillicRegex.test(emailValue)) {
      return t('register.validation.emailCyrillic');
    }
    
    return '';
  };

  const validateEmailOnBlur = (emailValue) => {
    if (!emailValue.trim()) {
      return t('register.validation.emailRequired');
    }
    return validateEmail(emailValue);
  };

  const validateName = (nameValue) => {
    if (!nameValue.trim()) {
      return '';
    }
    if (nameValue.trim().length < 2) {
      return t('register.validation.nameMinLength');
    }
    return '';
  };

  const validateNameOnBlur = (nameValue) => {
    if (!nameValue.trim()) {
      return t('register.validation.nameRequired');
    }
    return validateName(nameValue);
  };

  const validatePassword = (passwordValue) => {
    if (!passwordValue) {
      return '';
    }
    if (passwordValue.length < 6) {
      return t('register.validation.passwordMinLength');
    }
    return '';
  };

  const validatePasswordOnBlur = (passwordValue) => {
    if (!passwordValue) {
      return t('register.validation.passwordRequired');
    }
    return validatePassword(passwordValue);
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Очистити помилку поля при зміні
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.password && 
           formData.confirmPassword && 
           formData.country &&
           formData.role &&
           formData.acceptTerms && 
           formData.acceptPrivacy &&
           captchaVerified;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Клієнтська валідація
    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      // Фокус на першому полі з помилкою
      const firstErrorField = Object.keys(validation.errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) element.focus();
      return;
    }

    setLoading(true);

    try {
      await authService.register(
        formData.name.trim(), 
        formData.email.trim(), 
        formData.password
      );
      
      // Відправляємо email верифікацію
      try {
        await EmailService.sendVerificationEmail(formData.email.trim(), 'temp-token');
        setEmailSent(true);
      } catch (emailError) {
        console.warn('Email verification failed:', emailError);
      }
      
      // Успішна реєстрація - перенаправляємо на головну
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      // Очищуємо паролі при помилці
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form-wrapper">
          <h1 className="register-title">{t('register.title')}</h1>
          <p className="register-subtitle">{t('register.subtitle')}</p>
          
          <div className="error-container">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
          
          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => {
                  handleChange(e);
                  if (nameTouched) {
                    setNameError(validateName(e.target.value));
                  }
                }}
                onBlur={() => {
                  setNameTouched(true);
                  setNameError(validateNameOnBlur(formData.name));
                }}
                placeholder={t('register.namePlaceholder')}
                className={nameError && nameTouched ? 'input-error' : ''}
                required
              />
              {nameError && nameTouched && (
                <div className="field-error">{nameError}</div>
              )}
            </div>

            <div className="form-group">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  if (emailTouched) {
                    setEmailError(validateEmail(e.target.value));
                  }
                }}
                onBlur={() => {
                  setEmailTouched(true);
                  setEmailError(validateEmailOnBlur(formData.email));
                }}
                placeholder={t('register.emailPlaceholder')}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('register.passwordPlaceholder')}
                className={fieldErrors.password ? 'error' : ''}
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

            <div className="form-group password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('register.confirmPasswordPlaceholder')}
                className={fieldErrors.confirmPassword ? 'error' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👀' : '🙈'}
              </button>
            </div>
            <PasswordStrength password={formData.password} />

            <div className="form-group">
              <CountrySelect
                value={formData.country}
                onChange={(value) => setFormData({ ...formData, country: value })}
                placeholder={t('register.countryPlaceholder')}
              />
            </div>

            <div className="form-group">
              <CustomSelect
                options={[
                  { value: 'user', label: t('register.roles.user') },
                  { value: 'seller', label: t('register.roles.seller') }
                ]}
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
                placeholder={t('register.rolePlaceholder')}
              />
            </div>

            <div className="form-group checkbox-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  required
                />
                <Link to="/terms-of-service" target="_blank">{t('register.acceptTerms')}</Link>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  name="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onChange={(e) => setFormData({ ...formData, acceptPrivacy: e.target.checked })}
                  required
                />
                <Link to="/privacy-policy" target="_blank">{t('register.acceptPrivacy')}</Link>
              </div>
            </div>

            <SimpleCaptcha onVerify={setCaptchaVerified} />
            
            <button type="submit" className="register-btn" disabled={loading || !isFormValid()}>
              {loading ? (
                <div className="btn-loading">
                  <div className="btn-spinner"></div>
                  {t('register.registerButtonLoading')}
                </div>
              ) : (
                t('register.registerButton')
              )}
            </button>
          </form>
          
          <div className="register-footer">
            <p>{t('register.haveAccount')} <Link to="/login">{t('register.loginLink')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;