// Чисті API функції без side effects
export const authApi = {
  async login(credentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Помилка входу')
    }
    
    return response.json()
  },

  async logout() {
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    })
    return response.ok
  },

  async refreshToken(refreshToken) {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    
    if (!response.ok) throw new Error('Token refresh failed')
    return response.json()
  }
}