import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormValidation } from '../../hooks/useFormValidation';
import { registerSchema } from './Register.schema';
import { authService } from '../../services/auth.service';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    role: 'user',
    acceptTerms: false,
    acceptPrivacy: false
  };

  const {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate
  } = useFormValidation(initialData, registerSchema);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const response = await authService.register({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        country: data.country,
        role: data.role
      });

      localStorage.setItem('accessToken', response.accessToken);
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Помилка реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength(data.password);

  const isFormValid = !Object.values(errors).some(Boolean) &&
                     Object.keys(registerSchema).every(key => {
                       if (registerSchema[key].required) {
                         return data[key] !== '' && data[key] !== false;
                       }
                       return true;
                     });

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form-wrapper">
          <h1 className="register-title">Реєстрація</h1>
          <p className="register-subtitle">Створіть новий акаунт</p>

          <div className="error-container">
            {apiError && (
              <div className="error-message">{apiError}</div>
            )}
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                className={`${errors.name && touched.name ? 'input-error' : ''}`}
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Ваше ім'я"
                disabled={isLoading}
              />
              {errors.name && touched.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="email"
                className={`${errors.email && touched.email ? 'input-error' : ''}`}
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="your@email.com"
                disabled={isLoading}
              />
              {errors.email && touched.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group password-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${errors.password && touched.password ? 'input-error' : ''}`}
                value={data.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Введіть пароль"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👀'}
              </button>
              {errors.password && touched.password && (
                <span className="field-error">{errors.password}</span>
              )}
              {passwordStrength && (
                <div className={`password-strength ${passwordStrength}`}>
                  {passwordStrength === 'weak' && 'Слабкий пароль'}
                  {passwordStrength === 'medium' && 'Середній пароль'}
                  {passwordStrength === 'strong' && 'Сильний пароль'}
                </div>
              )}
            </div>

            <div className="form-group password-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`${errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}`}
                value={data.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Повторіть пароль"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? '🙈' : '👀'}
              </button>
              {errors.confirmPassword && touched.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="form-group">
              <select
                className={`${errors.country && touched.country ? 'input-error' : ''}`}
                value={data.country}
                onChange={(e) => handleChange('country', e.target.value)}
                onBlur={() => handleBlur('country')}
                disabled={isLoading}
              >
                <option value="">Оберіть країну</option>
                <option value="ukraine">🇺🇦 Україна</option>
                <option value="poland">🇵🇱 Польща</option>
                <option value="germany">🇩🇪 Німеччина</option>
                <option value="usa">🇺🇸 США</option>
              </select>
              {errors.country && touched.country && (
                <span className="field-error">{errors.country}</span>
              )}
            </div>

            <div className="form-group">
              <select
                className={`${errors.role && touched.role ? 'input-error' : ''}`}
                value={data.role}
                onChange={(e) => handleChange('role', e.target.value)}
                onBlur={() => handleBlur('role')}
                disabled={isLoading}
              >
                <option value="user">Користувач</option>
                <option value="seller">Продавець</option>
              </select>
              {errors.role && touched.role && (
                <span className="field-error">{errors.role}</span>
              )}
            </div>

            <div className="form-group checkbox-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  checked={data.acceptTerms}
                  onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                  onBlur={() => handleBlur('acceptTerms')}
                  disabled={isLoading}
                />
                <span>
                   <Link to="/terms" target="_blank">умови використання</Link>
                </span>
              </div>
              {errors.acceptTerms && touched.acceptTerms && (
                <span className="field-error">{errors.acceptTerms}</span>
              )}
            </div>

            <div className="form-group checkbox-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  checked={data.acceptPrivacy}
                  onChange={(e) => handleChange('acceptPrivacy', e.target.checked)}
                  onBlur={() => handleBlur('acceptPrivacy')}
                  disabled={isLoading}
                />
                <span>
                   <Link to="/privacy" target="_blank">політику конфіденційності</Link>
                </span>
              </div>
              {errors.acceptPrivacy && touched.acceptPrivacy && (
                <span className="field-error">{errors.acceptPrivacy}</span>
              )}
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <div className="btn-loading">
                  <div className="btn-spinner" />
                  Реєстрація...
                </div>
              ) : (
                'Зареєструватися'
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Вже є акаунт?{' '}
              <Link to="/login">Увійти</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
