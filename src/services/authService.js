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
          throw new Error('Невірний email або пароль');
        } else if (response.status === 429) {
          throw new Error('Забагато спроб входу. Спробуйте пізніше');
        } else if (response.status === 400) {
          throw new Error('Перевірте правильність введених даних');
        }
        throw new Error(data.message || 'Помилка входу');
      }

      localStorage.setItem('token', data.data.token);
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

  async register(name, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          password 
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
        }
        throw new Error(data.message || 'Помилка реєстрації');
      }

      localStorage.setItem('token', data.data.token);
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

  async googleLogin(googleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      // Зберігаємо токен від сервера якщо є
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Якщо сервер недоступний, продовжуємо з локальною авторизацією
        console.warn('Server unavailable, using local Google auth');
        return { success: true, local: true };
      }
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userImage');
    localStorage.removeItem('authProvider');
    localStorage.removeItem('googleToken');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
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