import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI } from '../../api/projects';
import { reportsAPI } from '../../api/reports';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading, { CardSkeleton } from '../../components/common/Loading';
import { ConfirmModal } from '../../components/common/Modal';
import { formatDate, formatCurrency } from '../../utils/helpers';
import {
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  FolderIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
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

const ProjectDetail = memo(() => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const response = await projectsAPI.getById(id);
      setProject(response.data.data);
    } catch (error) {
      toast.error(t('projects.failedToFetchProject'));
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchReports = useCallback(async () => {
    try {
      // Fetch all reports to get all attachments
      const response = await reportsAPI.getAll({ project: id, limit: 100 });
      setReports(response.data.data.reports);
    } catch (error) {
      // Silent fail
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchReports();
  }, [fetchProject, fetchReports]);

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await projectsAPI.delete(id);
      toast.success(t('projects.deleteProject') + ' ' + t('common.successfully'));
      navigate('/projects');
    } catch (error) {
      toast.error(t('common.failedTo') + ' ' + t('common.delete').toLowerCase() + ' ' + t('projects.title').toLowerCase());
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate]);

  const handleArchive = useCallback(async () => {
    try {
      await projectsAPI.toggleArchive(id);
      toast.success(project.isArchived ? t('projects.projectUnarchived') : t('projects.projectArchived'));
      fetchProject();
    } catch (error) {
      toast.error(t('projects.failedToArchiveProject'));
    }
  }, [id, project?.isArchived, fetchProject]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 skeleton rounded-lg" />
          <div className="h-8 w-64 skeleton rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton lines={6} />
            <CardSkeleton lines={4} />
          </div>
          <CardSkeleton lines={5} />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const canEdit = hasRole('super_admin', 'admin', 'project_manager');
  const canDelete = hasRole('super_admin', 'admin');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/projects"
            className="p-2 rounded-xl hover:bg-secondary-100 text-secondary-500 transition-all mt-1"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 tracking-tight">
                {language === 'ar' && project.projectNameAr ? project.projectNameAr : project.projectName}
              </h1>
              <Badge status={project.status} size="lg" dot>
                {t(`projects.statuses.${project.status}`)}
              </Badge>
            </div>
            <p className="text-secondary-500 mt-1 font-mono">{project.projectNumber}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 ltr:ml-11 rtl:mr-11 lg:ml-0 lg:mr-0">
          {canEdit && (
            <>
              <Link to={`/projects/${id}/edit`}>
                <Button variant="outline" size="sm" icon={PencilIcon}>
                  {t('common.edit')}
                </Button>
              </Link>
              <Button variant="secondary" size="sm" icon={ArchiveBoxIcon} onClick={handleArchive}>
                {project.isArchived ? t('projects.unarchive') : t('projects.archive')}
              </Button>
            </>
          )}
          {canDelete && (
            <Button variant="outline-danger" size="sm" icon={TrashIcon} onClick={() => setDeleteModal(true)}>
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card title={t('projects.details')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                icon={MapPinIcon}
                label={t('projects.country')}
                value={`${project.country}${project.city ? `, ${project.city}` : ''}`}
              />
              <InfoItem
                icon={UserIcon}
                label={t('projects.contractor')}
                value={project.contractor?.fullName}
              />
              <InfoItem
                icon={UserIcon}
                label={t('projects.projectManager')}
                value={project.projectManager?.fullName}
              />
              <InfoItem
                icon={CurrencyDollarIcon}
                label={t('projects.budget')}
                value={project.budget?.amount ? formatCurrency(project.budget.amount, project.budget.currency) : null}
              />
              <InfoItem
                icon={CalendarIcon}
                label={t('projects.startDate')}
                value={formatDate(project.startDate)}
              />
              <InfoItem
                icon={CalendarIcon}
                label={t('projects.expectedEndDate')}
                value={formatDate(project.expectedEndDate)}
              />
            </div>

            {(project.description || project.descriptionAr) && (
              <div className="mt-6 pt-6 border-t border-secondary-100">
                <h4 className="text-sm font-semibold text-secondary-900 mb-2">
                  {t('projects.notes')}
                </h4>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  {language === 'ar' && project.descriptionAr ? project.descriptionAr : project.description}
                </p>
              </div>
            )}
          </Card>

          {/* Well Details */}
          {project.wellDetails && (
            <Card title={t('projects.wellSpecifications')}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {project.wellDetails.depth && (
                  <div className="text-center p-4 bg-secondary-50 rounded-xl">
                    <p className="text-2xl font-bold text-secondary-900">{project.wellDetails.depth}</p>
                    <p className="text-xs text-secondary-500 mt-1">{t('projects.depthShort')}</p>
                  </div>
                )}
                {project.wellDetails.diameter && (
                  <div className="text-center p-4 bg-secondary-50 rounded-xl">
                    <p className="text-2xl font-bold text-secondary-900">{project.wellDetails.diameter}</p>
                    <p className="text-xs text-secondary-500 mt-1">{t('projects.diameter')}</p>
                  </div>
                )}
                {project.wellDetails.capacity && (
                  <div className="text-center p-4 bg-secondary-50 rounded-xl">
                    <p className="text-2xl font-bold text-secondary-900">{project.wellDetails.capacity}</p>
                    <p className="text-xs text-secondary-500 mt-1">{t('projects.capacity')}</p>
                  </div>
                )}
                {project.wellDetails.waterQuality && (
                  <div className="text-center p-4 bg-secondary-50 rounded-xl">
                    <p className="text-lg font-bold text-secondary-900">{project.wellDetails.waterQuality}</p>
                    <p className="text-xs text-secondary-500 mt-1">{t('projects.waterQuality')}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Media & Documents */}
          {(() => {
            // Collect all attachments and Google Drive URLs from all reports
            const allAttachments = [];
            const allGoogleDriveUrls = [];

            reports.forEach((report) => {
              // Collect attachments
              if (report.attachments && report.attachments.length > 0) {
                report.attachments.forEach((attachment) => {
                  allAttachments.push({
                    ...attachment,
                    reportId: report._id,
                    reportTitle: language === 'ar' && report.titleAr ? report.titleAr : report.title,
                    reportNumber: report.reportNumber,
                  });
                });
              }

              // Collect Google Drive URLs
              if (report.googleDriveUrl) {
                allGoogleDriveUrls.push({
                  url: report.googleDriveUrl,
                  reportId: report._id,
                  reportTitle: language === 'ar' && report.titleAr ? report.titleAr : report.title,
                  reportNumber: report.reportNumber,
                });
              }
            });

            const hasMedia = allAttachments.length > 0 || allGoogleDriveUrls.length > 0 || project.googleDriveFolderUrl;

            return hasMedia ? (
              <Card title={t('projects.mediaDocuments') || 'Media & Documents'}>
                <div className="space-y-4">
                  {/* Project Google Drive Folder */}
                  {project.googleDriveFolderUrl && (
                    <div className="p-4 border border-secondary-100 rounded-xl bg-secondary-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <FolderIcon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-secondary-900">
                              {t('projects.projectFolder') || 'Project Folder'}
                            </p>
                            <p className="text-xs text-secondary-500 mt-0.5">
                              {t('projects.allProjectDocuments') || 'All project documents'}
                            </p>
                          </div>
                        </div>
                        <a
                          href={project.googleDriveFolderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all"
                          title={t('reports.openInGoogleDrive')}
                        >
                          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Report Attachments */}
                  {allAttachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-secondary-900 mb-3">
                        {t('reports.attachments')} ({allAttachments.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {allAttachments.map((attachment, index) => {
                          const getFileIcon = () => {
                            if (attachment.fileType?.startsWith('image/')) return PhotoIcon;
                            if (attachment.fileType?.startsWith('video/')) return VideoCameraIcon;
                            return DocumentIcon;
                          };

                          const FileIcon = getFileIcon();
                          const fileSizeMB = (attachment.fileSize / 1024 / 1024).toFixed(2);

                          return (
                            <a
                              key={`${attachment.reportId}-${index}`}
                              href={attachment.googleDriveUrl || '#'}
                              target={attachment.googleDriveUrl ? '_blank' : undefined}
                              rel={attachment.googleDriveUrl ? 'noopener noreferrer' : undefined}
                              className="flex items-center gap-3 p-3 border border-secondary-100 rounded-xl hover:bg-secondary-50 hover:border-primary-200 transition-all group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                                <FileIcon className="w-5 h-5 text-primary-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-secondary-900 truncate">
                                  {attachment.fileName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-secondary-500">
                                    {fileSizeMB} MB
                                  </p>
                                  <span className="text-secondary-300">•</span>
                                  <Link
                                    to={`/reports/${attachment.reportId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs text-primary-600 hover:text-primary-700 truncate"
                                  >
                                    {attachment.reportNumber}
                                  </Link>
                                </div>
                              </div>
                              {attachment.googleDriveUrl && (
                                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Report Google Drive Links */}
                  {allGoogleDriveUrls.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-secondary-900 mb-3">
                        {t('reports.googleDriveLinks') || 'Google Drive Links'} ({allGoogleDriveUrls.length})
                      </h4>
                      <div className="space-y-2">
                        {allGoogleDriveUrls.map((item, index) => (
                          <a
                            key={`drive-${item.reportId}-${index}`}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-secondary-100 rounded-xl hover:bg-secondary-50 hover:border-primary-200 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0 group-hover:bg-success-100 transition-colors">
                              <LinkIcon className="w-5 h-5 text-success-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-secondary-900 truncate">
                                {item.reportTitle}
                              </p>
                              <p className="text-xs text-secondary-500 mt-0.5 truncate">
                                {item.reportNumber} • {t('reports.googleDriveLink') || 'Google Drive Link'}
                              </p>
                            </div>
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {allAttachments.length === 0 && allGoogleDriveUrls.length === 0 && !project.googleDriveFolderUrl && (
                    <div className="empty-state py-8">
                      <DocumentIcon className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                      <p className="text-secondary-500 text-sm">
                        {t('projects.noMediaDocuments') || 'No media or documents found'}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ) : null;
          })()}

          {/* Reports */}
          <Card
            title={t('reports.title')}
            actions={
              hasRole('contractor') && (
                <Link to={`/reports/new?project=${id}`}>
                  <Button size="sm" icon={DocumentTextIcon}>
                    {t('reports.newReport')}
                  </Button>
                </Link>
              )
            }
          >
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.slice(0, 10).map((report) => (
                  <Link
                    key={report._id}
                    to={`/reports/${report._id}`}
                    className="block p-4 border border-secondary-100 rounded-xl hover:bg-secondary-50 hover:border-primary-200 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center flex-shrink-0 group-hover:bg-success-100 transition-colors">
                          <DocumentTextIcon className="w-5 h-5 text-success-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary-900 truncate">
                            {language === 'ar' && report.titleAr ? report.titleAr : report.title}
                          </p>
                          <p className="text-xs text-secondary-500 mt-0.5">
                            {report.reportNumber} • {formatDate(report.workDate)}
                          </p>
                        </div>
                      </div>
                      <Badge status={report.status} size="sm">
                        {t(`reports.statuses.${report.status}`)}
                      </Badge>
                    </div>
                  </Link>
                ))}
                {reports.length > 10 && (
                  <Link
                    to={`/reports?project=${id}`}
                    className="block text-center py-3 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {t('dashboard.viewAll')} ({reports.length} {t('reports.title').toLowerCase()})
                  </Link>
                )}
              </div>
            ) : (
              <div className="empty-state py-12">
                <DocumentTextIcon className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500">{t('reports.noReports')}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card title={t('projects.progress')}>
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    className="text-secondary-100"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="72"
                    cy="72"
                  />
                  <circle
                    className="text-primary-600"
                    strokeWidth="12"
                    strokeDasharray={`${project.progress * 3.64} 364`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="72"
                    cy="72"
                    style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-secondary-900">
                  {project.progress}%
                </span>
              </div>
              <p className="text-sm text-secondary-500 mt-4">Project Completion</p>
            </div>
          </Card>

          {/* Beneficiaries */}
          {project.beneficiaries && (
            <Card title="Beneficiaries">
              <div className="space-y-4">
                {project.beneficiaries.estimatedFamilies && (
                  <div className="flex justify-between items-center p-4 bg-secondary-50 rounded-xl">
                    <span className="text-sm text-secondary-600">Families</span>
                    <span className="text-xl font-bold text-secondary-900">
                      {project.beneficiaries.estimatedFamilies.toLocaleString()}
                    </span>
                  </div>
                )}
                {project.beneficiaries.estimatedPeople && (
                  <div className="flex justify-between items-center p-4 bg-secondary-50 rounded-xl">
                    <span className="text-sm text-secondary-600">People</span>
                    <span className="text-xl font-bold text-secondary-900">
                      {project.beneficiaries.estimatedPeople.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Google Drive */}
          {project.googleDriveFolderUrl && (
            <Card title={t('projects.documents')}>
              <a
                href={project.googleDriveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors text-sm font-semibold"
              >
                <FolderIcon className="w-5 h-5" />
                Open Google Drive Folder
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('projects.deleteProject')}
        message={t('projects.deleteProjectConfirm')}
        confirmText={t('projects.deleteProject')}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
});

ProjectDetail.displayName = 'ProjectDetail';

export default ProjectDetail;
