import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormValidation } from '../../hooks/useFormValidation';
import { registerSchema } from './Register.schema';
import { authService } from '../../services/auth.service';
import styles from './Register.styles.module.css';

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
    <div className={styles.page}>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Реєстрація</h1>
          <p className={styles.subtitle}>Створіть новий акаунт</p>

          {apiError && (
            <div className={styles.error}>{apiError}</div>
          )}

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>Ім'я</label>
              <input
                type="text"
                className={`${styles.input} ${errors.name && touched.name ? styles.error : ''}`}
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Ваше ім'я"
                disabled={isLoading}
              />
              {errors.name && touched.name && (
                <span className={styles.fieldError}>{errors.name}</span>
              )}
            </div>

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
              {passwordStrength && (
                <div className={`${styles.passwordStrength} ${styles[passwordStrength]}`}>
                  {passwordStrength === 'weak' && 'Слабкий пароль'}
                  {passwordStrength === 'medium' && 'Середній пароль'}
                  {passwordStrength === 'strong' && 'Сильний пароль'}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Підтвердіть пароль</label>
              <div className={styles.passwordField}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`${styles.input} ${errors.confirmPassword && touched.confirmPassword ? styles.error : ''}`}
                  value={data.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Повторіть пароль"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <span className={styles.fieldError}>{errors.confirmPassword}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Країна</label>
              <select
                className={`${styles.select} ${errors.country && touched.country ? styles.error : ''}`}
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
                <span className={styles.fieldError}>{errors.country}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Роль</label>
              <select
                className={`${styles.select} ${errors.role && touched.role ? styles.error : ''}`}
                value={data.role}
                onChange={(e) => handleChange('role', e.target.value)}
                onBlur={() => handleBlur('role')}
                disabled={isLoading}
              >
                <option value="user">Користувач</option>
                <option value="seller">Продавець</option>
              </select>
              {errors.role && touched.role && (
                <span className={styles.fieldError}>{errors.role}</span>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={data.acceptTerms}
                  onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                  onBlur={() => handleBlur('acceptTerms')}
                  disabled={isLoading}
                />
                <label className={styles.checkboxLabel}>
                  Я приймаю <Link to="/terms" target="_blank">умови використання</Link>
                </label>
              </div>
              {errors.acceptTerms && touched.acceptTerms && (
                <span className={styles.fieldError}>{errors.acceptTerms}</span>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={data.acceptPrivacy}
                  onChange={(e) => handleChange('acceptPrivacy', e.target.checked)}
                  onBlur={() => handleBlur('acceptPrivacy')}
                  disabled={isLoading}
                />
                <label className={styles.checkboxLabel}>
                  Я приймаю <Link to="/privacy" target="_blank">політику конфіденційності</Link>
                </label>
              </div>
              {errors.acceptPrivacy && touched.acceptPrivacy && (
                <span className={styles.fieldError}>{errors.acceptPrivacy}</span>
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
                Реєстрація...
              </>
            ) : (
              'Зареєструватися'
            )}
          </button>

          <div className={styles.footer}>
            <p>
              Вже є акаунт?{' '}
              <Link to="/login">Увійти</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;