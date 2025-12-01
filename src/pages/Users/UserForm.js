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

const UserForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'viewer',
    phone: '',
    organization: '',
    country: '',
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
      toast.error('Failed to fetch user');
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
      if (isEditMode) {
        await usersAPI.update(id, formData);
        toast.success('User updated successfully');
      } else {
        await usersAPI.create(formData);
        toast.success('User created successfully. Temporary password sent via email.');
      }
      navigate('/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
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
        <Card title="User Information">
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
              label="Country"
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

        {!isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A temporary password will be generated and sent to the user's
              email. The user will be required to change it upon first login.
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

