import React, { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI } from '../../api/projects';
import { reportsAPI } from '../../api/reports';
import { paymentsAPI } from '../../api/payments';
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
import { PROJECT_TYPES } from '../../utils/constants';
import StarRating from '../../components/common/StarRating';
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
  BanknotesIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ChevronRightIcon,
  TagIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

// ==================== REUSABLE COMPONENTS ====================

// Enhanced 3D InfoItem Component - BIGGER with 3D hover effects
const InfoItem = memo(({ icon: Icon, label, value, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gradient-to-br from-white to-secondary-50/50 border-secondary-200',
    primary: 'bg-gradient-to-br from-primary-50 to-primary-100/80 border-primary-200',
    success: 'bg-gradient-to-br from-success-50 to-success-100/80 border-success-200',
    warning: 'bg-gradient-to-br from-warning-50 to-warning-100/80 border-warning-200',
    danger: 'bg-gradient-to-br from-danger-50 to-danger-100/80 border-danger-200',
    info: 'bg-gradient-to-br from-info-50 to-info-100/80 border-info-200',
  };

  const iconVariants = {
    default: 'bg-gradient-to-br from-secondary-100 to-secondary-200 text-secondary-600 shadow-secondary-200/50',
    primary: 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-primary-500/40',
    success: 'bg-gradient-to-br from-success-400 to-success-600 text-white shadow-success-500/40',
    warning: 'bg-gradient-to-br from-warning-400 to-warning-600 text-white shadow-warning-500/40',
    danger: 'bg-gradient-to-br from-danger-400 to-danger-600 text-white shadow-danger-500/40',
    info: 'bg-gradient-to-br from-info-400 to-info-600 text-white shadow-info-500/40',
  };

  const glowVariants = {
    default: 'group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)]',
    primary: 'group-hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.35),0_0_0_1px_rgba(59,130,246,0.1)]',
    success: 'group-hover:shadow-[0_25px_50px_-12px_rgba(34,197,94,0.35),0_0_0_1px_rgba(34,197,94,0.1)]',
    warning: 'group-hover:shadow-[0_25px_50px_-12px_rgba(234,179,8,0.35),0_0_0_1px_rgba(234,179,8,0.1)]',
    danger: 'group-hover:shadow-[0_25px_50px_-12px_rgba(239,68,68,0.35),0_0_0_1px_rgba(239,68,68,0.1)]',
    info: 'group-hover:shadow-[0_25px_50px_-12px_rgba(6,182,212,0.35),0_0_0_1px_rgba(6,182,212,0.1)]',
  };

  return (
    <div
      className={`
        group relative flex items-center gap-5 p-6 rounded-2xl border-2 
        transition-all duration-300 ease-out cursor-default
        shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1),0_2px_8px_-2px_rgba(0,0,0,0.06)]
        hover:-translate-y-3 hover:scale-[1.02]
        ${glowVariants[variant]}
        ${variants[variant]} 
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Animated border glow */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-sm" />

      {/* Icon Container with 3D effect */}
      <div
        className={`
          relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 
          transition-all duration-300 ease-out
          shadow-lg
          group-hover:shadow-xl
          group-hover:scale-110 group-hover:-rotate-6
          ${iconVariants[variant]}
        `}
      >
        {/* Inner highlight */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
        <Icon className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:scale-110" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <p className="text-xs font-bold text-secondary-500 uppercase tracking-widest mb-2">
          {label}
        </p>
        <p className="text-lg font-bold text-secondary-900 leading-relaxed group-hover:text-secondary-800 transition-colors">
          {value || 'N/A'}
        </p>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/30 to-transparent rounded-tr-2xl pointer-events-none" />

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/[0.02] to-transparent rounded-b-2xl pointer-events-none" />
    </div>
  );
});

InfoItem.displayName = 'InfoItem';

// Enhanced 3D Stat Card Component with bigger hover effects
const StatCard = memo(({ icon: Icon, label, value, subValue, variant = 'default' }) => {
  const variants = {
    default: 'from-secondary-50 via-white to-secondary-100/50 border-secondary-200',
    primary: 'from-primary-50 via-white to-primary-100/50 border-primary-200',
    success: 'from-success-50 via-white to-success-100/50 border-success-200',
    warning: 'from-warning-50 via-white to-warning-100/50 border-warning-200',
    danger: 'from-danger-50 via-white to-danger-100/50 border-danger-200',
    info: 'from-info-50 via-white to-info-100/50 border-info-200',
  };

  const textVariants = {
    default: 'text-secondary-700',
    primary: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
    info: 'text-info-600',
  };

  const glowVariants = {
    default: 'group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]',
    primary: 'group-hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.3)]',
    success: 'group-hover:shadow-[0_25px_50px_-12px_rgba(34,197,94,0.3)]',
    warning: 'group-hover:shadow-[0_25px_50px_-12px_rgba(234,179,8,0.3)]',
    danger: 'group-hover:shadow-[0_25px_50px_-12px_rgba(239,68,68,0.3)]',
    info: 'group-hover:shadow-[0_25px_50px_-12px_rgba(6,182,212,0.3)]',
  };

  const iconBgVariants = {
    default: 'from-secondary-100 to-secondary-200',
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success-400 to-success-600',
    warning: 'from-warning-400 to-warning-600',
    danger: 'from-danger-400 to-danger-600',
    info: 'from-info-400 to-info-600',
  };

  return (
    <div
      className={`
        group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br border-2 
        transition-all duration-300 ease-out cursor-default
        shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)]
        hover:-translate-y-3 hover:scale-[1.02]
        ${glowVariants[variant]}
        ${variants[variant]}
      `}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-secondary-500 uppercase tracking-widest mb-3">{label}</p>
          <p className={`text-3xl font-extrabold transition-transform duration-300 group-hover:scale-110 origin-left ${textVariants[variant]}`}>
            {value}
          </p>
          {subValue && <p className="text-sm text-secondary-500 mt-2 font-medium">{subValue}</p>}
        </div>
        <div
          className={`
            w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center 
            shadow-lg transition-all duration-300
            group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-xl
            ${iconBgVariants[variant]}
          `}
        >
          <Icon className={`w-7 h-7 ${variant === 'default' ? 'text-secondary-600' : 'text-white'}`} />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-black/[0.02] to-transparent rounded-full group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/50 to-transparent pointer-events-none" />
    </div>
  );
});

StatCard.displayName = 'StatCard';

// Section Header Component
const SectionHeader = memo(({ icon: Icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
        {subtitle && <p className="text-sm text-secondary-500">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
));

SectionHeader.displayName = 'SectionHeader';

// Enhanced 3D Hover Card Wrapper - Reusable wrapper for 3D hover effect on section cards
const HoverCard = memo(({ children, className = '', noPadding = false }) => (
  <div
    className={`
      group/card bg-white rounded-2xl border-2 border-secondary-200 overflow-hidden
      shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)]
      transition-all duration-300 ease-out
      hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]
      hover:border-secondary-300
      relative
      ${className}
    `}
  >
    {/* Top highlight */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
    {/* Inner glow on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-transparent to-transparent opacity-0 group-hover/card:opacity-50 transition-opacity duration-500 pointer-events-none" />
    {children}
  </div>
));

HoverCard.displayName = 'HoverCard';

// ==================== MAIN COMPONENT ====================

const ProjectDetail = memo(() => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();

  // ==================== STATE ====================
  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
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
  const [clientEvaluationModal, setClientEvaluationModal] = useState(false);
  const [clientEvaluationData, setClientEvaluationData] = useState({
    starRating: 0,
    notes: '',
  });
  const [clientEvaluationLoading, setClientEvaluationLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'USD',
    recipientId: '',
    recipientType: 'contractor',
    description: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [rejectPaymentModal, setRejectPaymentModal] = useState(false);
  const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [newMediaName, setNewMediaName] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [contractFile, setContractFile] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);

  // ==================== FETCH FUNCTIONS ====================

  const fetchProject = useCallback(async () => {
    try {
      const response = await projectsAPI.getById(id);
      const projectData = response.data.data;
      setProject(projectData);
    } catch (error) {
      toast.error(t('users.failedToFetchProject'));
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  const fetchReports = useCallback(async () => {
    try {
      const response = await reportsAPI.getAll({ project: id, limit: 100 });
      setReports(response.data.data.reports);
    } catch (error) {
      // Silent fail
    }
  }, [id]);

  const fetchPayments = useCallback(async () => {
    const userIsSuperAdmin = hasRole('super_admin');
    const userCanViewPayments = userIsSuperAdmin || hasRole('contractor', 'project_manager');
    if (!userCanViewPayments) return;
    try {
      const [paymentsResponse, summaryResponse] = await Promise.all([
        paymentsAPI.getProjectPayments(id).catch(() => ({ data: { data: [] } })),
        paymentsAPI.getPaymentSummary(id).catch(() => ({ data: { data: null } })),
      ]);
      setPayments(paymentsResponse.data.data || []);
      setPaymentSummary(summaryResponse.data.data);
    } catch (error) {
      // Silent fail
    }
  }, [id, hasRole]);

  const fetchPendingPayments = useCallback(async () => {
    if (!hasRole('contractor', 'project_manager')) return;
    try {
      const response = await paymentsAPI.getPending();
      setPendingPayments(response.data.data || []);
    } catch (error) {
      // Silent fail
    }
  }, [hasRole]);

  // ==================== HANDLER FUNCTIONS ====================

  const handleCreatePayment = useCallback(async () => {
    if (!paymentData.amount || !paymentData.recipientId) {
      toast.error(t('payments.fillAllFields'));
      return;
    }
    setPaymentLoading(true);
    try {
      await paymentsAPI.create({
        projectId: id,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        recipientId: paymentData.recipientId,
        recipientType: paymentData.recipientType,
        description: paymentData.description,
      });
      toast.success(t('payments.paymentRequestCreated'));
      setPaymentModal(false);
      setPaymentData({
        amount: '',
        currency: 'USD',
        recipientId: '',
        recipientType: 'contractor',
        description: '',
      });
      fetchPayments();
    } catch (error) {
      toast.error(t('payments.failedToCreatePayment'));
    } finally {
      setPaymentLoading(false);
    }
  }, [id, paymentData, fetchPayments, t]);

  const handleApprovePayment = useCallback(async (paymentId) => {
    try {
      await paymentsAPI.approve(paymentId);
      toast.success(t('payments.paymentApproved'));
      fetchPayments();
      fetchPendingPayments();
    } catch (error) {
      toast.error(t('payments.failedToApprovePayment'));
    }
  }, [fetchPayments, fetchPendingPayments, t]);

  const handleRejectPayment = useCallback(async (paymentId, reason) => {
    setRejectLoading(true);
    try {
      await paymentsAPI.reject(paymentId, reason);
      toast.success(t('payments.paymentRejected'));
      fetchPayments();
      fetchPendingPayments();
      setRejectPaymentModal(false);
      setRejectingPaymentId(null);
      setRejectionReason('');
    } catch (error) {
      toast.error(t('payments.failedToRejectPayment'));
    } finally {
      setRejectLoading(false);
    }
  }, [fetchPayments, fetchPendingPayments, t]);

  const openRejectModal = useCallback((paymentId) => {
    setRejectingPaymentId(paymentId);
    setRejectionReason('');
    setRejectPaymentModal(true);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMediaFile(file);
    }
  }, []);

  const handleUploadMedia = useCallback(async () => {
    if (!newMediaFile || !newMediaName.trim()) {
      toast.error(t('projects.mediaNameAndFileRequired') || 'Please select a file and enter a name');
      return;
    }

    setUploadingMedia(true);
    try {
      await projectsAPI.uploadMedia(id, newMediaFile, newMediaName.trim());
      toast.success(t('projects.mediaUploaded') || 'Media uploaded successfully');
      setNewMediaFile(null);
      setNewMediaName('');
      const input = document.getElementById('projectMediaFileInput');
      if (input) input.value = '';
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || t('projects.failedToUploadMedia') || 'Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  }, [id, newMediaFile, newMediaName, fetchProject, t]);

  const handleDeleteMedia = useCallback(async (mediaId) => {
    if (!window.confirm(t('projects.confirmDeleteMedia') || 'Are you sure you want to delete this media?')) {
      return;
    }

    try {
      await projectsAPI.deleteMedia(id, mediaId);
      toast.success(t('projects.mediaDeleted') || 'Media deleted successfully');
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || t('projects.failedToDeleteMedia') || 'Failed to delete media');
    }
  }, [id, fetchProject, t]);

  const getFileIcon = useCallback((fileType) => {
    if (fileType?.startsWith('image/')) return PhotoIcon;
    if (fileType?.startsWith('video/')) return VideoCameraIcon;
    return DocumentIcon;
  }, []);

  const handleContractFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('projects.contractFileTypeError') || 'Only PDF and image files are allowed');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('projects.contractFileSizeError') || 'File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setContractFile(file);
      handleUploadContract(file);
    }
  }, [t]);

  const handleUploadContract = useCallback(async (file) => {
    if (!file) return;
    setUploadingContract(true);
    try {
      await projectsAPI.uploadContract(id, file);
      toast.success(t('projects.contractUploaded') || 'Contract uploaded successfully');
      setContractFile(null);
      const input = document.getElementById('contractFileInput');
      if (input) input.value = '';
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || t('projects.failedToUploadContract') || 'Failed to upload contract');
    } finally {
      setUploadingContract(false);
    }
  }, [id, fetchProject, t]);

  const handleViewContract = useCallback(async () => {
    try {
      const response = await projectsAPI.getContract(id);
      const contentType = response.headers['content-type'] || project?.contract?.fileType || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view this contract.');
      } else if (error.response?.status === 404) {
        toast.error('Contract not found.');
      } else {
        if (error.response?.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const errorData = JSON.parse(text);
            toast.error(errorData.message || 'Failed to load contract');
          } catch {
            toast.error('Failed to load contract');
          }
        } else {
          toast.error(error.response?.data?.message || 'Failed to load contract');
        }
      }
    }
  }, [id, project?.contract?.fileType]);

  const handleDeleteContract = useCallback(async () => {
    if (!window.confirm(t('projects.confirmDeleteContract') || 'Are you sure you want to delete this contract?')) {
      return;
    }
    try {
      await projectsAPI.deleteContract(id);
      toast.success(t('projects.contractDeleted') || 'Contract deleted successfully');
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || t('projects.failedToDeleteContract') || 'Failed to delete contract');
    }
  }, [id, fetchProject, t]);

  // Project Reports handlers
  const handleReportFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('projects.contractFileTypeError') || 'Only PDF and image files are allowed');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('projects.contractFileSizeError') || 'File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setReportFile(file);
      handleUploadReport(file);
    }
  }, [t]);

  const handleUploadReport = useCallback(async (file) => {
    if (!file) return;
    setUploadingReport(true);
    try {
      await projectsAPI.uploadProjectReport(id, file);
      toast.success(t('projects.reportUploaded') || 'Report uploaded successfully');
      setReportFile(null);
      const input = document.getElementById('reportFileInput');
      if (input) input.value = '';
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || t('projects.failedToUploadReport') || 'Failed to upload report');
    } finally {
      setUploadingReport(false);
    }
  }, [id, fetchProject, t]);

  const handleViewReport = useCallback(async (reportId) => {
    try {
      const response = await projectsAPI.getProjectReport(id, reportId);
      const report = project?.projectReports?.find(r => r._id === reportId);
      const contentType = response.headers['content-type'] || report?.fileType || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view this report.');
      } else if (error.response?.status === 404) {
        toast.error('Report not found.');
      } else {
        if (error.response?.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const errorData = JSON.parse(text);
            toast.error(errorData.message || 'Failed to load report');
          } catch {
            toast.error('Failed to load report');
          }
        } else {
          toast.error(error.response?.data?.message || 'Failed to load report');
        }
      }
    }
  }, [id, project?.projectReports]);

  const handleDeleteReport = useCallback(async (reportId) => {
    if (!window.confirm(t('projects.confirmDeleteReport') || 'Are you sure you want to delete this report?')) {
      return;
    }
    try {
      await projectsAPI.deleteProjectReport(id, reportId);
      toast.success(t('projects.reportDeleted') || 'Report deleted successfully');
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || t('projects.failedToDeleteReport') || 'Failed to delete report');
    }
  }, [id, fetchProject, t]);

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
  }, [id, navigate, t]);

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

  const handleClientEvaluation = useCallback(async () => {
    if (!clientEvaluationData.starRating || clientEvaluationData.starRating < 1) {
      toast.error(t('projects.starRatingRequired') || 'Please select a star rating');
      return;
    }

    setClientEvaluationLoading(true);
    try {
      await projectsAPI.clientEvaluate(id, clientEvaluationData);
      toast.success(t('projects.projectEvaluated'));
      setClientEvaluationModal(false);
      setClientEvaluationData({
        starRating: 0,
        notes: '',
      });
      fetchProject();
    } catch (error) {
      const message = error.response?.data?.message || t('projects.failedToEvaluateProject');
      toast.error(message);
    } finally {
      setClientEvaluationLoading(false);
    }
  }, [id, clientEvaluationData, fetchProject, t]);

  const handleScoreChange = useCallback((field, value) => {
    let numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }
    if (numericValue !== '' && parseFloat(numericValue) > 10) {
      numericValue = '10';
    }
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

  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchProject();
    fetchReports();
  }, [fetchProject, fetchReports]);

  useEffect(() => {
    fetchPayments();
    fetchPendingPayments();
  }, [fetchPayments, fetchPendingPayments]);

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 skeleton rounded-xl" />
          <div className="space-y-2">
            <div className="h-8 w-64 skeleton rounded-lg" />
            <div className="h-4 w-32 skeleton rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton lines={6} />
            <CardSkeleton lines={4} />
          </div>
          <div className="space-y-6">
            <CardSkeleton lines={3} />
            <CardSkeleton lines={4} />
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  // ==================== PERMISSIONS ====================

  const canEdit = hasRole('super_admin', 'admin', 'project_manager');
  const canDelete = hasRole('super_admin', 'admin');
  const canReview = hasRole('super_admin', 'admin');
  const canEvaluate = hasRole('super_admin', 'admin');
  const canClientEvaluate = hasRole('client');
  const isSuperAdmin = hasRole('super_admin');
  const showSensitiveInfo = isSuperAdmin;

  // ==================== COMPUTED VALUES ====================

  const allAttachments = [];
  const allGoogleDriveUrls = [];

  reports.forEach((report) => {
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
  const projectDuration = Math.ceil((new Date(project.expectedEndDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24));

  // ==================== RENDER ====================

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ==================== HEADER SECTION ==================== */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-success-100/20 rounded-full blur-3xl" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link
              to="/projects"
              className="p-2.5 rounded-xl bg-white border-2 border-secondary-200 text-secondary-500 hover:text-primary-600 hover:border-primary-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 text-primary-700 border border-primary-200 shadow-sm">
                  {project.projectType === PROJECT_TYPES.WELL && <WrenchScrewdriverIcon className="w-4 h-4" />}
                  {project.projectType === PROJECT_TYPES.MOSQUE && <BuildingOfficeIcon className="w-4 h-4" />}
                  {t(`projects.types.${project.projectType}`) || project.projectType}
                </span>
                <span className="text-secondary-300">•</span>
                <span className="text-sm text-secondary-500 font-mono">{project.projectNumber}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 tracking-tight">
                {language === 'ar' && project.projectNameAr ? project.projectNameAr : project.projectName}
              </h1>

              <div className="flex items-center gap-3 flex-wrap">
                <Badge status={project.status} size="lg" dot>
                  {t(`projects.statuses.${project.status}`)}
                </Badge>
                {project.isArchived && (
                  <Badge status="archived" size="sm">
                    <ArchiveBoxIcon className="w-3.5 h-3.5 mr-1" />
                    {t('users.archived')}
                  </Badge>
                )}
                {project.priority && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm ${project.priority === 'high' ? 'bg-danger-50 text-danger-700 border border-danger-200' :
                    project.priority === 'medium' ? 'bg-warning-50 text-warning-700 border border-warning-200' :
                      'bg-secondary-50 text-secondary-700 border border-secondary-200'
                    }`}>
                    {t(`projects.priority${project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}`)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-0 ml-14">
            {(canReview || canEvaluate || canClientEvaluate) && (
              <div className="flex items-center gap-1 p-1.5 bg-white rounded-xl border-2 border-secondary-200 shadow-sm hover:shadow-md transition-shadow">
                {canReview && (
                  <>
                    <Button variant="ghost" size="sm" icon={ClipboardDocumentCheckIcon} onClick={() => setReviewModal(true)}>
                      {t('projects.reviewProject')}
                    </Button>
                    <div className="w-px h-6 bg-secondary-200" />
                    <Button variant="ghost" size="sm" icon={BanknotesIcon} onClick={() => setPaymentModal(true)}>
                      {t('payments.createPayment')}
                    </Button>
                  </>
                )}
                {canEvaluate && (
                  <>
                    {canReview && <div className="w-px h-6 bg-secondary-200" />}
                    <Button variant="ghost" size="sm" icon={CheckCircleIcon} onClick={() => setEvaluationModal(true)}>
                      {t('projects.evaluateProject')}
                    </Button>
                  </>
                )}
                {canClientEvaluate && (
                  <Button variant="ghost" size="sm" icon={StarIcon} onClick={() => setClientEvaluationModal(true)}>
                    {t('projects.clientEvaluateProject') || 'Rate'}
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              {canEdit && (
                <>
                  <Link to={`/projects/${id}/edit`}>
                    <Button variant="outline" size="sm" icon={PencilIcon}>
                      {t('common.edit')}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" icon={ArchiveBoxIcon} onClick={handleArchive}>
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
        </div>
      </div>

      {/* ==================== QUICK STATS BAR ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={ArrowTrendingUpIcon}
          label={t('projects.progress')}
          value={`${project.progress}%`}
          variant="primary"
        />
        <StatCard
          icon={CalendarIcon}
          label={t('projects.duration')}
          value={`${projectDuration} ${t('common.days') || 'days'}`}
          subValue={`${formatDate(project.startDate)} - ${formatDate(project.expectedEndDate)}`}
          variant="info"
        />
        {!hasRole('client') && project.budget?.amount && (
          <StatCard
            icon={CurrencyDollarIcon}
            label={t('projects.budget')}
            value={formatCurrency(project.budget.amount, project.budget.currency)}
            variant="success"
          />
        )}
        {project.beneficiaries?.estimatedPeople && (
          <StatCard
            icon={UserIcon}
            label={t('projects.beneficiaries')}
            value={project.beneficiaries.estimatedPeople.toLocaleString()}
            subValue={t('projects.people')}
            variant="warning"
          />
        )}
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========== LEFT COLUMN ========== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Project Details Card */}
          <HoverCard>
            <div className="px-6 py-5 border-b border-secondary-100 bg-gradient-to-r from-secondary-50/50 to-transparent">
              <SectionHeader
                icon={DocumentTextIcon}
                title={t('projects.details')}
                subtitle={t('projects.basicInformation') || 'Basic project information'}
              />
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={MapPinIcon}
                  label={t('projects.location')}
                  value={`${project.country}${project.region ? `, ${project.region}` : ''}${project.city ? `, ${project.city}` : ''}`}
                  variant="info"
                />

                {showSensitiveInfo && project.location?.address && (
                  <InfoItem
                    icon={MapPinIcon}
                    label={t('projects.address')}
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

                {!hasRole('client') && (
                  <>
                    <InfoItem
                      icon={UserIcon}
                      label={t('projects.contractor')}
                      value={project.contractor?.fullName}
                      variant="primary"
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

                    <InfoItem
                      icon={UserIcon}
                      label={t('projects.projectManager')}
                      value={project.projectManager?.fullName}
                    />

                    {showSensitiveInfo && project.projectManager?.email && (
                      <InfoItem
                        icon={UserIcon}
                        label={t('projects.projectManagerEmail') || 'PM Email'}
                        value={project.projectManager.email}
                      />
                    )}

                    <InfoItem
                      icon={CurrencyDollarIcon}
                      label={t('projects.budget')}
                      value={project.budget?.amount ? formatCurrency(project.budget.amount, project.budget.currency) : null}
                      variant="success"
                    />
                  </>
                )}

                <InfoItem
                  icon={CalendarIcon}
                  label={t('projects.startDate')}
                  value={formatDate(project.startDate)}
                  variant="success"
                />

                <InfoItem
                  icon={CalendarIcon}
                  label={t('projects.expectedEndDate')}
                  value={formatDate(project.expectedEndDate)}
                  variant={new Date(project.expectedEndDate) < new Date() && project.status !== 'completed' ? 'warning' : 'default'}
                />

                {project.actualEndDate && (
                  <InfoItem
                    icon={CheckCircleIcon}
                    label={t('projects.actualEndDate')}
                    value={formatDate(project.actualEndDate)}
                    variant="success"
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
                    icon={ClockIcon}
                    label={t('projects.createdAt') || 'Created At'}
                    value={formatDate(project.createdAt)}
                  />
                )}
              </div>

              {/* Description */}
              {(project.description || project.descriptionAr) && (
                <div className="mt-6 pt-6 border-t border-secondary-100">
                  <div className="p-5 bg-gradient-to-br from-secondary-50 to-secondary-100/30 rounded-xl border border-secondary-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <DocumentTextIcon className="w-4 h-4 text-secondary-500" />
                      <h4 className="text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                        {t('projects.description')}
                      </h4>
                    </div>
                    <p className="text-secondary-700 leading-relaxed">
                      {language === 'ar' && project.descriptionAr ? project.descriptionAr : project.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {showSensitiveInfo && project.notes && (
                <div className="mt-6 pt-6 border-t border-secondary-100">
                  <div className="p-5 bg-gradient-to-br from-warning-50/50 to-warning-100/30 rounded-xl border border-warning-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <DocumentTextIcon className="w-4 h-4 text-warning-600" />
                      <h4 className="text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                        {t('projects.notes') || 'Notes'}
                      </h4>
                    </div>
                    <p className="text-secondary-700 leading-relaxed whitespace-pre-wrap">
                      {project.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {showSensitiveInfo && project.tags && project.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-secondary-100">
                  <div className="flex items-center gap-2 mb-3">
                    <TagIcon className="w-4 h-4 text-secondary-500" />
                    <h4 className="text-sm font-semibold text-secondary-700 uppercase tracking-wider">
                      {t('projects.tags')}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-50 text-primary-700 border border-primary-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </HoverCard>

          {/* Client Information */}
          {showSensitiveInfo && project.client && (
            <HoverCard>
              <div className="px-6 py-5 border-b border-secondary-100 bg-gradient-to-r from-info-50/50 to-transparent">
                <SectionHeader
                  icon={UserIcon}
                  title={t('projects.clientInformation') || 'Client Information'}
                />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.client.name && (
                    <InfoItem icon={UserIcon} label={t('projects.clientName')} value={project.client.name} />
                  )}
                  {project.client.email && (
                    <InfoItem icon={UserIcon} label={t('projects.clientEmail')} value={project.client.email} />
                  )}
                  {project.client.phone && (
                    <InfoItem icon={UserIcon} label={t('projects.clientPhone')} value={project.client.phone} />
                  )}
                </div>
              </div>
            </HoverCard>
          )}

          {/* Well Specifications */}
          {project.projectType === PROJECT_TYPES.WELL && project.wellDetails && (
            <HoverCard>
              <div className="px-6 py-5 border-b border-secondary-100 bg-gradient-to-r from-info-50/50 to-transparent">
                <SectionHeader
                  icon={WrenchScrewdriverIcon}
                  title={t('projects.wellSpecifications')}
                  subtitle={t('projects.technicalDetails') || 'Technical specifications'}
                />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {project.wellDetails.depth && (
                    <div className="group text-center p-5 bg-gradient-to-br from-info-50 to-info-100/30 rounded-xl border-2 border-info-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-info-600 group-hover:scale-110 transition-transform">{project.wellDetails.depth}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.depth')}
                      </p>
                    </div>
                  )}
                  {project.wellDetails.diameter && (
                    <div className="group text-center p-5 bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl border-2 border-primary-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-primary-600 group-hover:scale-110 transition-transform">{project.wellDetails.diameter}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.diameter')}
                      </p>
                    </div>
                  )}
                  {project.wellDetails.capacity && (
                    <div className="group text-center p-5 bg-gradient-to-br from-success-50 to-success-100/30 rounded-xl border-2 border-success-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-success-600 group-hover:scale-110 transition-transform">{project.wellDetails.capacity}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.capacity')}
                      </p>
                    </div>
                  )}
                  {project.wellDetails.waterQuality && (
                    <div className="group text-center p-5 bg-gradient-to-br from-warning-50 to-warning-100/30 rounded-xl border-2 border-warning-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-lg font-bold text-warning-600 group-hover:scale-110 transition-transform">{project.wellDetails.waterQuality}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.waterQuality')}
                      </p>
                    </div>
                  )}
                  {project.wellDetails.pumpType && (
                    <div className="group text-center p-5 bg-gradient-to-br from-secondary-50 to-secondary-100/30 rounded-xl border-2 border-secondary-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-lg font-bold text-secondary-700 group-hover:scale-110 transition-transform">{project.wellDetails.pumpType}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.pumpType')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </HoverCard>
          )}

          {/* Mosque Specifications */}
          {project.projectType === PROJECT_TYPES.MOSQUE && project.mosqueDetails && (
            <HoverCard>
              <div className="px-6 py-5 border-b border-secondary-100 bg-gradient-to-r from-warning-50/50 to-transparent">
                <SectionHeader
                  icon={BuildingOfficeIcon}
                  title={t('projects.mosqueSpecifications') || 'Mosque Specifications'}
                  subtitle={t('projects.facilityDetails') || 'Facility details'}
                />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {project.mosqueDetails.area && (
                    <div className="group text-center p-5 bg-gradient-to-br from-warning-50 to-warning-100/30 rounded-xl border-2 border-warning-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-warning-600 group-hover:scale-110 transition-transform">{project.mosqueDetails.area}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.mosqueArea') || 'Area (m²)'}
                      </p>
                    </div>
                  )}
                  {project.mosqueDetails.capacity && (
                    <div className="group text-center p-5 bg-gradient-to-br from-success-50 to-success-100/30 rounded-xl border-2 border-success-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-success-600 group-hover:scale-110 transition-transform">{project.mosqueDetails.capacity}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.mosqueCapacity') || 'Capacity'}
                      </p>
                    </div>
                  )}
                  {project.mosqueDetails.minarets && (
                    <div className="group text-center p-5 bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl border-2 border-primary-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-primary-600 group-hover:scale-110 transition-transform">{project.mosqueDetails.minarets}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.mosqueMinarets') || 'Minarets'}
                      </p>
                    </div>
                  )}
                  {project.mosqueDetails.domes && (
                    <div className="group text-center p-5 bg-gradient-to-br from-info-50 to-info-100/30 rounded-xl border-2 border-info-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-info-600 group-hover:scale-110 transition-transform">{project.mosqueDetails.domes}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.mosqueDomes') || 'Domes'}
                      </p>
                    </div>
                  )}
                  {project.mosqueDetails.prayerHalls && (
                    <div className="group text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl border-2 border-purple-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform">{project.mosqueDetails.prayerHalls}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.mosquePrayerHalls') || 'Prayer Halls'}
                      </p>
                    </div>
                  )}
                  {project.mosqueDetails.ablutionFacilities && (
                    <div className="group text-center p-5 bg-gradient-to-br from-cyan-50 to-cyan-100/30 rounded-xl border-2 border-cyan-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-cyan-600 group-hover:scale-110 transition-transform">{project.mosqueDetails.ablutionFacilities}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.mosqueAblutionFacilities') || 'Ablution'}
                      </p>
                    </div>
                  )}
                  {project.mosqueDetails.parkingSpaces && (
                    <div className="group text-center p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl border-2 border-emerald-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-default">
                      <p className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform">{project.mosqueDetails.parkingSpaces}</p>
                      <p className="text-xs font-semibold text-secondary-600 mt-2 uppercase tracking-wider">
                        {t('projects.mosqueParkingSpaces') || 'Parking'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </HoverCard>
          )}

          {/* Other Project Details */}
          {project.projectType === PROJECT_TYPES.OTHER && project.otherDetails && (
            <HoverCard>
              <div className="px-6 py-5 border-b border-secondary-100">
                <SectionHeader
                  icon={DocumentTextIcon}
                  title={t('projects.otherSpecifications') || 'Project Specifications'}
                />
              </div>
              <div className="p-6">
                <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                  <pre className="text-sm text-secondary-700 overflow-x-auto font-mono leading-relaxed">
                    {JSON.stringify(project.otherDetails, null, 2)}
                  </pre>
                </div>
              </div>
            </HoverCard>
          )}

          {/* Media & Documents */}
          {hasMedia && (
            <HoverCard>
              <div className="px-6 py-5 border-b border-secondary-100 bg-gradient-to-r from-purple-50/50 to-transparent">
                <SectionHeader
                  icon={FolderIcon}
                  title={t('projects.mediaDocuments') || 'Media & Documents'}
                />
              </div>
              <div className="p-6 space-y-6">
                {project.googleDriveFolderUrl && (
                  <a
                    href={project.googleDriveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl border-2 border-primary-200 hover:bg-primary-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <FolderIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-secondary-900">
                        {t('projects.projectFolder') || 'Project Folder'}
                      </p>
                      <p className="text-xs text-secondary-500 mt-0.5">
                        {t('projects.allProjectDocuments') || 'All project documents'}
                      </p>
                    </div>
                    <ArrowTopRightOnSquareIcon className="w-5 h-5 text-primary-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                )}

                {allAttachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-secondary-900 mb-3">
                      {t('reports.attachments')} ({allAttachments.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allAttachments.map((attachment, index) => {
                        const FileIcon = getFileIcon(attachment.fileType);
                        const fileSizeMB = (attachment.fileSize / 1024 / 1024).toFixed(2);

                        return (
                          <a
                            key={`${attachment.reportId}-${index}`}
                            href={attachment.googleDriveUrl || '#'}
                            target={attachment.googleDriveUrl ? '_blank' : undefined}
                            rel={attachment.googleDriveUrl ? 'noopener noreferrer' : undefined}
                            className="flex items-center gap-3 p-3 border-2 border-secondary-200 rounded-xl hover:bg-secondary-50 hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 group-hover:scale-110 transition-all">
                              <FileIcon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-secondary-900 truncate">
                                {attachment.fileName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-secondary-500">{fileSizeMB} MB</p>
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
                          className="flex items-center gap-3 p-3 border-2 border-secondary-200 rounded-xl hover:bg-secondary-50 hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0 group-hover:bg-success-100 group-hover:scale-110 transition-all">
                            <LinkIcon className="w-5 h-5 text-success-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">
                              {item.reportTitle}
                            </p>
                            <p className="text-xs text-secondary-500 mt-0.5 truncate">
                              {item.reportNumber}
                            </p>
                          </div>
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </HoverCard>
          )}

          {/* Payments Section */}
          {(isSuperAdmin || hasRole('contractor', 'project_manager')) && (
            <HoverCard>
              <div className="px-6 py-5 border-b border-secondary-100 bg-gradient-to-r from-success-50/50 to-transparent">
                <SectionHeader
                  icon={BanknotesIcon}
                  title={t('payments.title') || 'Payments'}
                  subtitle={t('payments.budgetOverview') || 'Budget and payment overview'}
                  action={
                    canReview && (
                      <Button size="sm" variant="outline" icon={BanknotesIcon} onClick={() => setPaymentModal(true)}>
                        {t('payments.createPayment')}
                      </Button>
                    )
                  }
                />
              </div>
              <div className="p-6">
                {paymentSummary ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="group p-4 bg-secondary-50 rounded-xl border-2 border-secondary-200 hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-1">
                          {t('payments.budget')}
                        </p>
                        <p className="text-xl font-bold text-secondary-900 group-hover:scale-105 transition-transform">
                          {formatCurrency(paymentSummary.budget, paymentSummary.currency)}
                        </p>
                      </div>
                      <div className="group p-4 bg-primary-50 rounded-xl border-2 border-primary-200 hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-1">
                          {t('payments.totalSpent')}
                        </p>
                        <p className="text-xl font-bold text-primary-600 group-hover:scale-105 transition-transform">
                          {formatCurrency(paymentSummary.totalSpent, paymentSummary.currency)}
                        </p>
                      </div>
                      <div className={`group p-4 rounded-xl border-2 hover:shadow-md hover:-translate-y-0.5 transition-all ${paymentSummary.remaining >= 0
                        ? 'bg-success-50 border-success-200'
                        : 'bg-danger-50 border-danger-200'
                        }`}>
                        <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-1">
                          {t('payments.remaining')}
                        </p>
                        <p className={`text-xl font-bold group-hover:scale-105 transition-transform ${paymentSummary.remaining >= 0 ? 'text-success-600' : 'text-danger-600'
                          }`}>
                          {formatCurrency(paymentSummary.remaining, paymentSummary.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary-50 rounded-xl border-2 border-secondary-200">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-secondary-700">
                          {t('payments.spentPercentage')}
                        </p>
                        <p className="text-sm font-bold text-secondary-900">
                          {paymentSummary.spentPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${paymentSummary.spentPercentage > 100 ? 'bg-danger-500' :
                            paymentSummary.spentPercentage > 80 ? 'bg-warning-500' :
                              'bg-primary-500'
                            }`}
                          style={{ width: `${Math.min(paymentSummary.spentPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-secondary-100 mx-auto mb-4 flex items-center justify-center">
                      <BanknotesIcon className="w-8 h-8 text-secondary-400" />
                    </div>
                    <p className="text-secondary-500">{t('payments.noPayments')}</p>
                  </div>
                )}
              </div>
            </HoverCard>
          )}

          {/* Payment History */}
          {(isSuperAdmin || hasRole('contractor', 'project_manager')) && payments.length > 0 && (
            <HoverCard>
              <div className="px-6 py-5 border-b border-secondary-100">
                <SectionHeader
                  icon={BanknotesIcon}
                  title={t('payments.paymentHistory') || 'Payment History'}
                />
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {payments.slice(0, 10).map((payment) => (
                    <div
                      key={payment._id}
                      className="p-4 border-2 border-secondary-200 rounded-xl hover:bg-secondary-50 hover:border-secondary-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-semibold text-secondary-900">
                              {formatCurrency(payment.amount, payment.currency)}
                            </p>
                            <Badge
                              status={
                                payment.status === 'approved' ? 'approved' :
                                  payment.status === 'rejected' ? 'rejected' : 'submitted'
                              }
                              size="sm"
                            >
                              {t(`payments.statuses.${payment.status}`) || payment.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-secondary-500">
                            {t('payments.to')} {payment.recipient?.fullName} ({t(`payments.${payment.recipientType}`)})
                          </p>
                          {payment.description && (
                            <p className="text-xs text-secondary-600 mt-1">{payment.description}</p>
                          )}
                          <p className="text-xs text-secondary-400 mt-1">
                            {t('payments.requestedBy')} {payment.requestedBy?.fullName} • {formatDate(payment.createdAt)}
                          </p>
                          {payment.status === 'rejected' && payment.rejectionReason && (
                            <div className="mt-2 p-2 bg-danger-50 rounded-lg border border-danger-200">
                              <p className="text-xs text-danger-700">
                                {t('payments.rejectionReason')}: {payment.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {payments.length > 10 && (
                    <p className="text-center text-sm text-secondary-500 py-2">
                      {t('common.viewAll')} ({payments.length} {t('payments.payments')})
                    </p>
                  )}
                </div>
              </div>
            </HoverCard>
          )}

          {/* Pending Payment Requests */}
          {hasRole('contractor', 'project_manager') && pendingPayments.filter(p => p.project?._id === id).length > 0 && (
            <HoverCard className="border-warning-300">
              <div className="px-6 py-5 border-b border-warning-200 bg-gradient-to-r from-warning-50 to-transparent">
                <SectionHeader
                  icon={ClockIcon}
                  title={t('payments.pendingPayments') || 'Pending Payment Requests'}
                />
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {pendingPayments
                    .filter((p) => p.project?._id === id)
                    .map((payment) => (
                      <div
                        key={payment._id}
                        className="p-4 border-2 border-warning-200 bg-warning-50/50 rounded-xl hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-secondary-900 mb-1">
                              {formatCurrency(payment.amount, payment.currency)}
                            </p>
                            <p className="text-xs text-secondary-600">
                              {t('payments.from')} {payment.requestedBy?.fullName}
                            </p>
                            {payment.description && (
                              <p className="text-xs text-secondary-700 mt-1">{payment.description}</p>
                            )}
                            <p className="text-xs text-secondary-400 mt-1">{formatDate(payment.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-warning-200">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApprovePayment(payment._id)}
                            className="flex-1"
                          >
                            {t('payments.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => openRejectModal(payment._id)}
                            className="flex-1"
                          >
                            {t('payments.reject')}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </HoverCard>
          )}

          {/* Reports & Contract Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports Card */}
            <HoverCard>
              <div className="px-6 py-5 border-b border-secondary-100 bg-gradient-to-r from-primary-50/50 to-transparent">
                <SectionHeader
                  icon={DocumentTextIcon}
                  title={t('projects.projectReports') || 'Project Reports'}
                  action={
                    (hasRole('super_admin') || hasRole('admin')) && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={DocumentTextIcon}
                        onClick={() => document.getElementById('reportFileInput')?.click()}
                        disabled={uploadingReport}
                      >
                        {uploadingReport ? t('common.loading') : (t('projects.uploadReport') || 'Upload Report')}
                      </Button>
                    )
                  }
                />
              </div>
              <div className="p-6">
                {project?.projectReports && project.projectReports.length > 0 ? (
                  <div className="space-y-3">
                    {project.projectReports.map((report) => (
                      <div
                        key={report._id}
                        className="p-4 bg-secondary-50 rounded-xl border-2 border-secondary-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                            {report.fileType?.startsWith('image/') ? (
                              <PhotoIcon className="w-6 h-6 text-primary-600" />
                            ) : (
                              <DocumentTextIcon className="w-6 h-6 text-primary-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-secondary-900 truncate">
                              {report.fileName || t('projects.reportFile') || 'Report File'}
                            </p>
                            <p className="text-xs text-secondary-500 mt-0.5">
                              {formatDate(report.uploadedAt)} {report.uploadedBy && `• ${report.uploadedBy.fullName || ''}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewReport(report._id)}
                              className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-all hover:scale-110"
                              title={t('common.view')}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            {(hasRole('super_admin') || hasRole('admin')) && (
                              <button
                                onClick={() => handleDeleteReport(report._id)}
                                className="p-2.5 text-danger-600 hover:bg-danger-50 rounded-lg transition-all hover:scale-110"
                                title={t('common.delete')}
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-100 mx-auto mb-3 flex items-center justify-center">
                      <DocumentTextIcon className="w-7 h-7 text-secondary-400" />
                    </div>
                    <p className="text-secondary-500 text-sm mb-4">{t('projects.noProjectReports') || 'No reports uploaded'}</p>
                    {(hasRole('super_admin') || hasRole('admin')) && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={DocumentTextIcon}
                        onClick={() => document.getElementById('reportFileInput')?.click()}
                        disabled={uploadingReport}
                      >
                        {uploadingReport ? t('common.loading') : (t('projects.uploadReport') || 'Upload Report')}
                      </Button>
                    )}
                  </div>
                )}
                <input
                  id="reportFileInput"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,application/pdf,image/*"
                  className="hidden"
                  onChange={handleReportFileChange}
                />
              </div>
            </HoverCard>

            {/* Contract Card */}
            <HoverCard>
              <div className="px-6 py-5 border-b border-secondary-100 bg-gradient-to-r from-warning-50/50 to-transparent">
                <SectionHeader
                  icon={DocumentIcon}
                  title={t('projects.contract') || 'Contract'}
                  action={
                    (hasRole('super_admin') || hasRole('admin')) && project.contract?.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={PencilIcon}
                        onClick={() => document.getElementById('contractFileInput')?.click()}
                      >
                        {t('projects.replaceContract') || 'Replace'}
                      </Button>
                    )
                  }
                />
              </div>
              <div className="p-6">
                {project.contract?.url ? (
                  <div className="p-4 bg-secondary-50 rounded-xl border-2 border-secondary-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-warning-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                        {project.contract.fileType?.startsWith('image/') ? (
                          <PhotoIcon className="w-7 h-7 text-warning-600" />
                        ) : (
                          <DocumentIcon className="w-7 h-7 text-warning-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-secondary-900 truncate">
                          {project.contract.fileName || t('projects.contractFile')}
                        </p>
                        <p className="text-xs text-secondary-500 mt-0.5">
                          {formatDate(project.contract.uploadedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleViewContract}
                          className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-all hover:scale-110"
                          title={t('common.view')}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {(hasRole('super_admin') || hasRole('admin')) && (
                          <button
                            onClick={handleDeleteContract}
                            className="p-2.5 text-danger-600 hover:bg-danger-50 rounded-lg transition-all hover:scale-110"
                            title={t('common.delete')}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-100 mx-auto mb-3 flex items-center justify-center">
                      <DocumentIcon className="w-7 h-7 text-secondary-400" />
                    </div>
                    <p className="text-secondary-500 text-sm mb-4">{t('projects.noContract')}</p>
                    {(hasRole('super_admin') || hasRole('admin')) && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={DocumentIcon}
                        onClick={() => document.getElementById('contractFileInput')?.click()}
                      >
                        {t('projects.uploadContract')}
                      </Button>
                    )}
                  </div>
                )}
                <input
                  id="contractFileInput"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,application/pdf,image/*"
                  className="hidden"
                  onChange={handleContractFileChange}
                />
              </div>
            </HoverCard>
          </div>
        </div>

        {/* ========== RIGHT COLUMN (SIDEBAR) ========== */}
        <div className="space-y-6">

          {/* Progress Card */}
          <HoverCard>
            <div className="p-6">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      className="text-secondary-100"
                      strokeWidth="12"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="80"
                      cy="80"
                    />
                    <circle
                      className="text-primary-500 drop-shadow-md"
                      strokeWidth="12"
                      strokeDasharray={`${project.progress * 3.64} 364`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="80"
                      cy="80"
                      style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-secondary-900">{project.progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                  <p className="text-sm font-medium text-secondary-700">
                    {t('projects.projectCompletion')}
                  </p>
                </div>
              </div>
            </div>
          </HoverCard>

          {/* Project Type Card */}
          <HoverCard>
            <div className="p-6 text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 mx-auto mb-4 flex items-center justify-center border-2 border-primary-200 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                {project.projectType === PROJECT_TYPES.MOSQUE ? (
                  <img src="/m.webp" alt="Mosque" className="w-full h-full object-cover" />
                ) : project.projectType === PROJECT_TYPES.WELL ? (
                  <img src="/w.webp" alt="Well" className="w-full h-full object-cover" />
                ) : (
                  <img src="/w.webp" alt="Well" className="w-full h-full object-cover" />
                )}
              </div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">
                {language === 'ar' && project.projectNameAr ? project.projectNameAr : project.projectName}
              </h3>
              <p className="text-sm text-secondary-500">
                {project.country}{project.region ? `, ${project.region}` : ''}
              </p>
              <div className="mt-4">
                <Badge status={project.status} size="md" dot>
                  {t(`projects.statuses.${project.status}`)}
                </Badge>
              </div>
            </div>
          </HoverCard>

          {/* <HoverCard>
            <div className="px-6 py-5 border-b border-secondary-100 bg-gradient-to-r from-primary-50/50 to-transparent">
              <SectionHeader
                icon={DocumentTextIcon}
                title={t('reports.contractorReports')}
                action={
                  hasRole('contractor') && (
                    <Link to={`/reports/new?project=${id}`}>
                      <Button size="sm" variant="outline" icon={DocumentTextIcon}>
                        {t('reports.newReport')}
                      </Button>
                    </Link>
                  )
                }
              />
            </div>
            <div className="p-4">
              {reports.length > 0 ? (
                <div className="space-y-2">
                  {reports.slice(0, 5).map((report) => (
                    <Link
                      key={report._id}
                      to={`/reports/${report._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-transparent hover:bg-secondary-50 hover:border-secondary-200 hover:shadow-sm transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0 group-hover:bg-success-100 group-hover:scale-110 transition-all">
                        <DocumentTextIcon className="w-5 h-5 text-success-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-900 truncate">
                          {language === 'ar' && report.titleAr ? report.titleAr : report.title}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {report.reportNumber} • {formatDate(report.workDate)}
                        </p>
                      </div>
                      <Badge status={report.status} size="sm">
                        {t(`reports.statuses.${report.status}`)}
                      </Badge>
                      <ChevronRightIcon className="w-4 h-4 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                  {reports.length > 5 && (
                    <Link
                      to={`/reports?project=${id}`}
                      className="block text-center py-3 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      {t('dashboard.viewAll')} ({reports.length})
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-secondary-100 mx-auto mb-3 flex items-center justify-center">
                    <DocumentTextIcon className="w-7 h-7 text-secondary-400" />
                  </div>
                  <p className="text-secondary-500 text-sm">{t('reports.noReports')}</p>
                </div>
              )}
            </div>
          </HoverCard> */}

          {/* Beneficiaries Card */}
          {project.beneficiaries && (project.beneficiaries.estimatedFamilies || project.beneficiaries.estimatedPeople) && (
            <HoverCard>
              <div className="px-6 py-4 border-b border-secondary-100">
                <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider">
                  {t('projects.beneficiaries')}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {project.beneficiaries.estimatedFamilies && (
                  <div className="group flex items-center justify-between p-4 bg-success-50 rounded-xl border-2 border-success-200 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <UserIcon className="w-5 h-5 text-success-600" />
                      </div>
                      <span className="text-sm font-medium text-secondary-700">{t('projects.families')}</span>
                    </div>
                    <span className="text-xl font-bold text-success-600 group-hover:scale-110 transition-transform">
                      {project.beneficiaries.estimatedFamilies.toLocaleString()}
                    </span>
                  </div>
                )}
                {project.beneficiaries.estimatedPeople && (
                  <div className="group flex items-center justify-between p-4 bg-info-50 rounded-xl border-2 border-info-200 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <UserIcon className="w-5 h-5 text-info-600" />
                      </div>
                      <span className="text-sm font-medium text-secondary-700">{t('projects.people')}</span>
                    </div>
                    <span className="text-xl font-bold text-info-600 group-hover:scale-110 transition-transform">
                      {project.beneficiaries.estimatedPeople.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </HoverCard>
          )}

          {/* Project Media - Only for Contractors */}
          {hasRole('contractor') && (
            project.contractor?._id?.toString() === user?._id?.toString() ||
            (typeof project.contractor === 'string' && project.contractor === user?._id?.toString())
          ) && (
              <HoverCard>
                <div className="px-6 py-4 border-b border-secondary-100">
                  <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider">
                    {t('projects.projectMedia') || 'Project Media'}
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="p-4 bg-secondary-50 rounded-xl border-2 border-dashed border-secondary-300 hover:border-primary-300 transition-colors">
                    <div className="space-y-3">
                      <Input
                        value={newMediaName}
                        onChange={(e) => setNewMediaName(e.target.value)}
                        placeholder={t('projects.mediaNamePlaceholder') || 'Media name...'}
                        className="text-sm"
                      />
                      <input
                        id="projectMediaFileInput"
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*,application/pdf,.doc,.docx,video/*"
                        className="block w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                      />
                      {newMediaFile && (
                        <div className="flex items-center gap-2 text-sm text-secondary-600">
                          <DocumentIcon className="w-4 h-4" />
                          <span className="truncate">{newMediaFile.name}</span>
                          <span className="text-secondary-400">
                            ({(newMediaFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      )}
                      <Button
                        type="button"
                        onClick={handleUploadMedia}
                        loading={uploadingMedia}
                        disabled={!newMediaFile || !newMediaName.trim()}
                        size="sm"
                        icon={PhotoIcon}
                        className="w-full"
                      >
                        {t('projects.uploadMedia') || 'Upload'}
                      </Button>
                    </div>
                  </div>

                  {project.media && project.media.length > 0 && (
                    <div className="space-y-2">
                      {project.media.map((media) => {
                        const Icon = getFileIcon(media.fileType);
                        return (
                          <div
                            key={media._id}
                            className="flex items-center gap-3 p-3 bg-white border-2 border-secondary-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-secondary-900 truncate">{media.name}</p>
                              <p className="text-xs text-secondary-500">{formatDate(media.uploadedAt)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <a
                                href={media.googleDriveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors hover:scale-110"
                              >
                                <LinkIcon className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleDeleteMedia(media._id)}
                                className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors hover:scale-110"
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </HoverCard>
            )}

          {/* Google Drive Folder Link */}
          {project.googleDriveFolderUrl && (
            <a
              href={project.googleDriveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-secondary-200 shadow-sm hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 group-hover:scale-110 transition-all">
                <FolderIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-secondary-900">
                  {t('projects.projectFolder')}
                </p>
                <p className="text-xs text-secondary-500">{t('projects.openInGoogleDrive') || 'Open in Google Drive'}</p>
              </div>
              <ArrowTopRightOnSquareIcon className="w-5 h-5 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </a>
          )}

          {/* Review Information */}
          {project.reviewedBy && (
            <HoverCard>
              <div className="px-6 py-4 border-b border-secondary-100 bg-gradient-to-r from-info-50/50 to-transparent">
                <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider">
                  {t('projects.reviewInformation')}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.reviewedBy')}
                  value={project.reviewedBy?.fullName}
                />
                {project.reviewedAt && (
                  <InfoItem
                    icon={CalendarIcon}
                    label={t('projects.reviewedAt')}
                    value={formatDate(project.reviewedAt)}
                  />
                )}
                {project.reviewStatus && (
                  <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                    <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
                      {t('projects.reviewStatus')}
                    </p>
                    <Badge
                      status={
                        project.reviewStatus === 'approved' ? 'approved' :
                          project.reviewStatus === 'needs_revision' ? 'rejected' : 'submitted'
                      }
                      size="md"
                    >
                      {t(`projects.reviewStatuses.${project.reviewStatus}`)}
                    </Badge>
                  </div>
                )}
                {project.reviewNotes && (
                  <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                    <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
                      {t('projects.reviewNotes')}
                    </p>
                    <p className="text-sm text-secondary-700 whitespace-pre-wrap">{project.reviewNotes}</p>
                  </div>
                )}
              </div>
            </HoverCard>
          )}

          {/* Client Evaluation */}
          {project.clientEvaluation?.evaluatedAt && (hasRole('client') || hasRole('super_admin') || hasRole('admin')) && (
            <HoverCard>
              <div className="px-6 py-4 border-b border-secondary-100 bg-gradient-to-r from-warning-50/50 to-transparent">
                <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider">
                  {hasRole('client') ? (t('projects.myEvaluation') || 'Your Evaluation') : (t('projects.clientEvaluation') || 'Client Evaluation')}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {project.clientEvaluation.starRating && (
                  <div className="text-center p-4 bg-warning-50 rounded-xl border-2 border-warning-200">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {Array.from({ length: 7 }, (_, index) => (
                        <StarIcon
                          key={index}
                          className={`w-6 h-6 transition-transform hover:scale-125 ${index < project.clientEvaluation.starRating
                            ? 'text-yellow-400'
                            : 'text-secondary-200'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-secondary-700">
                      {project.clientEvaluation.starRating} / 7
                    </p>
                  </div>
                )}
                {project.clientEvaluation.notes && (
                  <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                    <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
                      {t('projects.notes')}
                    </p>
                    <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                      {project.clientEvaluation.notes}
                    </p>
                  </div>
                )}
              </div>
            </HoverCard>
          )}

          {/* Admin Evaluation */}
          {(project.evaluation?.evaluatedBy || project.evaluation?.evaluatedAt) && !hasRole('client') && (
            <HoverCard>
              <div className="px-6 py-4 border-b border-secondary-100 bg-gradient-to-r from-success-50/50 to-transparent">
                <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider">
                  {t('projects.evaluationInformation')}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <InfoItem
                  icon={UserIcon}
                  label={t('projects.evaluatedBy')}
                  value={project.evaluation.evaluatedBy?.fullName || project.client?.name || t('projects.client')}
                />
                {project.evaluation.evaluatedAt && (
                  <InfoItem
                    icon={CalendarIcon}
                    label={t('projects.evaluatedAt')}
                    value={formatDate(project.evaluation.evaluatedAt)}
                  />
                )}
                {(project.evaluation.overallScore !== undefined ||
                  project.evaluation.qualityScore !== undefined ||
                  project.evaluation.timelineScore !== undefined ||
                  project.evaluation.budgetScore !== undefined) && (
                    <div className="grid grid-cols-2 gap-3">
                      {project.evaluation.overallScore !== undefined && (
                        <div className="group p-3 bg-primary-50 rounded-xl border-2 border-primary-200 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                          <p className="text-xs text-secondary-500 mb-1">{t('projects.overallScore')}</p>
                          <p className="text-xl font-bold text-primary-600 group-hover:scale-110 transition-transform">{project.evaluation.overallScore}/10</p>
                        </div>
                      )}
                      {project.evaluation.qualityScore !== undefined && (
                        <div className="group p-3 bg-success-50 rounded-xl border-2 border-success-200 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                          <p className="text-xs text-secondary-500 mb-1">{t('projects.qualityScore')}</p>
                          <p className="text-xl font-bold text-success-600 group-hover:scale-110 transition-transform">{project.evaluation.qualityScore}/10</p>
                        </div>
                      )}
                      {project.evaluation.timelineScore !== undefined && (
                        <div className="group p-3 bg-warning-50 rounded-xl border-2 border-warning-200 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                          <p className="text-xs text-secondary-500 mb-1">{t('projects.timelineScore')}</p>
                          <p className="text-xl font-bold text-warning-600 group-hover:scale-110 transition-transform">{project.evaluation.timelineScore}/10</p>
                        </div>
                      )}
                      {project.evaluation.budgetScore !== undefined && (
                        <div className="group p-3 bg-info-50 rounded-xl border-2 border-info-200 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                          <p className="text-xs text-secondary-500 mb-1">{t('projects.budgetScore')}</p>
                          <p className="text-xl font-bold text-info-600 group-hover:scale-110 transition-transform">{project.evaluation.budgetScore}/10</p>
                        </div>
                      )}
                    </div>
                  )}
                {project.evaluation.evaluationNotes && (
                  <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
                    <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
                      {t('projects.evaluationNotes')}
                    </p>
                    <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                      {project.evaluation.evaluationNotes}
                    </p>
                  </div>
                )}
              </div>
            </HoverCard>
          )}
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

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

      {/* Client Evaluation Modal */}
      <Modal
        isOpen={clientEvaluationModal}
        onClose={() => {
          setClientEvaluationModal(false);
          setClientEvaluationData({ starRating: 0, notes: '' });
        }}
        title={t('projects.clientEvaluateProject') || 'Rate This Project'}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">
              {t('projects.rateProject') || 'Rate this project'} <span className="text-danger-500">*</span>
            </label>
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
              <StarRating
                value={clientEvaluationData.starRating}
                onChange={(rating) => setClientEvaluationData(prev => ({ ...prev, starRating: rating }))}
                maxStars={7}
                size="xl"
              />
              {clientEvaluationData.starRating > 0 && (
                <p className="mt-4 text-sm font-medium text-secondary-600">
                  {clientEvaluationData.starRating === 7 && (t('projects.excellent') || 'Excellent!')}
                  {clientEvaluationData.starRating === 6 && (t('projects.veryGood') || 'Very Good!')}
                  {clientEvaluationData.starRating === 5 && (t('projects.good') || 'Good!')}
                  {clientEvaluationData.starRating === 4 && (t('projects.fair') || 'Fair')}
                  {clientEvaluationData.starRating === 3 && (t('projects.average') || 'Average')}
                  {clientEvaluationData.starRating === 2 && (t('projects.belowAverage') || 'Below Average')}
                  {clientEvaluationData.starRating === 1 && (t('projects.poor') || 'Poor')}
                </p>
              )}
            </div>
          </div>

          <Textarea
            label={`${t('projects.notes') || 'Notes'} (${t('common.optional') || 'Optional'})`}
            value={clientEvaluationData.notes}
            onChange={(e) => setClientEvaluationData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={t('projects.evaluationNotesPlaceholder') || 'Share your thoughts about this project...'}
            rows={4}
          />

          <div className="flex gap-3 pt-4 border-t border-secondary-100">
            <Button
              variant="outline"
              onClick={() => {
                setClientEvaluationModal(false);
                setClientEvaluationData({ starRating: 0, notes: '' });
              }}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleClientEvaluation}
              loading={clientEvaluationLoading}
              disabled={!clientEvaluationData.starRating || clientEvaluationData.starRating < 1}
              className="flex-1"
            >
              {t('projects.submitEvaluation') || 'Submit Evaluation'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Admin Evaluation Modal */}
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
              type="text"
              name="overallScore"
              value={evaluationData.overallScore}
              onChange={(e) => handleScoreChange('overallScore', e.target.value)}
              placeholder="0-10"
            />
            <Input
              label={t('projects.qualityScore') || 'Quality Score (0-10)'}
              type="text"
              name="qualityScore"
              value={evaluationData.qualityScore}
              onChange={(e) => handleScoreChange('qualityScore', e.target.value)}
              placeholder="0-10"
            />
            <Input
              label={t('projects.timelineScore') || 'Timeline Score (0-10)'}
              type="text"
              name="timelineScore"
              value={evaluationData.timelineScore}
              onChange={(e) => handleScoreChange('timelineScore', e.target.value)}
              placeholder="0-10"
            />
            <Input
              label={t('projects.budgetScore') || 'Budget Score (0-10)'}
              type="text"
              name="budgetScore"
              value={evaluationData.budgetScore}
              onChange={(e) => handleScoreChange('budgetScore', e.target.value)}
              placeholder="0-10"
            />
          </div>
          <Textarea
            label={`${t('projects.evaluationNotes') || 'Evaluation Notes'} (${t('common.optional')})`}
            value={evaluationData.evaluationNotes}
            onChange={(e) => setEvaluationData((prev) => ({ ...prev, evaluationNotes: e.target.value }))}
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

      {/* Payment Request Modal */}
      {canReview && project && (
        <Modal
          isOpen={paymentModal}
          onClose={() => {
            setPaymentModal(false);
            setPaymentData({
              amount: '',
              currency: project.budget?.currency || 'USD',
              recipientId: '',
              recipientType: 'contractor',
              description: '',
            });
          }}
          title={t('payments.createPayment') || 'Create Payment Request'}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('payments.amount') || 'Amount'}
                type="number"
                name="amount"
                value={paymentData.amount}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, amount: e.target.value }))}
                min="0"
                step="0.01"
                required
                icon={CurrencyDollarIcon}
              />
              <Select
                label={t('payments.currency') || 'Currency'}
                name="currency"
                value={paymentData.currency}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, currency: e.target.value }))}
                options={[
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'SAR', label: 'SAR' },
                ]}
                required
              />
            </div>
            <Select
              label={t('payments.recipientType') || 'Recipient Type'}
              name="recipientType"
              value={paymentData.recipientType}
              onChange={(e) => setPaymentData((prev) => ({ ...prev, recipientType: e.target.value, recipientId: '' }))}
              options={[
                { value: 'contractor', label: t('projects.contractor') },
                { value: 'project_manager', label: t('projects.projectManager') },
              ]}
              required
            />
            <Select
              label={t('payments.recipient') || 'Recipient'}
              name="recipientId"
              value={paymentData.recipientId}
              onChange={(e) => setPaymentData((prev) => ({ ...prev, recipientId: e.target.value }))}
              options={[
                ...(paymentData.recipientType === 'contractor' && project.contractor
                  ? [{ value: project.contractor._id, label: `${project.contractor.fullName} (${project.contractor.email})` }]
                  : []),
                ...(paymentData.recipientType === 'project_manager' && project.projectManager
                  ? [{ value: project.projectManager._id, label: `${project.projectManager.fullName} (${project.projectManager.email})` }]
                  : []),
              ]}
              required
            />
            <Textarea
              label={`${t('payments.description') || 'Description'} (${t('common.optional')})`}
              value={paymentData.description}
              onChange={(e) => setPaymentData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder={t('payments.descriptionPlaceholder') || 'Add payment description...'}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setPaymentModal(false);
                setPaymentData({
                  amount: '',
                  currency: project.budget?.currency || 'USD',
                  recipientId: '',
                  recipientType: 'contractor',
                  description: '',
                });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreatePayment} loading={paymentLoading}>
              {t('payments.createPayment')}
            </Button>
          </div>
        </Modal>
      )}

      {/* Reject Payment Modal */}
      <Modal
        isOpen={rejectPaymentModal}
        onClose={() => {
          setRejectPaymentModal(false);
          setRejectingPaymentId(null);
          setRejectionReason('');
        }}
        title={t('payments.rejectPayment') || 'Reject Payment Request'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-600">
            {t('payments.rejectPaymentMessage') || 'Please provide a reason for rejecting this payment request.'}
          </p>
          <Textarea
            label={t('payments.rejectionReason') || 'Rejection Reason'}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            placeholder={t('payments.rejectionReasonPlaceholder') || 'Enter the reason for rejection...'}
            required
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setRejectPaymentModal(false);
              setRejectingPaymentId(null);
              setRejectionReason('');
            }}
            disabled={rejectLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (rejectionReason.trim()) {
                handleRejectPayment(rejectingPaymentId, rejectionReason);
              } else {
                toast.error(t('payments.rejectionReasonRequired') || 'Rejection reason is required');
              }
            }}
            loading={rejectLoading}
            disabled={!rejectionReason.trim()}
          >
            {t('payments.reject')}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
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