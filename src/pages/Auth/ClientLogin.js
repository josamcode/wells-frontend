import React, { useState, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { GlobeAltIcon, PhoneIcon } from '@heroicons/react/24/outline';

const ClientLogin = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientLogin } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [formData, setFormData] = useState({ phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = t('auth.phoneRequired') || 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const success = await clientLogin(formData.phone.trim());
    if (success) {
      navigate('/my-projects');
    }
    setLoading(false);
  }, [formData, clientLogin, navigate, validateForm]);

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
              {t('auth.clientLoginDescription') || 'Enter your phone number to access your projects'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('auth.phone') || 'Phone Number'}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              autoFocus
              placeholder={t('auth.phonePlaceholder') || '+1234567890'}
              icon={PhoneIcon}
              error={errors.phone}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              {t('auth.login')}
            </Button>
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
