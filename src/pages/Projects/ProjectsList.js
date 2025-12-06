import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
import { SearchInput } from '../../components/common/Input';
import { formatDate } from '../../utils/helpers';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';

const ProjectsList = memo(() => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [searchValue, setSearchValue] = useState('');

  // View state with persistence
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('projectsView');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'cards' : 'table';
  });

  const fetchProjects = useCallback(async (page) => {
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
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [searchValue]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProjects(1);
    }, searchValue ? 400 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchValue, fetchProjects]);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  const columns = useMemo(() => [
    {
      header: t('projects.projectNumber'),
      accessor: 'projectNumber',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-secondary-900">
          {row.projectNumber}
        </span>
      )
    },
    {
      header: t('projects.projectName'),
      accessor: 'projectName',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <FolderIcon className="w-5 h-5 text-primary-600" />
          </div>
          <span className="font-medium text-secondary-900">
            {language === 'ar' && row.projectNameAr ? row.projectNameAr : row.projectName}
          </span>
        </div>
      )
    },
    {
      header: t('projects.country'),
      accessor: 'country',
      render: (row) => (
        <span className="text-secondary-600">{row.country}</span>
      )
    },
    {
      header: t('projects.status'),
      render: (row) => (
        <Badge status={row.status} dot>
          {t(`projects.statuses.${row.status}`)}
        </Badge>
      ),
    },
    {
      header: t('projects.progress'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden max-w-[100px]">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-secondary-700 w-10">
            {row.progress}%
          </span>
        </div>
      ),
    },
    {
      header: t('projects.contractor'),
      render: (row) => (
        <span className="text-secondary-600">
          {row.contractor?.fullName || t('common.n/a')}
        </span>
      ),
    },
    {
      header: t('common.date'),
      render: (row) => (
        <span className="text-secondary-500 text-sm">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ], [t, language]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
    localStorage.setItem('projectsView', newView);
  }, []);

  const handleItemClick = useCallback((row) => {
    window.location.href = `/projects/${row._id}`;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('projects.title')}</h1>
          <p className="section-subtitle">
            {t('projects.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <Link to="/projects/new">
            <Button icon={PlusIcon}>
              {t('projects.newProject')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Card */}
      <Card className="overflow-hidden px-0">
        {/* Search */}
        <div className="p-0 border-b border-secondary-100">
          <SearchInput
            value={searchValue}
            onChange={handleSearchChange}
            onClear={clearSearch}
            placeholder={t('projects.searchPlaceholder')}
            className="max-w-md"
          />
        </div>

        {/* Data View */}
        <div className="p-3 px-0">
          {view === 'table' ? (
            <Table
              columns={columns}
              data={projects}
              loading={loading}
              onRowClick={handleItemClick}
              emptyMessage={t('projects.noProjects')}
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
        </div>

        {/* Pagination */}
        <div className="px-3 pb-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchProjects}
          />
        </div>
      </Card>
    </div>
  );
});

ProjectsList.displayName = 'ProjectsList';

export default ProjectsList;
