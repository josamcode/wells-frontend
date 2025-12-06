import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/common/Button';
import { HomeIcon, ArrowLeftIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

const Unauthorized = memo(() => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-secondary-100 px-4">
      <div className="text-center max-w-lg animate-fade-in">
        {/* 403 Illustration */}
        <div className="relative mb-8">
          <div className="text-[180px] font-bold text-secondary-100 select-none leading-none">
            403
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-danger-100 flex items-center justify-center">
              <ShieldExclamationIcon className="w-16 h-16 text-danger-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-secondary-900 mb-3">
          {t('errors.unauthorized') || 'Access Denied'}
        </h1>
        <p className="text-secondary-500 mb-8 text-lg">
          {t('errors.unauthorizedDescription') || "You don't have permission to access this page. Please contact your administrator."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => window.history.back()} variant="secondary" icon={ArrowLeftIcon}>
            Go Back
          </Button>
          <Link to="/">
            <Button icon={HomeIcon}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
});

Unauthorized.displayName = 'Unauthorized';

export default Unauthorized;
