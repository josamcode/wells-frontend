import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { reportsAPI } from '../../api/reports';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/Loading';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import { formatDate } from '../../utils/helpers';
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  UserIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

const InfoItem = memo(({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-secondary-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-secondary-900 mt-0.5">{value || 'N/A'}</p>
    </div>
  </div>
));

InfoItem.displayName = 'InfoItem';

const ReportDetail = memo(() => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const response = await reportsAPI.getById(id);
      setReport(response.data.data);
    } catch (error) {
      toast.error(t('reports.failedToFetch'));
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleReview = useCallback(async () => {
    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error(t('reports.rejectionReasonRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await reportsAPI.review(id, reviewAction, reviewNotes, rejectionReason);
      const successKey = reviewAction === 'approve' ? 'reportApprovedSuccess' : 'reportRejectedSuccess';
      toast.success(t(`reports.${successKey}`));
      setReviewModal(false);
      fetchReport();
    } catch (error) {
      const errorKey = reviewAction === 'approve' ? 'failedToApproveReport' : 'failedToRejectReport';
      toast.error(t(`reports.${errorKey}`));
    } finally {
      setSubmitting(false);
    }
  }, [id, reviewAction, reviewNotes, rejectionReason, fetchReport]);

  const handleDelete = useCallback(async () => {
    setSubmitting(true);
    try {
      await reportsAPI.delete(id);
      toast.success(t('reports.reportDeleted'));
      navigate('/reports');
    } catch (error) {
      toast.error(t('reports.failedToDelete'));
    } finally {
      setSubmitting(false);
    }
  }, [id, navigate]);

  const handleSubmit = useCallback(async () => {
    try {
      await reportsAPI.submit(id);
      toast.success(t('reports.reportSubmitted'));
      fetchReport();
    } catch (error) {
      toast.error(t('reports.failedToSubmit'));
    }
  }, [id, fetchReport]);

  const openReviewModal = useCallback((action) => {
    setReviewAction(action);
    setReviewNotes('');
    setRejectionReason('');
    setReviewModal(true);
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
            <CardSkeleton lines={8} />
          </div>
          <CardSkeleton lines={5} />
        </div>
      </div>
    );
  }

  if (!report) return null;

  const canEdit = user?._id === report.submittedBy?._id && ['draft', 'rejected'].includes(report.status);
  const canReview = hasRole('super_admin', 'admin', 'project_manager') && ['submitted', 'under_review'].includes(report.status);
  const canSubmit = user?._id === report.submittedBy?._id && report.status === 'draft';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link to="/reports" className="p-2 rounded-xl hover:bg-secondary-100 text-secondary-500 transition-all mt-1">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 tracking-tight">
                {language === 'ar' && report.titleAr ? report.titleAr : report.title}
              </h1>
              <Badge status={report.status} size="lg" dot>
                {t(`reports.statuses.${report.status}`)}
              </Badge>
            </div>
            <p className="text-secondary-500 mt-1 font-mono">{report.reportNumber}</p>
            <Link
              to={`/projects/${report.project?._id}`}
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium mt-1 transition-colors"
            >
              <FolderIcon className="w-4 h-4" />
              {language === 'ar' && report.project?.projectNameAr ? report.project.projectNameAr : report.project?.projectName}
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 ltr:ml-11 rtl:mr-11 lg:ml-0 lg:mr-0">
          {canSubmit && (
            <Button onClick={handleSubmit} icon={CheckCircleIcon}>
              {t('common.submit')}
            </Button>
          )}
          {canEdit && (
            <Link to={`/reports/${id}/edit`}>
              <Button variant="outline" icon={PencilIcon}>
                {t('common.edit')}
              </Button>
            </Link>
          )}
          {canReview && (
            <>
              <Button variant="success" onClick={() => openReviewModal('approve')} icon={CheckCircleIcon}>
                {t('reports.approve')}
              </Button>
              <Button variant="danger" onClick={() => openReviewModal('reject')} icon={XCircleIcon}>
                {t('reports.reject')}
              </Button>
            </>
          )}
          {canEdit && (
            <Button variant="outline-danger" onClick={() => setDeleteModal(true)} icon={TrashIcon}>
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Details */}
          <Card title={t('reports.reportDetails')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InfoItem
                icon={CalendarIcon}
                label={t('reports.workDate')}
                value={formatDate(report.workDate)}
              />
              <InfoItem
                icon={DocumentIcon}
                label={t('reports.reportType')}
                value={t(`reports.types.${report.reportType}`)}
              />
              {report.progressPercentage !== undefined && (
                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-2">{t('common.progress')}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-secondary-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${report.progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-secondary-900">{report.progressPercentage}%</span>
                  </div>
                </div>
              )}
            </div>

            {(report.description || report.descriptionAr) && (
              <div className="pt-6 border-t border-secondary-100">
                <h4 className="text-sm font-semibold text-secondary-900 mb-3">{t('reports.description')}</h4>
                <p className="text-secondary-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {language === 'ar' && report.descriptionAr ? report.descriptionAr : report.description}
                </p>
              </div>
            )}

            {(report.workCompleted || report.workCompletedAr) && (
              <div className="pt-6 border-t border-secondary-100">
                <h4 className="text-sm font-semibold text-secondary-900 mb-3">{t('reports.workCompleted')}</h4>
                <p className="text-secondary-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {language === 'ar' && report.workCompletedAr ? report.workCompletedAr : report.workCompleted}
                </p>
              </div>
            )}

            {(report.challenges || report.challengesAr) && (
              <div className="pt-6 border-t border-secondary-100">
                <h4 className="text-sm font-semibold text-secondary-900 mb-3">{t('reports.challenges')}</h4>
                <p className="text-secondary-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {language === 'ar' && report.challengesAr ? report.challengesAr : report.challenges}
                </p>
              </div>
            )}

            {(report.nextSteps || report.nextStepsAr) && (
              <div className="pt-6 border-t border-secondary-100">
                <h4 className="text-sm font-semibold text-secondary-900 mb-3">{t('reports.nextSteps')}</h4>
                <p className="text-secondary-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {language === 'ar' && report.nextStepsAr ? report.nextStepsAr : report.nextSteps}
                </p>
              </div>
            )}
          </Card>

          {/* Laborers & Equipment */}
          {(report.laborers?.count || report.equipment?.length > 0) && (
            <Card title={t('reports.laborersEquipment')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.laborers?.count && (
                  <div className="p-4 bg-secondary-50 rounded-xl">
                    <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">{t('reports.totalLaborers')}</p>
                    <p className="text-2xl font-bold text-secondary-900 mt-1">{report.laborers.count}</p>
                  </div>
                )}
                {report.equipment?.length > 0 && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-secondary-900 mb-3">{t('reports.equipmentUsed')}</h4>
                    <div className="space-y-2">
                      {report.equipment.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                          <span className="text-sm text-secondary-700">{item.name}</span>
                          <span className="text-sm font-semibold text-secondary-900">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Attachments */}
          {report.attachments?.length > 0 && (
            <Card title={t('reports.attachments')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-secondary-200 rounded-xl hover:bg-secondary-50 hover:border-primary-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                      <DocumentIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">{file.fileName}</p>
                      <p className="text-xs text-secondary-500">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors" />
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Info */}
          <Card title={t('reports.statusInformation')}>
            <div className="space-y-4">
              <InfoItem
                icon={UserIcon}
                label={t('reports.submittedBy')}
                value={report.submittedBy?.fullName}
              />
              {report.submittedAt && (
                <InfoItem
                  icon={CalendarIcon}
                  label={t('reports.submittedAt')}
                  value={formatDate(report.submittedAt)}
                />
              )}
              {report.reviewedBy && (
                <>
                  <div className="border-t border-secondary-100 pt-4">
                    <InfoItem
                      icon={UserIcon}
                      label={t('reports.reviewedBy')}
                      value={report.reviewedBy?.fullName}
                    />
                  </div>
                  <InfoItem
                    icon={CalendarIcon}
                    label={t('reports.reviewedAt')}
                    value={formatDate(report.reviewedAt)}
                  />
                </>
              )}
            </div>
          </Card>

          {/* Review Notes */}
          {(report.reviewNotes || report.rejectionReason) && (
            <Card
              title={report.status === 'rejected' ? t('reports.rejectionReason') : t('reports.reviewNotes')}
              className={report.status === 'rejected' ? 'border-danger-200' : ''}
            >
              <div className={`p-4 rounded-xl ${report.status === 'rejected' ? 'bg-danger-50' : 'bg-secondary-50'}`}>
                <p className={`text-sm whitespace-pre-wrap ${report.status === 'rejected' ? 'text-danger-700' : 'text-secondary-600'}`}>
                  {report.rejectionReason || report.reviewNotes}
                </p>
              </div>
            </Card>
          )}

          {/* Google Drive Link */}
          {report.googleDriveUrl && (
            <Card title={t('reports.documents')}>
              <a
                href={report.googleDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors text-sm font-semibold"
              >
                <DocumentIcon className="w-5 h-5" />
                {t('reports.openInGoogleDrive')}
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </Card>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        title={reviewAction === 'approve' ? 'Approve Report' : 'Reject Report'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant={reviewAction === 'approve' ? 'success' : 'danger'}
              onClick={handleReview}
              loading={submitting}
            >
              {reviewAction === 'approve' ? t('reports.approve') : t('reports.reject')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {reviewAction === 'reject' && (
            <Textarea
              label={t('reports.rejectionReason')}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              rows={4}
              placeholder="Please provide a reason for rejection..."
            />
          )}
          <Textarea
            label={`${t('reports.reviewNotes')} (${t('common.optional')})`}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
            placeholder="Add any additional notes..."
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('reports.deleteReport')}
        message={t('reports.deleteReportConfirm')}
        confirmText={t('reports.deleteReport')}
        variant="danger"
        loading={submitting}
      />
    </div>
  );
});

ReportDetail.displayName = 'ReportDetail';

export default ReportDetail;
