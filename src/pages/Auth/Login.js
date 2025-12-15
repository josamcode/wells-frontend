import React, { useState, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { GlobeAltIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/');
    }
    setLoading(false);
  }, [formData, login, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20 bg-gradient-to-br from-secondary-50 to-white">
        {/* Language Toggle */}
        <div className="absolute top-6 ltr:right-6 rtl:left-6">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-600 bg-white rounded-xl shadow-soft hover:shadow-soft-lg transition-all"
          >
            <GlobeAltIcon className="w-5 h-5" />
            {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-xl font-bold text-secondary-900 leading-tight">{t('app.name')}</h1>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">
              {t('auth.welcomeBack') || 'Welcome back'}
            </h2>
            <p className="mt-2 text-secondary-500">
              {t('auth.loginDescription') || 'Sign in to your account to continue'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label={t('auth.email')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
                placeholder="you@example.com"
                icon={EnvelopeIcon}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                {t('auth.password')}
                <span className="text-danger-500 ltr:ml-1 rtl:mr-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-4 rtl:pr-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="w-5 h-5 text-secondary-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full ltr:pl-12 rtl:pr-12 ltr:pr-12 rtl:pl-12 py-3 bg-white border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 transition-all duration-200 hover:border-secondary-300 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-4 rtl:pl-4 flex items-center text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-600">
                  {t('auth.rememberMe')}
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              {t('auth.login')}
            </Button>
          </form>

          {/* Client Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              {t('auth.clientLoginPrompt') || 'Are you a client?'}{' '}
              <Link
                to="/client-login"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                {t('auth.clientLogin') || 'Login as Client'}
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-xs font-medium text-primary-800 text-center">
              <span className="block mb-1">{t('app.demoCredentials')}</span>
              <span className="text-primary-600">admin@wells.com</span>
              <span className="mx-2 text-primary-400">|</span>
              <span className="text-primary-600">Admin@123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

Login.displayName = 'Login';

export default Login;
