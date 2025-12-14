import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../api/users';
import { projectsAPI } from '../../api/projects';
import { reportsAPI } from '../../api/reports';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading, { CardSkeleton } from '../../components/common/Loading';
import { formatDate, getInitials } from '../../utils/helpers';
import {
  PencilIcon,
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  DocumentIcon,
  EyeIcon,
  FolderIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

const InfoItem = memo(({ icon: Icon, label, value, className = '' }) => (
  <div className={`flex items-start gap-4 ${className}`}>
    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-primary-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-secondary-900 mt-0.5">{value || 'N/A'}</p>
    </div>
  </div>
));

InfoItem.displayName = 'InfoItem';

const UserDetail = memo(() => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await usersAPI.getById(id);
      setUser(response.data.data);
    } catch (error) {
      toast.error(t('users.failedToFetch') || 'Failed to fetch user');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  const fetchProjects = useCallback(async () => {
    if (user?.role !== 'contractor' && user?.role !== 'project_manager') return;

    setProjectsLoading(true);
    try {
      const filterParam = user.role === 'contractor' ? 'contractor' : 'projectManager';
      const response = await projectsAPI.getAll({ [filterParam]: id, limit: 1000 });
      setProjects(response.data.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  }, [user?.role, id]);

  const fetchReports = useCallback(async () => {
    if (user?.role !== 'contractor' && user?.role !== 'project_manager') return;

    setReportsLoading(true);
    try {
      // Fetch reports for projects where user is contractor or project manager
      const filterParam = user.role === 'contractor' ? 'contractor' : 'projectManager';
      const projectsResponse = await projectsAPI.getAll({ [filterParam]: id, limit: 1000 });
      const projectIds = (projectsResponse.data.data.projects || []).map(p => p._id);

      if (projectIds.length > 0) {
        // Fetch all reports and filter by project IDs on frontend
        // Since backend may not support multiple project IDs in one call
        const allReportsPromises = projectIds.map(projectId =>
          reportsAPI.getAll({ project: projectId, limit: 1000 }).catch(() => ({ data: { data: { reports: [] } } }))
        );
        const allReportsResponses = await Promise.all(allReportsPromises);

        // Combine and deduplicate reports
        const allReports = [];
        const reportIds = new Set();
        allReportsResponses.forEach(response => {
          const reports = response.data.data.reports || [];
          reports.forEach(report => {
            if (!reportIds.has(report._id)) {
              reportIds.add(report._id);
              allReports.push(report);
            }
          });
        });

        setReports(allReports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, [user?.role, id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchReports();
    }
  }, [user, fetchProjects, fetchReports]);

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return PhotoIcon;
    }
    return DocumentIcon;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/users">
            <Button variant="secondary" icon={ArrowLeftIcon} size="sm">
              {t('common.back')}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t('users.userDetails') || 'User Details'}
            </h1>
            <p className="text-sm text-secondary-500 mt-1">
              {t('users.viewAllUserInformation') || 'View all information about this user'}
            </p>
          </div>
        </div>
        {hasRole('super_admin') && (
          <Link to={`/users/${id}/edit`}>
            <Button icon={PencilIcon}>
              {t('common.edit')}
            </Button>
          </Link>
        )}
      </div>

      {/* User Information Card */}
      <Card title={t('users.userInformation') || 'User Information'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Avatar */}
          <div className="md:col-span-2 flex items-center gap-6 pb-6 border-b border-secondary-100">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {getInitials(user.fullName)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">{user.fullName}</h2>
              <p className="text-secondary-500 mt-1">{user.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="primary">{t(`users.roles.${user.role}`)}</Badge>
                <Badge status={user.isActive ? 'active' : 'inactive'} dot>
                  {user.isActive ? t('common.active') : t('common.inactive')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <InfoItem
            icon={EnvelopeIcon}
            label={t('users.email')}
            value={user.email}
          />
          <InfoItem
            icon={PhoneIcon}
            label={t('users.phone')}
            value={user.phone || 'N/A'}
          />
          <InfoItem
            icon={BuildingOfficeIcon}
            label={t('users.organization')}
            value={user.organization || 'N/A'}
          />
          <InfoItem
            icon={MapPinIcon}
            label={t('projects.country')}
            value={user.country || 'N/A'}
          />
          <InfoItem
            icon={UserIcon}
            label={t('users.role')}
            value={t(`users.roles.${user.role}`)}
          />
          <InfoItem
            icon={user.isActive ? CheckCircleIcon : XCircleIcon}
            label={t('users.isActive')}
            value={user.isActive ? t('common.active') : t('common.inactive')}
          />
          <InfoItem
            icon={CalendarIcon}
            label={t('users.createdAt') || 'Created At'}
            value={formatDate(user.createdAt)}
          />
          <InfoItem
            icon={CalendarIcon}
            label={t('users.lastLogin')}
            value={formatDate(user.lastLogin) || 'Never'}
          />
          <InfoItem
            icon={KeyIcon}
            label={t('users.language') || 'Language'}
            value={user.language === 'ar' ? 'العربية' : 'English'}
            className="md:col-span-2"
          />
        </div>
      </Card>

      {/* Projects Analysis - Only for Contractors and Project Managers */}
      {(user.role === 'contractor' || user.role === 'project_manager') && (
        <Card title={t('users.projectsAnalysis') || 'Projects Analysis'}>
          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loading size="md" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FolderIcon className="w-5 h-5 text-primary-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">
                      {t('users.totalProjects') || 'Total Projects'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">{projects.length}</p>
                </div>
                <div className="p-4 bg-success-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-success-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">
                      {t('users.activeProjects') || 'Active'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {projects.filter(p => p.status === 'active' || p.status === 'in_progress').length}
                  </p>
                </div>
                <div className="p-4 bg-warning-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-warning-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">
                      {t('users.completedProjects') || 'Completed'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <XCircleIcon className="w-5 h-5 text-secondary-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">
                      {t('users.onHoldProjects') || 'On Hold'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {projects.filter(p => p.status === 'on_hold' || p.status === 'cancelled').length}
                  </p>
                </div>
              </div>

              {/* Recent Projects */}
              {projects.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-secondary-900">
                      {t('users.recentProjects') || 'Recent Projects'}
                    </h3>
                    <Link to={`/projects?${user.role === 'contractor' ? 'contractor' : 'projectManager'}=${id}`}>
                      <Button variant="outline" size="sm" icon={LinkIcon}>
                        {t('users.viewAllProjects') || 'View All Projects'}
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {projects.slice(0, 5).map((project) => (
                      <Link
                        key={project._id}
                        to={`/projects/${project._id}`}
                        className="flex items-center justify-between p-3 bg-white border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary-900 truncate">
                            {project.projectName}
                          </p>
                          <p className="text-xs text-secondary-500 mt-0.5">
                            {project.projectNumber} • {t(`projects.statuses.${project.status}`)}
                          </p>
                        </div>
                        <Badge status={project.status} size="sm">
                          {t(`projects.statuses.${project.status}`)}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <FolderIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                  <p>{t('users.noProjects') || 'No projects assigned'}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Reports Analysis - Only for Contractors and Project Managers */}
      {(user.role === 'contractor' || user.role === 'project_manager') && (
        <Card title={t('users.reportsAnalysis') || 'Reports Analysis'}>
          {reportsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loading size="md" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <DocumentTextIcon className="w-5 h-5 text-primary-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">
                      {t('users.totalReports') || 'Total Reports'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">{reports.length}</p>
                </div>
                <div className="p-4 bg-success-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-success-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">
                      {t('users.approvedReports') || 'Approved'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {reports.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <div className="p-4 bg-warning-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-warning-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">
                      {t('users.pendingReports') || 'Pending'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {reports.filter(r => r.status === 'pending' || r.status === 'submitted').length}
                  </p>
                </div>
                <div className="p-4 bg-danger-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <XCircleIcon className="w-5 h-5 text-danger-600" />
                    <p className="text-xs font-medium text-secondary-500 uppercase">
                      {t('users.rejectedReports') || 'Rejected'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">
                    {reports.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
              </div>

              {/* Recent Reports */}
              {reports.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-secondary-900">
                      {t('users.recentReports') || 'Recent Reports'}
                    </h3>
                    <Link to={`/reports?${user.role === 'contractor' ? 'contractor' : 'projectManager'}=${id}`}>
                      <Button variant="outline" size="sm" icon={LinkIcon}>
                        {t('users.viewAllReports') || 'View All Reports'}
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {reports.slice(0, 5).map((report) => (
                      <Link
                        key={report._id}
                        to={`/reports/${report._id}`}
                        className="flex items-center justify-between p-3 bg-white border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary-900 truncate">
                            {report.project?.projectName || t('reports.report')} - {formatDate(report.reportDate)}
                          </p>
                          <p className="text-xs text-secondary-500 mt-0.5">
                            {report.project?.projectNumber || ''} • {t(`reports.statuses.${report.status}`)}
                          </p>
                        </div>
                        <Badge status={report.status} size="sm">
                          {t(`reports.statuses.${report.status}`)}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                  <p>{t('users.noReports') || 'No reports found'}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Account Media - Only for Contractors and Project Managers */}
      {(user.role === 'contractor' || user.role === 'project_manager') && user.media && user.media.length > 0 && (
        <Card title={t('users.accountMedia') || 'Account Media'}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.media.map((media) => {
              const Icon = getFileIcon(media.fileType);
              return (
                <div
                  key={media._id}
                  className="flex items-center gap-3 p-4 bg-white border border-secondary-200 rounded-xl hover:border-primary-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-secondary-900 truncate">{media.name}</p>
                    <p className="text-xs text-secondary-500">
                      {new Date(media.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title={t('common.view')}
                  >
                    <EyeIcon className="w-5 h-5" />
                  </a>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Additional Information */}
      <Card title={t('users.additionalInformation') || 'Additional Information'}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-2">
              {t('users.userId') || 'User ID'}
            </p>
            <p className="text-sm font-mono text-secondary-600 bg-secondary-50 p-2 rounded-lg">
              {user._id}
            </p>
          </div>
          {user.updatedAt && (
            <div>
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-2">
                {t('users.lastUpdated') || 'Last Updated'}
              </p>
              <p className="text-sm font-semibold text-secondary-900">
                {formatDate(user.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
});

UserDetail.displayName = 'UserDetail';

export default UserDetail;
