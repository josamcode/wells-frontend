import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { GlobeAltIcon, EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ForgotPassword = memo(() => {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      toast.success(t('auth.passwordResetInstructionsSent'));
    }, 1500);
  }, []);

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
          Back to login
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-8">
          {!sent ? (
            <>
              {/* Icon */}
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <EnvelopeIcon className="w-8 h-8 text-primary-600" />
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-secondary-900">
                  {t('auth.forgotPassword')}
                </h1>
                <p className="mt-2 text-secondary-500">
                  {t('auth.forgotPasswordDescription') || 'Enter your email and we\'ll send you instructions to reset your password.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label={t('auth.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  icon={EnvelopeIcon}
                />

                <Button type="submit" fullWidth loading={loading} size="lg">
                  {t('auth.sendResetInstructions') || 'Send Reset Instructions'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 mb-2">
                {t('auth.checkYourEmail') || 'Check your email'}
              </h2>
              <p className="text-secondary-500 mb-6">
                {t('auth.resetInstructionsSentTo', { email }) || `We've sent password reset instructions to `}<strong>{email}</strong>
              </p>
              <Link to="/login">
                <Button variant="secondary" fullWidth>
                  {t('auth.backToLogin') || 'Back to Login'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ForgotPassword.displayName = 'ForgotPassword';

export default ForgotPassword;
