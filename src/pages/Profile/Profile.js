import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('nav.profile')}</h1>
      
      <Card title="Profile Information">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="mt-1 text-gray-900">{user?.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <p className="mt-1 text-gray-900">{t(`users.roles.${user?.role}`)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;

