import React, { useState, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { GlobeAltIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';

const ClientLogin = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientSendOTP, clientLogin } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [formData, setFormData] = useState({ email: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateEmail = useCallback(() => {
    const newErrors = {};
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = t('auth.emailRequired') || 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.invalidEmail') || 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, t]);

  const validateOTP = useCallback(() => {
    const newErrors = {};
    if (!formData.otp || !formData.otp.trim()) {
      newErrors.otp = t('auth.otpRequired') || 'OTP is required';
    } else if (!/^\d{6}$/.test(formData.otp.trim())) {
      newErrors.otp = t('auth.invalidOTP') || 'OTP must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.otp, t]);

  const handleSendOTP = useCallback(async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setSendingOTP(true);
    setErrors({}); // Clear previous errors
    const success = await clientSendOTP(formData.email.trim());
    if (success) {
      setOtpSent(true);
      // Start countdown (60 seconds)
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Set error on email field if OTP sending failed
      setErrors(prev => ({ ...prev, email: t('auth.emailNotFound') || 'No projects found for this email address' }));
    }
    setSendingOTP(false);
  }, [formData.email, clientSendOTP, validateEmail, t]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateOTP()) {
      return;
    }

    setLoading(true);
    const success = await clientLogin(formData.email.trim(), formData.otp.trim());
    if (success) {
      navigate('/my-projects');
    }
    setLoading(false);
  }, [formData, clientLogin, navigate, validateOTP]);

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
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">
              {t('auth.clientLogin') || 'Client Login'}
            </h2>
            <p className="mt-2 text-secondary-500">
              {otpSent
                ? t('auth.enterOTP') || 'Enter the OTP sent to your email'
                : t('auth.clientLoginDescription') || 'Enter your email to receive a verification code'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={otpSent ? handleSubmit : handleSendOTP} className="space-y-5">
            <Input
              label={t('auth.email') || 'Email'}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus={!otpSent}
              placeholder={t('auth.emailPlaceholder') || 'your.email@example.com'}
              icon={EnvelopeIcon}
              error={errors.email}
              disabled={otpSent}
            />

            {otpSent && (
              <>
                <Input
                  label={t('auth.otp') || 'Verification Code'}
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  autoFocus
                  placeholder="000000"
                  icon={KeyIcon}
                  error={errors.otp}
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
                {countdown > 0 && (
                  <p className="text-sm text-secondary-500 text-center">
                    {t('auth.resendOTPIn') || 'Resend OTP in'} {countdown}s
                  </p>
                )}
              </>
            )}

            <Button
              type="submit"
              fullWidth
              loading={otpSent ? loading : sendingOTP}
              size="lg"
            >
              {otpSent
                ? t('auth.login') || 'Login'
                : t('auth.receiveOTP') || 'Receive OTP'}
            </Button>

            {otpSent && countdown === 0 && (
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={handleSendOTP}
                disabled={sendingOTP}
                size="lg"
              >
                {t('auth.resendOTP') || 'Resend OTP'}
              </Button>
            )}

            {otpSent && (
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => {
                  setOtpSent(false);
                  setFormData(prev => ({ ...prev, otp: '' }));
                  setCountdown(0);
                }}
                size="sm"
              >
                {t('auth.changeEmail') || 'Change Email'}
              </Button>
            )}
          </form>

          {/* Link to regular login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {t('auth.regularLogin') || 'Staff Login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

ClientLogin.displayName = 'ClientLogin';

export default ClientLogin;
