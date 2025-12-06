import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { reportsAPI } from '../../api/reports';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import CardView from '../../components/common/CardView';
import ViewToggle from '../../components/common/ViewToggle';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import { SearchInput } from '../../components/common/Input';
import { formatDate } from '../../utils/helpers';
import { PlusIcon, DocumentTextIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const ReportsList = memo(() => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '' });
  const [searchValue, setSearchValue] = useState('');

  // View state with persistence
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('reportsView');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'cards' : 'table';
  });

  const fetchReports = useCallback(async (page) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 10 };
      if (searchValue.trim()) {
        params.search = searchValue.trim();
      }
      const response = await reportsAPI.getAll(params);
      setReports(response.data.data.reports);
      setPagination(response.data.data.pagination);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [filters, searchValue]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReports(1);
    }, searchValue ? 400 : 0);
    return () => clearTimeout(timeoutId);
  }, [filters.status, searchValue, fetchReports]);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  }, []);

  const statusOptions = useMemo(() => [
    { value: 'draft', label: t('reports.statuses.draft') },
    { value: 'submitted', label: t('reports.statuses.submitted') },
    { value: 'under_review', label: t('reports.statuses.under_review') },
    { value: 'approved', label: t('reports.statuses.approved') },
    { value: 'rejected', label: t('reports.statuses.rejected') },
  ], [t]);

  const columns = useMemo(() => [
    {
      header: t('reports.reportNumber'),
      accessor: 'reportNumber',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-secondary-900">
          {row.reportNumber}
        </span>
      ),
    },
    {
      header: t('reports.reportTitle'),
      accessor: 'title',
      render: (row) => {
        const displayValue = language === 'ar' && row.titleAr ? row.titleAr : row.title;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-5 h-5 text-success-600" />
            </div>
            <span className="font-medium text-secondary-900 truncate max-w-[200px]">
              {displayValue}
            </span>
          </div>
        );
      },
    },
    {
      header: t('projects.projectName'),
      render: (row) => {
        const projectName = language === 'ar' && row.project?.projectNameAr
          ? row.project.projectNameAr
          : row.project?.projectName;
        return (
          <span className="text-secondary-600">
            {projectName || t('common.n/a')}
          </span>
        );
      },
    },
    {
      header: t('reports.status'),
      render: (row) => (
        <Badge status={row.status} dot>
          {t(`reports.statuses.${row.status}`)}
        </Badge>
      ),
    },
    {
      header: t('reports.submittedBy'),
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-secondary-900 font-medium">
            {row.submittedBy?.fullName || t('common.n/a')}
          </span>
          {row.project?.country && (
            <span className="text-xs text-secondary-500 mt-0.5">
              {row.project.country}
            </span>
          )}
        </div>
      ),
    },
    {
      header: t('common.date'),
      render: (row) => (
        <span className="text-secondary-500 text-sm">
          {formatDate(row.submittedAt || row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Drive',
      render: (row) => {
        if (!row.googleDriveUrl) return <span className="text-secondary-300">—</span>;
        return (
          <a
            href={row.googleDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all"
            title={t('reports.openInGoogleDrive')}
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </a>
        );
      },
    },
  ], [t, language]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
    localStorage.setItem('reportsView', newView);
  }, []);

  const handleItemClick = useCallback((row) => {
    navigate(`/reports/${row._id}`);
  }, [navigate]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('reports.title')}</h1>
          <p className="section-subtitle">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          {hasRole('contractor') && (
            <Link to="/reports/new">
              <Button icon={PlusIcon}>
                {t('reports.newReport')}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content Card */}
      <Card className="overflow-hidden px-0">
        {/* Filters */}
        <div className="p-0 border-b border-secondary-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchValue}
              onChange={handleSearchChange}
              onClear={clearSearch}
              placeholder={t('reports.searchPlaceholder')}
              className="flex-1 max-w-md"
            />
            <Select
              value={filters.status}
              onChange={handleFilterChange}
              options={statusOptions}
              placeholder={t('common.allStatuses')}
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {/* Data View */}
        <div className="p-3 px-0">
          {view === 'table' ? (
            <Table
              columns={columns}
              data={reports}
              loading={loading}
              onRowClick={handleItemClick}
              emptyMessage={t('reports.noReports')}
            />
          ) : (
            <CardView
              data={reports}
              columns={columns}
              loading={loading}
              onItemClick={handleItemClick}
              emptyMessage={t('reports.noReports')}
            />
          )}
        </div>

        {/* Pagination */}
        <div className="px-3 pb-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchReports}
          />
        </div>
      </Card>
    </div>
  );
});

ReportsList.displayName = 'ReportsList';

export default ReportsList;
