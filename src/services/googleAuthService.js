class GoogleAuthService {
  constructor() {
    this.clientId = (typeof process !== 'undefined' && process.env?.REACT_APP_GOOGLE_CLIENT_ID) || '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
    this.isInitialized = false;
    this.gapi = null;
  }

  async initialize() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Завантажуємо Google API
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          window.gapi.load('auth2', () => {
            this.initAuth2().then(resolve).catch(reject);
          });
        };
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        window.gapi.load('auth2', () => {
          this.initAuth2().then(resolve).catch(reject);
        });
      }
    });
  }

  async initAuth2() {
    try {
      this.gapi = window.gapi;
      await this.gapi.auth2.init({
        client_id: this.clientId,
        scope: 'profile email'
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Google Auth initialization failed:', error);
      throw error;
    }
  }

  async signIn() {
    // Якщо немає валідного Client ID, використовуємо демо режим
    if (this.clientId === '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com') {
      return this.demoSignIn();
    }

    try {
      await this.initialize();
      
      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      const profile = user.getBasicProfile();
      const authResponse = user.getAuthResponse();
      
      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl(),
        token: authResponse.access_token,
        idToken: authResponse.id_token
      };
    } catch (error) {
      console.error('Google sign in failed:', error);
      // Fallback на демо режим при помилці
      return this.demoSignIn();
    }
  }

  demoSignIn() {
    // Демо дані для тестування
    return {
      id: 'demo_google_' + Date.now(),
      name: 'Demo Google User',
      email: 'demo@gmail.com',
      imageUrl: 'https://via.placeholder.com/96x96/4285F4/ffffff?text=G',
      token: 'demo_access_token_' + Date.now(),
      idToken: 'demo_id_token_' + Date.now()
    };
  }

  async signOut() {
    try {
      if (!this.isInitialized) return;
      
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
    } catch (error) {
      console.error('Google sign out failed:', error);
    }
  }

  isSignedIn() {
    if (!this.isInitialized) return false;
    
    const authInstance = this.gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  }

  getCurrentUser() {
    if (!this.isSignedIn()) return null;
    
    const authInstance = this.gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const profile = user.getBasicProfile();
    
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl()
    };
  }
}

export default new GoogleAuthService();