import React, { useState, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { GlobeAltIcon, LockClosedIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ResetPassword = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      toast.success(t('auth.passwordResetSuccess'));
    }, 1500);
  }, [formData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-secondary-100 px-4 py-12">
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

      <div className="w-full max-w-md animate-fade-in">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-secondary-500 hover:text-secondary-700 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t('auth.backToLogin') || 'Back to login'}
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-8">
          {!success ? (
            <>
              {/* Icon */}
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LockClosedIcon className="w-8 h-8 text-primary-600" />
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-secondary-900">
                  {t('auth.resetPassword') || 'Reset Password'}
                </h1>
                <p className="mt-2 text-secondary-500">
                  Create a new password for your account.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    {t('auth.newPassword')} <span className="text-danger-500">*</span>
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
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Input
                  label={t('auth.confirmPassword')}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  icon={LockClosedIcon}
                />

                <div className="text-xs text-secondary-500 bg-secondary-50 rounded-lg p-3">
                  {t('auth.passwordMinLength')}
                </div>

                <Button type="submit" fullWidth loading={loading} size="lg">
                  {t('auth.resetPassword')}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 mb-2">
                {t('auth.passwordResetSuccess')}
              </h2>
              <p className="text-secondary-500 mb-6">
                {t('auth.passwordResetSuccessMessage') || 'Your password has been updated. You can now login with your new password.'}
              </p>
              <Link to="/login">
                <Button fullWidth>
                  {t('auth.continueToLogin') || 'Continue to Login'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ResetPassword.displayName = 'ResetPassword';

export default ResetPassword;
