import axiosInstance from '../api/axiosInstance';
import type {
  AuthResponse,
  ApiResponse,
  LoginCredentials,
  ResetPasswordData,
  UserResponse,
  User,
} from '../utils';

export const authService = {
  /**
   * Send OTP for signup
   */
  sendSignupOTP: async (email: string): Promise<ApiResponse> => {
    const response = await axiosInstance.post<ApiResponse>('/auth/send-otp', { email });
    return response.data;
  },

  /**
   * Signup without OTP (Admin creates user directly)
   */
  signup: async (
    name: string,
    email: string,
    password: string,
    role: 'admin' | 'user'
  ): Promise<ApiResponse> => {
    const data = { name, email, password, role };
    const response = await axiosInstance.post<ApiResponse>('/auth/signup', data);
    return response.data;
  },



  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const credentials: LoginCredentials = { email, password };
    const response = await axiosInstance.post<AuthResponse>('/auth/signin', credentials);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Send password reset OTP
   */
  sendPasswordResetOTP: async (email: string): Promise<ApiResponse> => {
    const response = await axiosInstance.post<ApiResponse>('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    const data: ResetPasswordData = { email, otp, newPassword };
    const response = await axiosInstance.post<ApiResponse>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<ApiResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axiosInstance.post<ApiResponse>('/auth/logout', {
      refreshToken,
    });
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return response.data;
  },

  /**
   * Get current user details
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await axiosInstance.get<UserResponse>('/auth/me');
    return response.data;
  },


  /**
   * Get all users (Admin only)
   */
  getAllUsers: async (): Promise<{ success: boolean; users: User[] }> => {
    const response = await axiosInstance.get('/auth/users');
    return response.data;
  },
};
