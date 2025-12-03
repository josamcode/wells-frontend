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
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import InlineEditable from '../../components/common/InlineEditable';
import Input from '../../components/common/Input';
import { toast } from 'react-toastify';

const ReportsList = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { hasRole, user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({
    status: '',
    reportType: '',
    search: '',
  });
  const [searchValue, setSearchValue] = useState('');

  // View state: default to cards on mobile, table on desktop
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('reportsView');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'cards' : 'table';
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReports(1);
    }, searchValue ? 500 : 0); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.reportType, searchValue]);

  const fetchReports = async (page) => {
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
      console.error('Failed to fetch reports:', error);
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

  // Check if user can edit a specific report
  const canEditReport = (report) => {
    if (!user) return false;

    // Super admin and admin can edit any report
    if (hasRole('super_admin', 'admin')) return true;

    // Project managers can edit reports they manage
    if (hasRole('project_manager')) return true;

    // Contractors can only edit their own draft/rejected reports
    if (hasRole('contractor')) {
      const isOwner = report.submittedBy?._id === user._id ||
        report.submittedBy === user._id;
      const isEditableStatus = ['draft', 'rejected'].includes(report.status);
      return isOwner && isEditableStatus;
    }

    return false;
  };

  const handleEditClick = (e, reportId) => {
    e.stopPropagation(); // Prevent row click
    navigate(`/reports/${reportId}/edit`);
  };

  // Handle field updates
  const handleFieldUpdate = async (reportId, field, value) => {
    try {
      await reportsAPI.update(reportId, { [field]: value });
      // Refresh the reports list
      const currentPage = pagination.page;
      await fetchReports(currentPage);
    } catch (error) {
      throw error; // Re-throw to let InlineEditable handle the error display
    }
  };

  // Check if user can edit a specific field
  const canEditField = (report, field) => {
    if (!canEditReport(report)) return false;

    // Some fields might have additional restrictions
    if (field === 'status') {
      // Only admins and project managers can change status directly
      return hasRole('super_admin', 'admin', 'project_manager');
    }

    if (field === 'reportNumber') {
      // Only admins can change report number
      return hasRole('super_admin', 'admin');
    }

    // Other fields follow general edit permissions
    return true;
  };

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

  const columns = [
    {
      header: t('reports.reportNumber'),
      accessor: 'reportNumber',
      render: (row) => (
        <InlineEditable
          value={row.reportNumber}
          onSave={(value) => handleFieldUpdate(row._id, 'reportNumber', value)}
          canEdit={canEditField(row, 'reportNumber')}
          fieldName={t('reports.reportNumber')}
          className="text-sm font-medium text-gray-900"
        />
      ),
    },
    {
      header: t('reports.reportTitle'),
      accessor: 'title',
      render: (row) => {
        // Display Arabic if exists and language is Arabic, otherwise use title
        const displayValue = language === 'ar' && row.titleAr ? row.titleAr : row.title;
        return (
          <InlineEditable
            value={row.title}
            onSave={(value) => handleFieldUpdate(row._id, 'title', value)}
            canEdit={canEditField(row, 'title')}
            displayValue={displayValue}
            fieldName={t('reports.reportTitle')}
            className="text-sm text-gray-900"
          />
        );
      },
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
    // {
    //   header: t('reports.reportType'),
    //   render: (row) => (
    //     <InlineEditable
    //       value={row.reportType}
    //       onSave={(value) => handleFieldUpdate(row._id, 'reportType', value)}
    //       canEdit={canEditField(row, 'reportType')}
    //       type="select"
    //       options={typeOptions}
    //       displayValue={t(`reports.types.${row.reportType}`)}
    //       fieldName={t('reports.reportType')}
    //       className="text-sm text-gray-700"
    //     />
    //   ),
    // },
    {
      header: t('reports.status'),
      render: (row) => {
        const canEditStatus = canEditField(row, 'status');
        if (canEditStatus) {
          return (
            <InlineEditable
              value={row.status}
              onSave={(value) => handleFieldUpdate(row._id, 'status', value)}
              canEdit={canEditStatus}
              type="select"
              options={statusOptions}
              displayValue={<Badge status={row.status}>{t(`reports.statuses.${row.status}`)}</Badge>}
              fieldName={t('reports.status')}
            />
          );
        }
        return <Badge status={row.status}>{t(`reports.statuses.${row.status}`)}</Badge>;
      },
    },
    {
      header: t('reports.submittedBy'),
      render: (row) => {
        const submittedBy = row.submittedBy?.fullName || t('common.n/a');
        const country = row.project?.country;
        return (
          <div className="flex flex-col">
            <span>{submittedBy}</span>
            {country && (
              <span className="text-xs text-gray-500 mt-0.5">{country}</span>
            )}
          </div>
        );
      },
    },
    {
      header: t('common.date'),
      render: (row) => formatDate(row.submittedAt || row.createdAt),
    },
    {
      header: 'Drive',
      render: (row) => {
        if (!row.googleDriveUrl) return <span className="text-gray-400">-</span>;
        return (
          <a
            href={row.googleDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 group"
            title="Open PDF in Google Drive"
          >
            <DocumentIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </a>
        );
      },
    },
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
        <div className="mb-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={t('common.search') + '... (Report Number, Title, Description, etc.)'}
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

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('reports.status')}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={statusOptions}
            />
            {/* <Select
              label={t('reports.reportType')}
              value={filters.reportType}
              onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
              options={typeOptions}
            /> */}
          </div>
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

