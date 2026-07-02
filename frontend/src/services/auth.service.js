import axiosInstance from '../api/axiosInstance';

class AuthService {
  async register(data) {
    return await axiosInstance.post('/v1/auth/register', data);
  }

  async sendRegistrationOtp(email) {
    return await axiosInstance.post('/v1/auth/send-registration-otp', { email });
  }

  async verifyRegistrationOtp(email, otp) {
    return await axiosInstance.post('/v1/auth/verify-registration-otp', { email, otp });
  }

  async login(email, password) {
    return await axiosInstance.post('/v1/auth/login', { email, password });
  }

  async sendLoginOtp(email) {
    return await axiosInstance.post('/v1/auth/send-login-otp', { email });
  }

  async verifyLoginOtp(email, otp, rememberMe = false) {
    return await axiosInstance.post('/v1/auth/verify-login-otp', { email, otp, rememberMe });
  }

  async forgotPassword(email) {
    return await axiosInstance.post('/v1/auth/forgot-password', { email });
  }

  async resetPassword(email, otp, password, confirmPassword) {
    return await axiosInstance.post('/v1/auth/reset-password', { email, otp, password, confirmPassword });
  }

  async refreshToken(token = null) {
    return await axiosInstance.post('/v1/auth/refresh-token', { refreshToken: token });
  }

  async logout(token = null) {
    return await axiosInstance.post('/v1/auth/logout', { refreshToken: token });
  }

  async logoutAll() {
    return await axiosInstance.post('/v1/auth/logout-all');
  }

  async getMe() {
    try {
      return await axiosInstance.get('/v1/auth/me');
    } catch (err) {
      // If backend is not running during local development, provide a safe mock
      // so the UI can render and be tested without an active API server.
      // Preserve original error for non-development environments.
      if (process.env.NODE_ENV === 'development') {
        console.warn('auth.getMe: backend unreachable, returning dev mock user');
        return {
          success: true,
          data: {
            user: {
              id: 'dev-user',
              _id: 'dev-user',
              firstName: 'Tejas',
              lastName: 'Patil',
              email: 'tejas@example.com',
              researcherType: 'academic',
              country: 'India',
              phone: ''
            },
            profile: {
              profileCompletion: 60,
              institution: 'Research Connect University',
              department: 'Computer Science',
              designation: 'Researcher'
            }
          }
        };
      }
      throw err;
    }
  }
}

export default new AuthService();
