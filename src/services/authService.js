import { translateAuthError } from '../utils/errorTranslations';

const API_BASE_URL = 'http://localhost:3000/api';

class AuthService {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          const error = new Error('Невірний email або пароль');
          error.message = translateAuthError(error);
          throw error;
        } else if (response.status === 429) {
          const error = new Error('Забагато спроб входу. Спробуйте пізніше');
          error.message = translateAuthError(error);
          throw error;
        } else if (response.status === 400) {
          const error = new Error('Перевірте правильність введених даних');
          error.message = translateAuthError(error);
          throw error;
        } else if (response.status === 500) {
          const error = new Error('Помилка сервера. Спробуйте пізніше');
          error.message = translateAuthError(error);
          throw error;
        }
        const error = new Error(data.message || 'Помилка входу');
        error.message = translateAuthError(error);
        throw error;
      }

      localStorage.setItem('accessToken', data.data.token);
      localStorage.setItem('userId', data.data.user.id);
      localStorage.setItem('userEmail', data.data.user.email);
      localStorage.setItem('userName', data.data.user.name);

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const translatedError = new Error('Помилка підключення до сервера');
        translatedError.message = translateAuthError(translatedError);
        throw translatedError;
      }
      throw error;
    }
  }

  async register(name, email, password, country, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          password,
          country,
          role
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Користувач з таким email вже існує');
        } else if (response.status === 400) {
          if (data.errors && data.errors.length > 0) {
            throw new Error(data.errors[0].msg || 'Помилка валідації');
          }
          throw new Error('Перевірте правильність введених даних');
        } else if (response.status === 429) {
          throw new Error('Забагато спроб реєстрації. Спробуйте пізніше');
        } else if (response.status === 500) {
          throw new Error('Помилка сервера. Спробуйте пізніше');
        }
        throw new Error(data.message || 'Помилка реєстрації');
      }

      localStorage.setItem('accessToken', data.data.token);
      localStorage.setItem('userId', data.data.user.id);
      localStorage.setItem('userEmail', data.data.user.email);
      localStorage.setItem('userName', data.data.user.name);

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Помилка підключення до сервера');
      }
      throw error;
    }
  }

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }

    return data;
  }



  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userImage');
    localStorage.removeItem('authProvider');
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No access token');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  getCurrentUser() {
    return {
      id: localStorage.getItem('userId'),
      email: localStorage.getItem('userEmail'),
      name: localStorage.getItem('userName'),
      image: localStorage.getItem('userImage'),
      authProvider: localStorage.getItem('authProvider') || 'local',
    };
  }
}

export default new AuthService();