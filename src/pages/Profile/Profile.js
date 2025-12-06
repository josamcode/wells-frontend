import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { formatDate, getInitials } from '../../utils/helpers';
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const InfoRow = memo(({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-4 border-b border-secondary-100 last:border-0">
    <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-secondary-500" />
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-secondary-900 mt-0.5">{value || 'N/A'}</p>
    </div>
  </div>
));

InfoRow.displayName = 'InfoRow';

const Profile = memo(() => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header Card */}
      <Card className="overflow-hidden" padding={false}>
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 z-10">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-glow border-4 border-white">
              {getInitials(user?.fullName)}
            </div>

            {/* Name & Role */}
            <div className="flex-1 sm:pb-2">
              <h1 className="text-2xl font-bold text-secondary-900">{user?.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="primary" size="md">
                  {t(`users.roles.${user?.role}`)}
                </Badge>
                {user?.isActive && (
                  <Badge status="active" dot size="sm">{t('common.active')}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Card */}
      <Card title={t('profile.profileInformation')}>
        <div className="divide-y divide-secondary-100">
          <InfoRow
            icon={UserIcon}
            label={t('profile.fullName')}
            value={user?.fullName}
          />
          <InfoRow
            icon={EnvelopeIcon}
            label={t('profile.emailAddress')}
            value={user?.email}
          />
          <InfoRow
            icon={ShieldCheckIcon}
            label={t('profile.role')}
            value={t(`users.roles.${user?.role}`)}
          />
          {user?.organization && (
            <InfoRow
              icon={BuildingOfficeIcon}
              label={t('profile.organization')}
              value={user?.organization}
            />
          )}
          <InfoRow
            icon={CalendarIcon}
            label={t('profile.memberSince')}
            value={formatDate(user?.createdAt)}
          />
        </div>
      </Card>

      {/* Security Card */}
      <Card title={t('profile.security')}>
        <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-secondary-900">{t('profile.password')}</p>
            <p className="text-xs text-secondary-500 mt-0.5">{t('profile.lastUpdated')}</p>
          </div>
          <button className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
            {t('profile.changePassword')}
          </button>
        </div>
      </Card>
    </div>
  );
});

Profile.displayName = 'Profile';

export default Profile;
