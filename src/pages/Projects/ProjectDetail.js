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
import Modal, { ConfirmModal } from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
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
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
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
  const { hasRole, user } = useAuth();
  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('reviewed');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [evaluationModal, setEvaluationModal] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    overallScore: '',
    qualityScore: '',
    timelineScore: '',
    budgetScore: '',
    evaluationNotes: '',
  });
  const [evaluationLoading, setEvaluationLoading] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const response = await projectsAPI.getById(id);
      setProject(response.data.data);
    } catch (error) {
      toast.error(t('users.failedToFetchProject'));
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
  }, [id, project?.isArchived, fetchProject, t]);

  const handleReview = useCallback(async () => {
    setReviewLoading(true);
    try {
      await projectsAPI.review(id, reviewStatus, reviewNotes);
      toast.success(t('projects.projectReviewed'));
      setReviewModal(false);
      setReviewNotes('');
      setReviewStatus('reviewed');
      fetchProject();
    } catch (error) {
      toast.error(t('projects.failedToReviewProject'));
    } finally {
      setReviewLoading(false);
    }
  }, [id, reviewStatus, reviewNotes, fetchProject, t]);

  const handleEvaluation = useCallback(async () => {
    setEvaluationLoading(true);
    try {
      await projectsAPI.evaluate(id, evaluationData);
      toast.success(t('projects.projectEvaluated'));
      setEvaluationModal(false);
      setEvaluationData({
        overallScore: '',
        qualityScore: '',
        timelineScore: '',
        budgetScore: '',
        evaluationNotes: '',
      });
      fetchProject();
    } catch (error) {
      toast.error(t('projects.failedToEvaluateProject'));
    } finally {
      setEvaluationLoading(false);
    }
  }, [id, evaluationData, fetchProject, t]);

  const handleScoreChange = useCallback((field, value) => {
    // Remove any non-numeric characters except decimal point
    let numericValue = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to max 10
    if (numericValue !== '' && parseFloat(numericValue) > 10) {
      numericValue = '10';
    }

    // Limit decimal places to 1
    if (numericValue.includes('.')) {
      const [integer, decimal] = numericValue.split('.');
      if (decimal && decimal.length > 1) {
        numericValue = integer + '.' + decimal.substring(0, 1);
      }
    }

    setEvaluationData((prev) => ({
      ...prev,
      [field]: numericValue,
    }));
  }, []);

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
  const canReview = hasRole('super_admin', 'admin');
  const isSuperAdmin = hasRole('super_admin');
  const showSensitiveInfo = isSuperAdmin; // Only super admin can see client details

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
          {canReview && (
            <>
              <Button variant="primary" size="sm" icon={ClipboardDocumentCheckIcon} onClick={() => setReviewModal(true)}>
                {t('projects.reviewProject')}
              </Button>
              <Button variant="primary" size="sm" icon={CheckCircleIcon} onClick={() => setEvaluationModal(true)}>
                {t('projects.evaluateProject')}
              </Button>
            </>
          )}
          {canEdit && (
            <>
              <Link to={`/projects/${id}/edit`}>
                <Button variant="outline" size="sm" icon={PencilIcon}>
                  {t('common.edit')}
                </Button>
              </Link>
              <Button variant="secondary" size="sm" icon={ArchiveBoxIcon} onClick={handleArchive}>
                {project.isArchived ? t('users.unarchive') : t('users.archive')}
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
                value={`${project.country}${project.region ? `, ${project.region}` : ''}${project.city ? `, ${project.city}` : ''}`}
              />
              {showSensitiveInfo && project.location?.address && (
                <InfoItem
                  icon={MapPinIcon}
                  label={t('projects.location') || 'Location Address'}
                  value={project.location.address}
                />
              )}
              {showSensitiveInfo && project.location?.latitude && project.location?.longitude && (
                <InfoItem
                  icon={MapPinIcon}
                  label={t('projects.coordinates') || 'Coordinates'}
                  value={`${project.location.latitude.toFixed(6)}, ${project.location.longitude.toFixed(6)}`}
                />
              )}
              <InfoItem
                icon={UserIcon}
                label={t('projects.contractor')}
                value={project.contractor?.fullName}
              />
              {showSensitiveInfo && project.contractor?.email && (
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.contractorEmail') || 'Contractor Email'}
                  value={project.contractor.email}
                />
              )}
              {showSensitiveInfo && project.contractor?.phone && (
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.contractorPhone') || 'Contractor Phone'}
                  value={project.contractor.phone}
                />
              )}
              {showSensitiveInfo && project.contractor?.organization && (
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.contractorOrganization') || 'Contractor Organization'}
                  value={project.contractor.organization}
                />
              )}
              <InfoItem
                icon={UserIcon}
                label={t('projects.projectManager')}
                value={project.projectManager?.fullName}
              />
              {showSensitiveInfo && project.projectManager?.email && (
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.projectManagerEmail') || 'Project Manager Email'}
                  value={project.projectManager.email}
                />
              )}
              {showSensitiveInfo && project.projectManager?.phone && (
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.projectManagerPhone') || 'Project Manager Phone'}
                  value={project.projectManager.phone}
                />
              )}
              <InfoItem
                icon={CurrencyDollarIcon}
                label={t('projects.budget')}
                value={project.budget?.amount ? formatCurrency(project.budget.amount, project.budget.currency) : null}
              />
              {project.priority && (
                <InfoItem
                  icon={CurrencyDollarIcon}
                  label={t('projects.priority')}
                  value={t(`projects.priority${project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}`) || project.priority}
                />
              )}
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
              {project.actualEndDate && (
                <InfoItem
                  icon={CalendarIcon}
                  label={t('projects.actualEndDate')}
                  value={formatDate(project.actualEndDate)}
                />
              )}
              {showSensitiveInfo && project.createdBy && (
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.createdBy') || 'Created By'}
                  value={project.createdBy?.fullName}
                />
              )}
              {showSensitiveInfo && project.createdAt && (
                <InfoItem
                  icon={CalendarIcon}
                  label={t('projects.createdAt') || 'Created At'}
                  value={formatDate(project.createdAt)}
                />
              )}
              {showSensitiveInfo && project.updatedAt && (
                <InfoItem
                  icon={CalendarIcon}
                  label={t('projects.updatedAt') || 'Updated At'}
                  value={formatDate(project.updatedAt)}
                />
              )}
            </div>

            {(project.description || project.descriptionAr) && (
              <div className="mt-6 pt-6 border-t border-secondary-100">
                <h4 className="text-sm font-semibold text-secondary-900 mb-2">
                  {t('projects.description') || 'Description'}
                </h4>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  {language === 'ar' && project.descriptionAr ? project.descriptionAr : project.description}
                </p>
              </div>
            )}

            {showSensitiveInfo && project.notes && (
              <div className="mt-6 pt-6 border-t border-secondary-100">
                <h4 className="text-sm font-semibold text-secondary-900 mb-2">
                  {t('projects.notes') || 'Notes'}
                </h4>
                <p className="text-secondary-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {project.notes}
                </p>
              </div>
            )}

            {showSensitiveInfo && project.tags && project.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-secondary-100">
                <h4 className="text-sm font-semibold text-secondary-900 mb-2">
                  {t('projects.tags') || 'Tags'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} status="submitted" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Client Information - Only for Super Admin */}
          {showSensitiveInfo && project.client && (
            <Card title={t('projects.clientInformation') || 'Client Information'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.client.name && (
                  <InfoItem
                    icon={UserIcon}
                    label={t('projects.clientName')}
                    value={project.client.name}
                  />
                )}
                {project.client.email && (
                  <InfoItem
                    icon={UserIcon}
                    label={t('projects.clientEmail')}
                    value={project.client.email}
                  />
                )}
                {project.client.phone && (
                  <InfoItem
                    icon={UserIcon}
                    label={t('projects.clientPhone')}
                    value={project.client.phone}
                  />
                )}
              </div>
            </Card>
          )}

          {/* Donor Information - Only for Super Admin */}
          {/* {showSensitiveInfo && project.donor && (
            <Card title={t('projects.donorInformation') || 'Donor Information'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.donor.name && (
                  <InfoItem
                    icon={UserIcon}
                    label={t('projects.donorName') || 'Donor Name'}
                    value={project.donor.name}
                  />
                )}
                {project.donor.email && (
                  <InfoItem
                    icon={UserIcon}
                    label={t('projects.donorEmail') || 'Donor Email'}
                    value={project.donor.email}
                  />
                )}
                {project.donor.phone && (
                  <InfoItem
                    icon={UserIcon}
                    label={t('projects.donorPhone') || 'Donor Phone'}
                    value={project.donor.phone}
                  />
                )}
              </div>
            </Card>
          )} */}

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

          {/* Review Information */}
          {project.reviewedBy && (
            <Card title={t('projects.reviewInformation') || 'Review Information'}>
              <div className="space-y-4">
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.reviewedBy') || 'Reviewed By'}
                  value={project.reviewedBy?.fullName}
                />
                {project.reviewedAt && (
                  <InfoItem
                    icon={CalendarIcon}
                    label={t('projects.reviewedAt') || 'Reviewed At'}
                    value={formatDate(project.reviewedAt)}
                  />
                )}
                {project.reviewStatus && (
                  <div className="pt-4 border-t border-secondary-100">
                    <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-2">
                      {t('projects.reviewStatus') || 'Review Status'}
                    </p>
                    <Badge
                      status={
                        project.reviewStatus === 'approved'
                          ? 'approved'
                          : project.reviewStatus === 'needs_revision'
                            ? 'rejected'
                            : 'submitted'
                      }
                      size="sm"
                    >
                      {t(`projects.reviewStatuses.${project.reviewStatus}`) || project.reviewStatus}
                    </Badge>
                  </div>
                )}
                {project.reviewNotes && (
                  <div className="pt-4 border-t border-secondary-100">
                    <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-2">
                      {t('projects.reviewNotes') || 'Review Notes'}
                    </p>
                    <div className="p-4 bg-secondary-50 rounded-xl">
                      <p className="text-sm text-secondary-700 whitespace-pre-wrap">{project.reviewNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Evaluation Information */}
          {project.evaluation?.evaluatedBy && (
            <Card title={t('projects.evaluationInformation') || 'Evaluation Information'}>
              <div className="space-y-4">
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.evaluatedBy') || 'Evaluated By'}
                  value={project.evaluation.evaluatedBy?.fullName}
                />
                {project.evaluation.evaluatedAt && (
                  <InfoItem
                    icon={CalendarIcon}
                    label={t('projects.evaluatedAt') || 'Evaluated At'}
                    value={formatDate(project.evaluation.evaluatedAt)}
                  />
                )}
                {(project.evaluation.overallScore !== undefined ||
                  project.evaluation.qualityScore !== undefined ||
                  project.evaluation.timelineScore !== undefined ||
                  project.evaluation.budgetScore !== undefined) && (
                    <div className="pt-4 border-t border-secondary-100">
                      <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-3">
                        {t('projects.scores') || 'Scores (0-10)'}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {project.evaluation.overallScore !== undefined && (
                          <div className="p-3 bg-primary-50 rounded-xl">
                            <p className="text-xs text-secondary-500 mb-1">{t('projects.overallScore') || 'Overall'}</p>
                            <p className="text-lg font-bold text-primary-600">{project.evaluation.overallScore}/10</p>
                          </div>
                        )}
                        {project.evaluation.qualityScore !== undefined && (
                          <div className="p-3 bg-success-50 rounded-xl">
                            <p className="text-xs text-secondary-500 mb-1">{t('projects.qualityScore') || 'Quality'}</p>
                            <p className="text-lg font-bold text-success-600">{project.evaluation.qualityScore}/10</p>
                          </div>
                        )}
                        {project.evaluation.timelineScore !== undefined && (
                          <div className="p-3 bg-warning-50 rounded-xl">
                            <p className="text-xs text-secondary-500 mb-1">{t('projects.timelineScore') || 'Timeline'}</p>
                            <p className="text-lg font-bold text-warning-600">{project.evaluation.timelineScore}/10</p>
                          </div>
                        )}
                        {project.evaluation.budgetScore !== undefined && (
                          <div className="p-3 bg-info-50 rounded-xl">
                            <p className="text-xs text-secondary-500 mb-1">{t('projects.budgetScore') || 'Budget'}</p>
                            <p className="text-lg font-bold text-info-600">{project.evaluation.budgetScore}/10</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                {project.evaluation.evaluationNotes && (
                  <div className="pt-4 border-t border-secondary-100">
                    <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-2">
                      {t('projects.evaluationNotes') || 'Evaluation Notes'}
                    </p>
                    <div className="p-4 bg-secondary-50 rounded-xl">
                      <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                        {project.evaluation.evaluationNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModal}
        onClose={() => {
          setReviewModal(false);
          setReviewNotes('');
          setReviewStatus('reviewed');
        }}
        title={t('projects.reviewProject') || 'Review Project'}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label={t('projects.reviewStatus') || 'Review Status'}
            name="reviewStatus"
            value={reviewStatus}
            onChange={(e) => setReviewStatus(e.target.value)}
            options={[
              { value: 'reviewed', label: t('projects.reviewStatuses.reviewed') || 'Reviewed' },
              { value: 'approved', label: t('projects.reviewStatuses.approved') || 'Approved' },
              { value: 'needs_revision', label: t('projects.reviewStatuses.needs_revision') || 'Needs Revision' },
            ]}
            required
          />
          <Textarea
            label={`${t('projects.reviewNotes') || 'Review Notes'} (${t('common.optional')})`}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
            placeholder={t('projects.reviewNotesPlaceholder') || 'Add your review notes or comments...'}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setReviewModal(false);
              setReviewNotes('');
              setReviewStatus('reviewed');
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleReview} loading={reviewLoading}>
            {t('projects.submitReview') || 'Submit Review'}
          </Button>
        </div>
      </Modal>

      {/* Evaluation Modal */}
      <Modal
        isOpen={evaluationModal}
        onClose={() => {
          setEvaluationModal(false);
          setEvaluationData({
            overallScore: '',
            qualityScore: '',
            timelineScore: '',
            budgetScore: '',
            evaluationNotes: '',
          });
        }}
        title={t('projects.evaluateProject') || 'Evaluate Project'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('projects.overallScore') || 'Overall Score (0-10)'}
              type="number"
              name="overallScore"
              value={evaluationData.overallScore}
              onChange={(e) => handleScoreChange('overallScore', e.target.value)}
              min="0"
              max="10"
              step="0.1"
              placeholder="0-10"
            />
            <Input
              label={t('projects.qualityScore') || 'Quality Score (0-10)'}
              type="number"
              name="qualityScore"
              value={evaluationData.qualityScore}
              onChange={(e) => handleScoreChange('qualityScore', e.target.value)}
              min="0"
              max="10"
              step="0.1"
              placeholder="0-10"
            />
            <Input
              label={t('projects.timelineScore') || 'Timeline Score (0-10)'}
              type="number"
              name="timelineScore"
              value={evaluationData.timelineScore}
              onChange={(e) => handleScoreChange('timelineScore', e.target.value)}
              min="0"
              max="10"
              step="0.1"
              placeholder="0-10"
            />
            <Input
              label={t('projects.budgetScore') || 'Budget Score (0-10)'}
              type="number"
              name="budgetScore"
              value={evaluationData.budgetScore}
              onChange={(e) => handleScoreChange('budgetScore', e.target.value)}
              min="0"
              max="10"
              step="0.1"
              placeholder="0-10"
            />
          </div>
          <Textarea
            label={`${t('projects.evaluationNotes') || 'Evaluation Notes'} (${t('common.optional')})`}
            value={evaluationData.evaluationNotes}
            onChange={(e) =>
              setEvaluationData((prev) => ({
                ...prev,
                evaluationNotes: e.target.value,
              }))
            }
            rows={4}
            placeholder={t('projects.evaluationNotesPlaceholder') || 'Add your evaluation notes or comments...'}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setEvaluationModal(false);
              setEvaluationData({
                overallScore: '',
                qualityScore: '',
                timelineScore: '',
                budgetScore: '',
                evaluationNotes: '',
              });
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleEvaluation} loading={evaluationLoading}>
            {t('projects.submitEvaluation') || 'Submit Evaluation'}
          </Button>
        </div>
      </Modal>

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
