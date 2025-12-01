import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { formatDate } from '../../utils/helpers';
import { PlusIcon } from '@heroicons/react/24/outline';

const ReportsList = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { hasRole } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    status: '',
    reportType: '',
  });

  // View state: default to cards on mobile, table on desktop
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('reportsView');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'cards' : 'table';
  });

  useEffect(() => {
    fetchReports(1);
  }, [filters]);

  const fetchReports = async (page) => {
    setLoading(true);
    try {
      const response = await reportsAPI.getAll({ ...filters, page, limit: 10 });
      setReports(response.data.data.reports);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: t('reports.reportNumber'), accessor: 'reportNumber' },
    {
      header: t('reports.reportTitle'),
      accessor: 'title',
      render: (row) => language === 'ar' && row.titleAr ? row.titleAr : row.title
    },
    {
      header: t('projects.projectName'),
      render: (row) => {
        const projectName = language === 'ar' && row.project?.projectNameAr
          ? row.project.projectNameAr
          : row.project?.projectName;
        return projectName || t('common.n/a');
      },
    },
    {
      header: t('reports.reportType'),
      render: (row) => t(`reports.types.${row.reportType}`),
    },
    {
      header: t('reports.status'),
      render: (row) => (
        <Badge status={row.status}>{t(`reports.statuses.${row.status}`)}</Badge>
      ),
    },
    {
      header: t('reports.submittedBy'),
      render: (row) => row.submittedBy?.fullName || t('common.n/a'),
    },
    {
      header: t('common.date'),
      render: (row) => formatDate(row.submittedAt || row.createdAt),
    },
  ];

  const statusOptions = [
    { value: 'draft', label: t('reports.statuses.draft') },
    { value: 'submitted', label: t('reports.statuses.submitted') },
    { value: 'under_review', label: t('reports.statuses.under_review') },
    { value: 'approved', label: t('reports.statuses.approved') },
    { value: 'rejected', label: t('reports.statuses.rejected') },
  ];

  const typeOptions = [
    { value: 'daily', label: t('reports.types.daily') },
    { value: 'weekly', label: t('reports.types.weekly') },
    { value: 'monthly', label: t('reports.types.monthly') },
    { value: 'milestone', label: t('reports.types.milestone') },
    { value: 'final', label: t('reports.types.final') },
  ];

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem('reportsView', newView);
  };

  const handleItemClick = (row) => {
    window.location.href = `/reports/${row._id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
        <div className="flex items-center gap-4">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          {hasRole('contractor') && (
            <Link to="/reports/new">
              <Button>
                <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                {t('reports.newReport')}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={t('reports.status')}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={statusOptions}
          />
          <Select
            label={t('reports.reportType')}
            value={filters.reportType}
            onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
            options={typeOptions}
          />
        </div>

        {view === 'table' ? (
          <Table
            columns={columns}
            data={reports}
            loading={loading}
            onRowClick={handleItemClick}
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
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={fetchReports}
        />
      </Card>
    </div>
  );
};

export default ReportsList;

