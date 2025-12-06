import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usersAPI } from '../../api/users';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import CardView from '../../components/common/CardView';
import ViewToggle from '../../components/common/ViewToggle';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import { SearchInput } from '../../components/common/Input';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { formatDate, getInitials } from '../../utils/helpers';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const UsersList = memo(() => {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ role: '', isActive: '', search: '' });
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // View state with persistence
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('usersView');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'cards' : 'table';
  });

  const fetchUsers = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({ ...filters, page, limit: 10 });
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers(1);
  }, [filters, fetchUsers]);

  const handleToggleStatus = useCallback(async (user) => {
    try {
      await usersAPI.toggleStatus(user._id);
      toast.success(`${t('users.title')} ${user.isActive ? t('users.deactivated') : t('users.activated')}`);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(t('users.failedToUpdateStatus'));
    }
  }, [fetchUsers, pagination.page]);

  const handleDelete = useCallback(async () => {
    if (!selectedUser) return;
    setDeleteLoading(true);
    try {
      await usersAPI.delete(selectedUser._id);
      toast.success(t('users.userDeleted'));
      setDeleteModal(false);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(t('users.failedToDeleteUser'));
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedUser, fetchUsers, pagination.page]);

  const openDeleteModal = useCallback((e, user) => {
    e.stopPropagation();
    setSelectedUser(user);
    setDeleteModal(true);
  }, []);

  const openPasswordModal = useCallback((e, user) => {
    e.stopPropagation();
    setSelectedUser(user);
    setPasswordData({ password: '', confirmPassword: '' });
    setPasswordModal(true);
  }, []);

  const handleChangePassword = useCallback(async () => {
    if (!selectedUser) return;

    if (!passwordData.password || passwordData.password.trim() === '') {
      toast.error(t('auth.passwordRequired') || 'Password is required');
      return;
    }

    if (passwordData.password.length < 8) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }

    setPasswordLoading(true);
    try {
      await usersAPI.changePassword(selectedUser._id, passwordData.password);
      toast.success(t('users.passwordChanged') || 'Password changed successfully');
      setPasswordModal(false);
      setPasswordData({ password: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || t('users.failedToChangePassword') || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  }, [selectedUser, passwordData, t]);

  const columns = useMemo(() => [
    {
      header: t('users.fullName'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {getInitials(row.fullName)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-secondary-900 truncate">{row.fullName}</p>
            <p className="text-xs text-secondary-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: t('users.role'),
      render: (row) => (
        <Badge variant="primary">{t(`users.roles.${row.role}`)}</Badge>
      ),
    },
    {
      header: t('users.organization'),
      accessor: 'organization',
      render: (row) => (
        <span className="text-secondary-600">{row.organization || '—'}</span>
      ),
    },
    {
      header: t('users.isActive'),
      render: (row) => (
        <Badge status={row.isActive ? 'active' : 'inactive'} dot>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Last Login',
      render: (row) => (
        <span className="text-secondary-500 text-sm">
          {formatDate(row.lastLogin)}
        </span>
      ),
    },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Link to={`/users/${row._id}/edit`}>
            <button className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title={t('common.edit')}>
              <PencilIcon className="w-4 h-4" />
            </button>
          </Link>
          {hasRole('super_admin') && (
            <button
              onClick={(e) => openPasswordModal(e, row)}
              className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title={t('users.changePassword') || 'Change Password'}
            >
              <KeyIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${row.isActive
              ? 'text-danger-600 hover:bg-danger-50'
              : 'text-success-600 hover:bg-success-50'
              }`}
          >
            {row.isActive ? t('users.deactivate') : t('users.activate')}
          </button>
          {row.role !== 'super_admin' && (
            <button
              onClick={(e) => openDeleteModal(e, row)}
              className="p-2 text-secondary-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all"
              title={t('common.delete')}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ], [t, handleToggleStatus, openDeleteModal, openPasswordModal, hasRole]);

  const roleOptions = useMemo(() => [
    { value: 'super_admin', label: t('users.roles.super_admin') },
    { value: 'admin', label: t('users.roles.admin') },
    { value: 'project_manager', label: t('users.roles.project_manager') },
    { value: 'contractor', label: t('users.roles.contractor') },
    { value: 'viewer', label: t('users.roles.viewer') },
  ], [t]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
    localStorage.setItem('usersView', newView);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  }, []);

  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '' }));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('users.title')}</h1>
          <p className="section-subtitle">
            {t('users.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <Link to="/users/new">
            <Button icon={PlusIcon}>
              {t('users.newUser')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Card */}
      <Card className="overflow-hidden px-0">
        {/* Filters */}
        <div className="p-0 border-b border-secondary-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={filters.search}
              onChange={handleSearchChange}
              onClear={clearSearch}
              placeholder="Search by name or email..."
              className="flex-1 max-w-md"
            />
            <Select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              options={roleOptions}
              placeholder="All Roles"
              className="w-full sm:w-40"
            />
            <Select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              placeholder="All Status"
              className="w-full sm:w-36"
            />
          </div>
        </div>

        {/* Data View */}
        <div className="p-3 px-0">
          {view === 'table' ? (
            <Table
              columns={columns}
              data={users}
              loading={loading}
              emptyMessage={t('users.noUsers')}
            />
          ) : (
            <CardView
              data={users}
              columns={columns}
              loading={loading}
              emptyMessage={t('users.noUsers')}
            />
          )}
        </div>

        {/* Pagination */}
        <div className="px-3 pb-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchUsers}
          />
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('users.deleteUser')}
        message={t('users.deleteUserConfirm', { name: selectedUser?.fullName })}
        confirmText={t('common.delete')}
        variant="danger"
        loading={deleteLoading}
      />

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModal}
        onClose={() => {
          setPasswordModal(false);
          setPasswordData({ password: '', confirmPassword: '' });
        }}
        title={t('users.changePassword') || 'Change Password'}
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-600">
            {t('users.changePasswordFor', { name: selectedUser?.fullName }) || `Change password for ${selectedUser?.fullName}`}
          </p>

          <div className="relative">
            <Input
              label={t('auth.newPassword')}
              type={showPassword ? 'text' : 'password'}
              value={passwordData.password}
              onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
              placeholder={t('users.passwordPlaceholder') || 'Enter new password (min 8 characters)'}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute ltr:right-3 rtl:left-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <Input
            label={t('auth.confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            placeholder={t('auth.confirmPassword')}
            required
            minLength={8}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setPasswordModal(false);
                setPasswordData({ password: '', confirmPassword: '' });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleChangePassword}
              loading={passwordLoading}
            >
              {t('users.changePassword') || 'Change Password'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

UsersList.displayName = 'UsersList';

export default UsersList;
