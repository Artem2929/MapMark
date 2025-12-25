class AuthService {
  async login(credentials) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockUser = {
      email: credentials.email,
      name: 'Test User',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    }
    
    return mockUser
  }

  async register(userData) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockUser = {
      email: userData.email,
      name: userData.name,
      country: userData.country,
      role: userData.role,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    }
    
    return mockUser
  }

  async logout() {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return true
  }

  async refreshToken(refreshToken) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token'
    }
  }
}

export const authService = new AuthService()