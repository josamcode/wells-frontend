import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { toast } from 'react-toastify';
import i18n from '../i18n';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      // Check if user is a client (stored in localStorage)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.isClient) {
          // For clients, use stored user data (no profile endpoint)
          setUser(parsedUser);
          setLoading(false);
          return;
        }
      }
      const response = await authAPI.getProfile();
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(i18n.t('auth.loginSuccess'));
      return true;
    } catch (error) {
      const message = error.response?.data?.message || i18n.t('auth.loginFailed');
      toast.error(message);
      return false;
    }
  };

  const clientSendOTP = async (email) => {
    try {
      await authAPI.clientSendOTP(email);
      toast.success(i18n.t('auth.otpSent') || 'OTP sent to your email');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || i18n.t('auth.failedToSendOTP') || 'Failed to send OTP';
      toast.error(message);
      return false;
    }
  };

  const clientLogin = async (email, otp) => {
    try {
      const response = await authAPI.clientLogin(email, otp);
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(i18n.t('auth.loginSuccess'));
      return true;
    } catch (error) {
      const message = error.response?.data?.message || i18n.t('auth.loginFailed');
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info(i18n.t('auth.logoutSuccess'));
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      toast.success(i18n.t('auth.profileUpdated'));
      return true;
    } catch (error) {
      toast.error(i18n.t('auth.failedToUpdateProfile'));
      return false;
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    // Add permission checking logic based on role
    return true;
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    token,
    loading,
    login,
    clientSendOTP,
    clientLogin,
    logout,
    updateProfile,
    hasPermission,
    hasRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

