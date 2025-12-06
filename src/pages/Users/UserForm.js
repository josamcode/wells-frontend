import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usersAPI } from '../../api/users';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { COUNTRIES } from '../../utils/constants';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const UserForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [setPassword, setSetPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'viewer',
    phone: '',
    organization: '',
    country: '',
    password: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await usersAPI.getById(id);
      const user = response.data.data;
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || 'viewer',
        phone: user.phone || '',
        organization: user.organization || '',
        country: user.country || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } catch (error) {
      toast.error(t('users.failedToFetch') || 'Failed to fetch user');
      navigate('/users');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data - only include password if it's set
      const submitData = { ...formData };
      if (!setPassword || !submitData.password || submitData.password.trim() === '') {
        delete submitData.password;
      }

      if (isEditMode) {
        await usersAPI.update(id, submitData);
        toast.success(t('users.userUpdated') || 'User updated successfully');
      } else {
        await usersAPI.create(submitData);
        const message = submitData.password
          ? t('users.userCreatedWithPassword') || 'User created successfully with the provided password.'
          : t('users.userCreated') || 'User created successfully. Temporary password sent via email.';
        toast.success(message);
      }
      navigate('/users');
    } catch (error) {
      toast.error(error.response?.data?.message || t('users.failedToSave') || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'super_admin', label: t('users.roles.super_admin') },
    { value: 'admin', label: t('users.roles.admin') },
    { value: 'project_manager', label: t('users.roles.project_manager') },
    { value: 'contractor', label: t('users.roles.contractor') },
    { value: 'viewer', label: t('users.roles.viewer') },
  ];

  const countryOptions = COUNTRIES.map((country) => ({
    value: country,
    label: country,
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEditMode ? t('common.edit') : t('common.create')} {t('users.title')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title={t('users.userInformation')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('users.fullName')}
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="md:col-span-2"
            />
            <Input
              label={t('users.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEditMode}
              className="md:col-span-2"
            />
            {/* Password field */}
            <div className="md:col-span-2">
              {!isEditMode ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="setPassword"
                      checked={setPassword}
                      onChange={(e) => {
                        setSetPassword(e.target.checked);
                        if (!e.target.checked) {
                          setFormData({ ...formData, password: '' });
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="setPassword" className="text-sm font-medium text-gray-700">
                      {t('users.setPassword') || 'Set password (leave unchecked to auto-generate)'}
                    </label>
                  </div>
                  {setPassword && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        {t('auth.password')}
                      </label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder={t('users.passwordPlaceholder') || 'Enter password (min 8 characters)'}
                          minLength={8}
                          className="w-full ltr:pr-12 rtl:pl-12 px-4 py-3 bg-white border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 transition-all duration-200 hover:border-secondary-300 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-4 rtl:pl-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="setPasswordEdit"
                      checked={setPassword}
                      onChange={(e) => {
                        setSetPassword(e.target.checked);
                        if (!e.target.checked) {
                          setFormData({ ...formData, password: '' });
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="setPasswordEdit" className="text-sm font-medium text-gray-700">
                      {t('users.changePassword') || 'Change password'}
                    </label>
                  </div>
                  {setPassword && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        {t('auth.newPassword')}
                      </label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder={t('users.passwordPlaceholder') || 'Enter new password (min 8 characters)'}
                          minLength={8}
                          className="w-full ltr:pr-12 rtl:pl-12 px-4 py-3 bg-white border border-secondary-200 rounded-xl text-secondary-900 placeholder-secondary-400 transition-all duration-200 hover:border-secondary-300 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-4 rtl:pl-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Input
              label={t('users.phone')}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Select
              label={t('users.role')}
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              required
            />
            <Input
              label={t('users.organization')}
              name="organization"
              value={formData.organization}
              onChange={handleChange}
            />
            <Select
              label={t('projects.country')}
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={countryOptions}
            />
            {isEditMode && (
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ltr:ml-2 rtl:mr-2 text-sm text-gray-700">
                    {t('users.isActive')}
                  </span>
                </label>
              </div>
            )}
          </div>
        </Card>

        {!isEditMode && !setPassword && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>{t('common.note')}:</strong> {t('users.tempPasswordNote')}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={loading}>
            {isEditMode ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;

