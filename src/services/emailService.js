class EmailService {
  static async sendVerificationEmail(email, token) {
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      return await response.json();
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  static async verifyEmail(token) {
    try {
      const response = await fetch(`/api/auth/verify-email/${token}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Email verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }
}

export default EmailService;