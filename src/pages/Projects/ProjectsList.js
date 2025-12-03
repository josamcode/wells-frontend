import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectsAPI } from '../../api/projects';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import CardView from '../../components/common/CardView';
import ViewToggle from '../../components/common/ViewToggle';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/helpers';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ProjectsList = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [searchValue, setSearchValue] = useState('');

  // View state: default to cards on mobile, table on desktop
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('projectsView');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'cards' : 'table';
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProjects(1);
    }, searchValue ? 500 : 0); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const fetchProjects = async (page) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (searchValue.trim()) {
        params.search = searchValue.trim();
      }
      const response = await projectsAPI.getAll(params);
      setProjects(response.data.data.projects);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const clearSearch = () => {
    setSearchValue('');
  };

  const columns = [
    { header: t('projects.projectNumber'), accessor: 'projectNumber' },
    {
      header: t('projects.projectName'),
      accessor: 'projectName',
      render: (row) => language === 'ar' && row.projectNameAr ? row.projectNameAr : row.projectName
    },
    { header: t('projects.country'), accessor: 'country' },
    {
      header: t('projects.status'),
      render: (row) => (
        <Badge status={row.status}>{t(`projects.statuses.${row.status}`)}</Badge>
      ),
    },
    {
      header: t('projects.progress'),
      render: (row) => `${row.progress}%`,
    },
    {
      header: t('projects.contractor'),
      render: (row) => row.contractor?.fullName || t('common.n/a'),
    },
    {
      header: t('common.date'),
      render: (row) => formatDate(row.createdAt),
    },
  ];

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem('projectsView', newView);
  };

  const handleItemClick = (row) => {
    window.location.href = `/projects/${row._id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('projects.title')}</h1>
        <div className="flex items-center gap-4">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <Link to="/projects/new">
            <Button>
              <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
              {t('projects.newProject')}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        {/* Search Input */}
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={t('common.search') + '... (Project Number, Name, Description, Country, etc.)'}
            className="block w-full ltr:pl-10 rtl:pr-10 ltr:pr-10 rtl:pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-3 rtl:pl-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {view === 'table' ? (
          <Table
            columns={columns}
            data={projects}
            loading={loading}
            onRowClick={handleItemClick}
          />
        ) : (
          <CardView
            data={projects}
            columns={columns}
            loading={loading}
            onItemClick={handleItemClick}
            emptyMessage={t('projects.noProjects')}
          />
        )}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={fetchProjects}
        />
      </Card>
    </div>
  );
};

export default ProjectsList;

