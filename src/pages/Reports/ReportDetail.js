import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { reportsAPI } from '../../api/reports';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import { formatDate } from '../../utils/helpers';
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

const ReportDetail = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await reportsAPI.getById(id);
      setReport(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch report');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setSubmitting(true);
    try {
      await reportsAPI.review(id, reviewAction, reviewNotes, rejectionReason);
      toast.success(`Report ${reviewAction}d successfully`);
      setReviewModal(false);
      fetchReport();
    } catch (error) {
      toast.error(`Failed to ${reviewAction} report`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportsAPI.delete(id);
      toast.success('Report deleted successfully');
      navigate('/reports');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleSubmit = async () => {
    try {
      await reportsAPI.submit(id);
      toast.success('Report submitted successfully');
      fetchReport();
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  if (loading) return <Loading />;
  if (!report) return null;

  const canEdit =
    user._id === report.submittedBy._id &&
    ['draft', 'rejected'].includes(report.status);
  const canReview =
    hasRole('super_admin', 'admin', 'project_manager') &&
    ['submitted', 'under_review'].includes(report.status);
  const canSubmit = user._id === report.submittedBy._id && report.status === 'draft';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {language === 'ar' && report.titleAr ? report.titleAr : report.title}
            </h1>
            <Badge status={report.status}>
              {t(`reports.statuses.${report.status}`)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{report.reportNumber}</p>
          <Link
            to={`/projects/${report.project._id}`}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {language === 'ar' && report.project?.projectNameAr ? report.project.projectNameAr : report.project?.projectName}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {canSubmit && (
            <Button size="sm" onClick={handleSubmit}>
              {t('common.submit')}
            </Button>
          )}
          {canEdit && (
            <Link to={`/reports/${id}/edit`}>
              <Button size="sm" variant="secondary">
                <PencilIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                {t('common.edit')}
              </Button>
            </Link>
          )}
          {canReview && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => {
                  setReviewAction('approve');
                  setReviewModal(true);
                }}
              >
                <CheckCircleIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                {t('reports.approve')}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setReviewAction('reject');
                  setReviewModal(true);
                }}
              >
                <XCircleIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                {t('reports.reject')}
              </Button>
            </>
          )}
          {canEdit && (
            <Button size="sm" variant="danger" onClick={handleDelete}>
              <TrashIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Details */}
          <Card title="Report Details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">{t('reports.reportType')}</p>
                  <p className="text-sm font-medium">{t(`reports.types.${report.reportType}`)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('reports.workDate')}</p>
                  <p className="text-sm font-medium">{formatDate(report.workDate)}</p>
                </div>
                {report.progressPercentage !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="text-sm font-medium">{report.progressPercentage}%</p>
                  </div>
                )}
              </div>

              {(report.description || report.descriptionAr) && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">{t('reports.description')}</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {language === 'ar' && report.descriptionAr ? report.descriptionAr : report.description}
                  </p>
                </div>
              )}

              {(report.workCompleted || report.workCompletedAr) && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">{t('reports.workCompleted')}</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {language === 'ar' && report.workCompletedAr ? report.workCompletedAr : report.workCompleted}
                  </p>
                </div>
              )}

              {(report.challenges || report.challengesAr) && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">{t('reports.challenges')}</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {language === 'ar' && report.challengesAr ? report.challengesAr : report.challenges}
                  </p>
                </div>
              )}

              {(report.nextSteps || report.nextStepsAr) && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">{t('reports.nextSteps')}</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {language === 'ar' && report.nextStepsAr ? report.nextStepsAr : report.nextSteps}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Laborers & Equipment */}
          {(report.laborers?.count || report.equipment?.length > 0) && (
            <Card title="Laborers & Equipment">
              {report.laborers?.count && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Laborers:</strong> {report.laborers.count}
                  </p>
                </div>
              )}
              {report.equipment?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Equipment</h4>
                  <ul className="space-y-1">
                    {report.equipment.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {item.name} - Qty: {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* Attachments */}
          {report.attachments?.length > 0 && (
            <Card title={t('reports.attachments')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {report.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <DocumentIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Info */}
          <Card title="Status Information">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">{t('reports.submittedBy')}</p>
                <p className="text-sm font-medium">{report.submittedBy.fullName}</p>
              </div>
              {report.submittedAt && (
                <div>
                  <p className="text-xs text-gray-500">{t('reports.submittedAt')}</p>
                  <p className="text-sm font-medium">{formatDate(report.submittedAt)}</p>
                </div>
              )}
              {report.reviewedBy && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">{t('reports.reviewedBy')}</p>
                    <p className="text-sm font-medium">{report.reviewedBy.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t('reports.reviewedAt')}</p>
                    <p className="text-sm font-medium">{formatDate(report.reviewedAt)}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Review Notes */}
          {(report.reviewNotes || report.rejectionReason) && (
            <Card title={report.status === 'rejected' ? 'Rejection Reason' : 'Review Notes'}>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {report.rejectionReason || report.reviewNotes}
              </p>
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
            />
          )}
          <Textarea
            label={t('reports.reviewNotes') + ' (Optional)'}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ReportDetail;
