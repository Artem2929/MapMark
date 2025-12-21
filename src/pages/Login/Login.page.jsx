import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormValidation } from '../../hooks/useFormValidation';
import { loginSchema } from './Login.schema';
import { authService } from '../../services/auth.service';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate
  } = useFormValidation({ email: '', password: '' }, loginSchema);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const response = await authService.login(data);
      localStorage.setItem('accessToken', response.accessToken);
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Помилка входу');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !Object.values(errors).some(Boolean) && 
                     data.email && data.password;

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-wrapper">
          <h1 className="login-title">Вхід</h1>
          <p className="login-subtitle">Увійдіть до свого акаунту</p>

          <div className="error-container">
            {apiError && (
              <div className="error-message">{apiError}</div>
            )}
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                className={`${errors.email && touched.email ? 'input-error' : ''}`}
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="Email"
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
                placeholder="Пароль"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👀' : '🙈'}
              </button>
              {errors.password && touched.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <div className="btn-loading">
                  <div className="btn-spinner" />
                  Вхід...
                </div>
              ) : (
                'Увійти'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Немає акаунту?{' '}
              <Link to="/register">Зареєструватися</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;