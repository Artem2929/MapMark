import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormValidation } from '../../hooks/useFormValidation';
import { loginSchema } from './Login.schema';
import { authService } from '../../services/auth.service';
import styles from './Login.styles.module.css';

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
    <div className={styles.page}>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Вхід</h1>
          <p className={styles.subtitle}>Увійдіть до свого акаунту</p>

          {apiError && (
            <div className={styles.error}>{apiError}</div>
          )}

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={`${styles.input} ${errors.email && touched.email ? styles.error : ''}`}
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="your@email.com"
                disabled={isLoading}
              />
              {errors.email && touched.email && (
                <span className={styles.fieldError}>{errors.email}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Пароль</label>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${errors.password && touched.password ? styles.error : ''}`}
                  value={data.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Введіть пароль"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && touched.password && (
                <span className={styles.fieldError}>{errors.password}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner} />
                Вхід...
              </>
            ) : (
              'Увійти'
            )}
          </button>

          <div className={styles.footer}>
            <p>
              Немає акаунту?{' '}
              <Link to="/register">Зареєструватися</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;