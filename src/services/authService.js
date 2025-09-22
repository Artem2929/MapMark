const API_BASE_URL = 'http://localhost:3000/api';

class AuthService {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Зберігаємо токен та дані користувача
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('userId', data.data.user.id);
    localStorage.setItem('userEmail', data.data.user.email);
    localStorage.setItem('userName', data.data.user.name);

    return data;
  }

  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Зберігаємо токен та дані користувача
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('userId', data.data.user.id);
    localStorage.setItem('userEmail', data.data.user.email);
    localStorage.setItem('userName', data.data.user.name);

    return data;
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
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
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
    };
  }
}

export default new AuthService();