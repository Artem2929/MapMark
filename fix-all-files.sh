#!/bin/bash

echo "🔧 Масове виправлення всіх файлів..."

# Видаляємо всі пошкоджені рядки
find src/pages/ -name "*.jsx" -exec sed -i '' '/} <\/div>)/d' {} \;
find src/pages/ -name "*.jsx" -exec sed -i '' '/placeholder.*<\/div>)/d' {} \;
find src/pages/ -name "*.jsx" -exec sed -i '' '/} <\/div>)/d' {} \;

# Створюємо мінімальні робочі версії всіх проблемних файлів
echo "Створюю мінімальні версії файлів..."

# Login.jsx
cat > src/pages/auth/Login.jsx << 'EOF'
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../api/endpoints/authService';
import './Login.css';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login({ email, password });
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Помилка входу');
      }
    } catch (err) {
      setError('Помилка мережі');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Вхід</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Завантаження...' : 'Увійти'}
          </button>
        </form>
        <Link to="/register">Реєстрація</Link>
      </div>
    </div>
  );
};

export default Login;
EOF

# Register.jsx
cat > src/pages/auth/Register.jsx << 'EOF'
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../api/endpoints/authService';
import './Register.css';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.register(formData);
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.error || 'Помилка реєстрації');
      }
    } catch (err) {
      setError('Помилка мережі');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Реєстрація</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ім'я"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Пароль"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Підтвердіть пароль"
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Завантаження...' : 'Зареєструватися'}
          </button>
        </form>
        <Link to="/login">Вже є акаунт? Увійти</Link>
      </div>
    </div>
  );
};

export default Register;
EOF

echo "✅ Всі файли виправлено!"