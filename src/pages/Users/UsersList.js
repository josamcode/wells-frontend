import React, { useState, useEffect } from 'react';
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
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const UsersList = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ role: '', isActive: '', search: '' });
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // View state: default to cards on mobile, table on desktop
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('usersView');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'cards' : 'table';
  });

  useEffect(() => {
    fetchUsers(1);
  }, [filters]);

  const fetchUsers = async (page) => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({ ...filters, page, limit: 10 });
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await usersAPI.toggleStatus(user._id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await usersAPI.delete(selectedUser._id);
      toast.success('User deleted successfully');
      setDeleteModal(false);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const columns = [
    {
      header: t('users.fullName'),
      render: (row) => (
        <div>
          <p className="font-medium">{row.fullName}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: t('users.role'),
      render: (row) => (
        <Badge>{t(`users.roles.${row.role}`)}</Badge>
      ),
    },
    {
      header: t('users.organization'),
      accessor: 'organization',
    },
    {
      header: t('users.isActive'),
      render: (row) => (
        <Badge status={row.isActive ? 'approved' : 'cancelled'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Last Login',
      render: (row) => formatDate(row.lastLogin),
    },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/users/${row._id}/edit`}>
            <button className="text-blue-600 hover:text-blue-700 p-1">
              <PencilIcon className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`text-sm px-2 py-1 rounded ${row.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
              }`}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          {row.role !== 'super_admin' && (
            <button
              onClick={() => {
                setSelectedUser(row);
                setDeleteModal(true);
              }}
              className="text-red-600 hover:text-red-700 p-1"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const roleOptions = [
    { value: 'super_admin', label: t('users.roles.super_admin') },
    { value: 'admin', label: t('users.roles.admin') },
    { value: 'project_manager', label: t('users.roles.project_manager') },
    { value: 'contractor', label: t('users.roles.contractor') },
    { value: 'viewer', label: t('users.roles.viewer') },
  ];

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem('usersView', newView);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('users.title')}</h1>
        <div className="flex items-center gap-4">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <Link to="/users/new">
            <Button>
              <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
              {t('users.newUser')}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={t('common.search')}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by name or email..."
          />
          <Select
            label={t('users.role')}
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            options={roleOptions}
          />
          <Select
            label={t('users.isActive')}
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
        </div>

        {view === 'table' ? (
          <Table columns={columns} data={users} loading={loading} />
        ) : (
          <CardView
            data={users}
            columns={columns}
            loading={loading}
            emptyMessage={t('users.noUsers')}
          />
        )}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={fetchUsers}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{selectedUser?.fullName}</strong>? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default UsersList;

