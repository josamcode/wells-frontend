import React, { useState, useEffect } from 'react';
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
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const ProjectDetail = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchReports();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getById(id);
      setProject(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getAll({ project: id, limit: 10 });
      setReports(response.data.data.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleArchive = async () => {
    try {
      await projectsAPI.toggleArchive(id);
      toast.success(project.isArchived ? 'Project unarchived' : 'Project archived');
      fetchProject();
    } catch (error) {
      toast.error('Failed to archive project');
    }
  };

  if (loading) return <Loading />;
  if (!project) return null;

  const canEdit = hasRole('super_admin', 'admin', 'project_manager');
  const canDelete = hasRole('super_admin', 'admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {language === 'ar' && project.projectNameAr ? project.projectNameAr : project.projectName}
            </h1>
            <Badge status={project.status}>
              {t(`projects.statuses.${project.status}`)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{project.projectNumber}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <>
              <Link to={`/projects/${id}/edit`}>
                <Button size="sm">
                  <PencilIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                  {t('common.edit')}
                </Button>
              </Link>
              <Button size="sm" variant="secondary" onClick={handleArchive}>
                <ArchiveBoxIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                {project.isArchived ? 'Unarchive' : 'Archive'}
              </Button>
            </>
          )}
          {canDelete && (
            <Button size="sm" variant="danger" onClick={() => setDeleteModal(true)}>
              <TrashIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card title={t('projects.details')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={MapPinIcon}
                label={t('projects.country')}
                value={`${project.country}${project.city ? `, ${project.city}` : ''}`}
              />
              <InfoItem
                icon={UserIcon}
                label={t('projects.contractor')}
                value={project.contractor?.fullName || 'Not assigned'}
              />
              <InfoItem
                icon={UserIcon}
                label={t('projects.projectManager')}
                value={project.projectManager?.fullName || 'Not assigned'}
              />
              <InfoItem
                icon={CurrencyDollarIcon}
                label={t('projects.budget')}
                value={project.budget?.amount ? `${project.budget.amount} ${project.budget.currency}` : 'N/A'}
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
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('projects.description')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {language === 'ar' && project.descriptionAr ? project.descriptionAr : project.description}
                </p>
              </div>
            )}
          </Card>

          {/* Well Details */}
          {project.wellDetails && (
            <Card title="Well Specifications">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.wellDetails.depth && (
                  <div>
                    <p className="text-xs text-gray-500">Depth</p>
                    <p className="text-sm font-medium">{project.wellDetails.depth}m</p>
                  </div>
                )}
                {project.wellDetails.diameter && (
                  <div>
                    <p className="text-xs text-gray-500">Diameter</p>
                    <p className="text-sm font-medium">{project.wellDetails.diameter}cm</p>
                  </div>
                )}
                {project.wellDetails.capacity && (
                  <div>
                    <p className="text-xs text-gray-500">Capacity</p>
                    <p className="text-sm font-medium">{project.wellDetails.capacity}L/h</p>
                  </div>
                )}
                {project.wellDetails.waterQuality && (
                  <div>
                    <p className="text-xs text-gray-500">Water Quality</p>
                    <p className="text-sm font-medium">{project.wellDetails.waterQuality}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Reports */}
          <Card
            title={t('reports.title')}
            actions={
              hasRole('contractor') ? (
                <Link to={`/reports/new?project=${id}`}>
                  <Button size="sm">
                    <DocumentTextIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
                    New Report
                  </Button>
                </Link>
              ) : null
            }
          >
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report) => (
                  <Link
                    key={report._id}
                    to={`/reports/${report._id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {language === 'ar' && report.titleAr ? report.titleAr : report.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {report.reportNumber} • {formatDate(report.workDate)}
                        </p>
                      </div>
                      <Badge status={report.status}>
                        {t(`reports.statuses.${report.status}`)}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No reports yet</p>
            )}
          </Card>
        </div>

        {/* Right Column - Stats & Timeline */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card title={t('projects.progress')}>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle
                    className="text-gray-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary-600"
                    strokeWidth="8"
                    strokeDasharray={`${project.progress * 3.52} 352`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-gray-900">
                  {project.progress}%
                </span>
              </div>
            </div>
          </Card>

          {/* Beneficiaries */}
          {project.beneficiaries && (
            <Card title="Beneficiaries">
              <div className="space-y-3">
                {project.beneficiaries.estimatedFamilies && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Families</span>
                    <span className="text-sm font-medium">
                      {project.beneficiaries.estimatedFamilies}
                    </span>
                  </div>
                )}
                {project.beneficiaries.estimatedPeople && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">People</span>
                    <span className="text-sm font-medium">
                      {project.beneficiaries.estimatedPeople}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Google Drive */}
          {project.googleDriveFolderUrl && (
            <Card title="Documents">
              <a
                href={project.googleDriveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                Open Google Drive Folder
              </a>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete this project? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

export default ProjectDetail;
