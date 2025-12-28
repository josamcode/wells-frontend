import React, { useState, useEffect, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsAPI } from '../../api/projects';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import SearchableSelect from '../../components/common/SearchableSelect';
import Textarea from '../../components/common/Textarea';
import { COUNTRIES, PROJECT_STATUS, PROJECT_TYPES } from '../../utils/constants';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  MapPinIcon,
  CogIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

// ==================== REUSABLE COMPONENTS ====================

// Enhanced 3D Section Card with hover effects
const SectionCard = memo(({ icon: Icon, title, subtitle, children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'from-secondary-50/80 to-transparent border-secondary-200',
    primary: 'from-primary-50/80 to-transparent border-primary-200',
    success: 'from-success-50/80 to-transparent border-success-200',
    warning: 'from-warning-50/80 to-transparent border-warning-200',
    info: 'from-info-50/80 to-transparent border-info-200',
    purple: 'from-purple-50/80 to-transparent border-purple-200',
  };

  const iconVariants = {
    default: 'from-secondary-400 to-secondary-600',
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success-400 to-success-600',
    warning: 'from-warning-400 to-warning-600',
    info: 'from-info-400 to-info-600',
    purple: 'from-purple-400 to-purple-600',
  };

  const glowVariants = {
    default: 'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)]',
    primary: 'hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.2)]',
    success: 'hover:shadow-[0_25px_50px_-12px_rgba(34,197,94,0.2)]',
    warning: 'hover:shadow-[0_25px_50px_-12px_rgba(234,179,8,0.2)]',
    info: 'hover:shadow-[0_25px_50px_-12px_rgba(6,182,212,0.2)]',
    purple: 'hover:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.2)]',
  };

  return (
    <div
      className={`
        group/card bg-white rounded-2xl border-2 overflow-hidden
        shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.04)]
        transition-all duration-300 ease-out
        hover:-translate-y-2 
        hover:border-opacity-80
        ${glowVariants[variant]}
        relative
        ${className}
      `}
    >
      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

      {/* Inner glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className={`px-6 py-5 border-b bg-gradient-to-r ${variants[variant]}`}>
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`
              w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center
              shadow-lg transition-all duration-300
              group-hover/card:scale-110 group-hover/card:rotate-3
              ${iconVariants[variant]}
            `}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-secondary-900">{title}</h3>
            {subtitle && <p className="text-sm text-secondary-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative">
        {children}
      </div>
    </div>
  );
});

SectionCard.displayName = 'SectionCard';

// Enhanced Form Field with subtle hover effect
const FormField = memo(({ children, className = '', span = false }) => (
  <div className={`
    group/field relative transition-all duration-200
    ${span ? 'md:col-span-2' : ''}
    ${className}
  `}>
    {children}
  </div>
));

FormField.displayName = 'FormField';

// Stat tile for specifications
const SpecTile = memo(({ label, children, variant = 'default' }) => {
  const variants = {
    default: 'from-secondary-50 to-secondary-100/50 border-secondary-200 hover:border-secondary-300',
    primary: 'from-primary-50 to-primary-100/50 border-primary-200 hover:border-primary-300',
    success: 'from-success-50 to-success-100/50 border-success-200 hover:border-success-300',
    warning: 'from-warning-50 to-warning-100/50 border-warning-200 hover:border-warning-300',
    info: 'from-info-50 to-info-100/50 border-info-200 hover:border-info-300',
  };

  return (
    <div className={`
      group p-4 rounded-xl bg-gradient-to-br border-2 
      transition-all duration-300 ease-out
      hover:shadow-lg hover:-translate-y-1
      ${variants[variant]}
    `}>
      <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2 
        group-hover:text-secondary-700 transition-colors">
        {label}
      </label>
      {children}
    </div>
  );
});

SpecTile.displayName = 'SpecTile';

// ==================== MAIN COMPONENT ====================

const ProjectForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [projectCreatedBy, setProjectCreatedBy] = useState(null);
  const [originalProjectType, setOriginalProjectType] = useState(null);
  const [formData, setFormData] = useState({
    projectNumber: '',
    projectType: 'well',
    projectName: '',
    description: '',
    country: '',
    region: '',
    city: '',
    status: 'planned',
    contractor: '',
    projectManager: '',
    budgetAmount: '',
    budgetCurrency: 'USD',
    startDate: '',
    expectedEndDate: '',
    progress: 0,
    locationLatitude: '',
    locationLongitude: '',
    locationAddress: '',
    wellDepth: '',
    wellDiameter: '',
    wellCapacity: '',
    wellWaterQuality: '',
    wellPumpType: '',
    mosqueArea: '',
    mosqueCapacity: '',
    mosqueMinarets: '',
    mosqueDomes: '',
    mosquePrayerHalls: '',
    mosqueAblutionFacilities: '',
    mosqueParkingSpaces: '',
    otherDetails: '',
    estimatedFamilies: '',
    estimatedPeople: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    priority: 'medium',
    notes: '',
  });

  useEffect(() => {
    fetchUsers();
    if (isEditMode) {
      fetchProject();
    }
  }, [id]);

  const fetchUsers = async () => {
    try {
      const [contractorsRes, managersRes] = await Promise.all([
        usersAPI.getByRole('contractor'),
        usersAPI.getByRole('project_manager'),
      ]);
      setContractors(contractorsRes.data.data);
      setProjectManagers(managersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getById(id);
      const project = response.data.data;
      setProjectCreatedBy(project.createdBy?._id || project.createdBy);
      setFormData({
        projectNumber: project.projectNumber || '',
        projectType: project.projectType || 'well',
        projectName: project.projectName || '',
        description: project.description || '',
        country: project.country || '',
        region: project.region || '',
        city: project.city || '',
        status: project.status || 'planned',
        contractor: project.contractor?._id || '',
        projectManager: project.projectManager?._id || '',
        budgetAmount: project.budget?.amount || '',
        budgetCurrency: project.budget?.currency || 'USD',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        expectedEndDate: project.expectedEndDate ? project.expectedEndDate.split('T')[0] : '',
        progress: project.progress || 0,
        locationLatitude: project.location?.latitude || '',
        locationLongitude: project.location?.longitude || '',
        locationAddress: project.location?.address || '',
        wellDepth: project.wellDetails?.depth || '',
        wellDiameter: project.wellDetails?.diameter || '',
        wellCapacity: project.wellDetails?.capacity || '',
        wellWaterQuality: project.wellDetails?.waterQuality || '',
        wellPumpType: project.wellDetails?.pumpType || '',
        mosqueArea: project.mosqueDetails?.area || '',
        mosqueCapacity: project.mosqueDetails?.capacity || '',
        mosqueMinarets: project.mosqueDetails?.minarets || '',
        mosqueDomes: project.mosqueDetails?.domes || '',
        mosquePrayerHalls: project.mosqueDetails?.prayerHalls || '',
        mosqueAblutionFacilities: project.mosqueDetails?.ablutionFacilities || '',
        mosqueParkingSpaces: project.mosqueDetails?.parkingSpaces || '',
        otherDetails: project.otherDetails ? JSON.stringify(project.otherDetails, null, 2) : '',
        estimatedFamilies: project.beneficiaries?.estimatedFamilies || '',
        estimatedPeople: project.beneficiaries?.estimatedPeople || '',
        clientName: project.client?.name || '',
        clientEmail: project.client?.email || '',
        clientPhone: project.client?.phone || '',
        priority: project.priority || 'medium',
        notes: project.notes || '',
      });
    } catch (error) {
      toast.error(t('projects.failedToFetchProject'));
      navigate('/projects');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'projectType') {
      setFormData({
        ...formData,
        projectType: value,
        wellDepth: '',
        wellDiameter: '',
        wellCapacity: '',
        wellWaterQuality: '',
        wellPumpType: '',
        mosqueArea: '',
        mosqueCapacity: '',
        mosqueMinarets: '',
        mosqueDomes: '',
        mosquePrayerHalls: '',
        mosqueAblutionFacilities: '',
        mosqueParkingSpaces: '',
        otherDetails: '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      projectType: formData.projectType || PROJECT_TYPES.WELL,
      projectName: formData.projectName,
      description: formData.description || undefined,
      country: formData.country,
      region: formData.region,
      city: formData.city,
      status: formData.status,
      contractor: formData.contractor || undefined,
      projectManager: formData.projectManager || undefined,
      budget: {
        amount: parseFloat(formData.budgetAmount) || 0,
        currency: formData.budgetCurrency,
      },
      startDate: formData.startDate || undefined,
      expectedEndDate: formData.expectedEndDate || undefined,
      progress: parseInt(formData.progress) || 0,
      location: {
        latitude: parseFloat(formData.locationLatitude) || undefined,
        longitude: parseFloat(formData.locationLongitude) || undefined,
        address: formData.locationAddress || undefined,
      },
      beneficiaries: {
        estimatedFamilies: parseInt(formData.estimatedFamilies) || undefined,
        estimatedPeople: parseInt(formData.estimatedPeople) || undefined,
      },
      client: {
        name: formData.clientName || undefined,
        email: formData.clientEmail || undefined,
        phone: formData.clientPhone || undefined,
      },
      priority: formData.priority,
      notes: formData.notes,
    };

    // If project type changed, explicitly clear old type-specific details
    if (isEditMode && originalProjectType && originalProjectType !== formData.projectType) {
      if (originalProjectType === PROJECT_TYPES.WELL) {
        payload.wellDetails = null;
      } else if (originalProjectType === PROJECT_TYPES.MOSQUE) {
        payload.mosqueDetails = null;
      } else if (originalProjectType === PROJECT_TYPES.OTHER) {
        payload.otherDetails = null;
      }
    }

    // Set new type-specific details
    if (formData.projectType === PROJECT_TYPES.WELL) {
      payload.wellDetails = {
        depth: parseFloat(formData.wellDepth) || undefined,
        diameter: parseFloat(formData.wellDiameter) || undefined,
        capacity: parseFloat(formData.wellCapacity) || undefined,
        waterQuality: formData.wellWaterQuality || undefined,
        pumpType: formData.wellPumpType || undefined,
      };
    } else if (formData.projectType === PROJECT_TYPES.MOSQUE) {
      payload.mosqueDetails = {
        area: parseFloat(formData.mosqueArea) || undefined,
        capacity: parseInt(formData.mosqueCapacity) || undefined,
        minarets: parseInt(formData.mosqueMinarets) || undefined,
        domes: parseInt(formData.mosqueDomes) || undefined,
        prayerHalls: parseInt(formData.mosquePrayerHalls) || undefined,
        ablutionFacilities: parseInt(formData.mosqueAblutionFacilities) || undefined,
        parkingSpaces: parseInt(formData.mosqueParkingSpaces) || undefined,
      };
    } else if (formData.projectType === PROJECT_TYPES.OTHER) {
      try {
        payload.otherDetails = formData.otherDetails ? JSON.parse(formData.otherDetails) : undefined;
      } catch (e) {
        payload.otherDetails = formData.otherDetails ? { notes: formData.otherDetails } : undefined;
      }
    }

    if (formData.projectNumber) {
      payload.projectNumber = formData.projectNumber;
    }

    if (!payload.projectType || !Object.values(PROJECT_TYPES).includes(payload.projectType)) {
      payload.projectType = formData.projectType || PROJECT_TYPES.WELL;
    }

    try {
      if (isEditMode) {
        await projectsAPI.update(id, payload);
        toast.success(t('projects.projectUpdated'));
      } else {
        await projectsAPI.create(payload);
        toast.success(t('users.projectCreated'));
      }
      navigate('/projects');
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = errorData?.message || t('projects.failedToSaveProject');

      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0].msg || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = Object.keys(PROJECT_STATUS).map((key) => ({
    value: PROJECT_STATUS[key],
    label: t(`projects.statuses.${PROJECT_STATUS[key]}`),
  }));

  const countryOptions = COUNTRIES.map((country) => ({
    value: country,
    label: country,
  }));

  const contractorOptions = contractors.map((user) => ({
    value: user._id,
    label: user.fullName,
  }));

  const managerOptions = projectManagers.map((user) => ({
    value: user._id,
    label: user.fullName,
  }));

  const projectTypeOptions = [
    { value: PROJECT_TYPES.WELL, label: t('projects.types.well') || 'Well' },
    { value: PROJECT_TYPES.MOSQUE, label: t('projects.types.mosque') || 'Mosque' },
    { value: PROJECT_TYPES.OTHER, label: t('projects.types.other') || 'Other' },
  ];

  const priorityOptions = [
    { value: 'low', label: t('projects.priorityLow') },
    { value: 'medium', label: t('projects.priorityMedium') },
    { value: 'high', label: t('projects.priorityHigh') },
    { value: 'urgent', label: t('projects.priorityUrgent') },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-8">
      {/* ==================== HEADER ==================== */}
      <div className="relative mb-8">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-success-100/30 rounded-full blur-3xl" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/projects"
              className="group p-3 rounded-xl bg-white border-2 border-secondary-200 text-secondary-500 
                hover:text-primary-600 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 
                transition-all duration-300 shadow-sm"
            >
              <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            </Link>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg
                  shadow-sm transition-all duration-200 hover:scale-105
                  ${isEditMode
                    ? 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-700 border border-warning-200'
                    : 'bg-gradient-to-r from-success-50 to-success-100 text-success-700 border border-success-200'
                  }
                `}>
                  {isEditMode ? (
                    <>
                      <CogIcon className="w-4 h-4" />
                      {t('common.editing') || 'Editing'}
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      {t('common.creating') || 'Creating New'}
                    </>
                  )}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 tracking-tight">
                {isEditMode ? t('common.edit') : t('common.create')} {t('projects.title')}
              </h1>
              <p className="text-secondary-500 mt-1 text-sm">
                {isEditMode
                  ? t('projects.editDescription') || 'Update project details and specifications'
                  : t('projects.createDescription') || 'Fill in the details to create a new project'
                }
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/projects')}
              className="shadow-sm hover:shadow-md"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </div>

      {/* ==================== FORM ==================== */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Information */}
        <SectionCard
          icon={DocumentTextIcon}
          title={t('projects.basicInformation')}
          subtitle={t('projects.basicInformationDesc') || 'Core project details and identification'}
          variant="primary"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Project Number */}
            {(() => {
              const isAdmin = hasRole('super_admin', 'admin');
              const isOwner = !isEditMode || (user && projectCreatedBy &&
                (projectCreatedBy._id === user._id || projectCreatedBy === user._id));
              return isAdmin || isOwner;
            })() && (
                <FormField span>
                  <div className="p-4 bg-gradient-to-br from-secondary-50 to-secondary-100/50 rounded-xl border-2 border-dashed border-secondary-300 hover:border-primary-300 transition-colors">
                    <Input
                      label={t('projects.projectNumber')}
                      name="projectNumber"
                      value={formData.projectNumber}
                      onChange={handleChange}
                      placeholder={t('projects.autoGeneratePlaceholder') || 'Leave empty for auto-generation'}
                    />
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-secondary-500">
                      <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
                      {t('projects.autoGenerateNote') || 'If left empty, a unique project number will be generated automatically'}
                    </p>
                  </div>
                </FormField>
              )}

            <FormField>
              <Select
                label={t('projects.projectType') || 'Project Type'}
                name="projectType"
                value={formData.projectType || PROJECT_TYPES.WELL}
                onChange={handleChange}
                options={projectTypeOptions}
                required
              />
            </FormField>

            <FormField>
              <Input
                label={t('projects.projectName')}
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
                placeholder={t('projects.projectNamePlaceholder') || 'Enter project name...'}
              />
            </FormField>

            <FormField span>
              <Textarea
                label={t('projects.description')}
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder={t('projects.descriptionPlaceholder') || 'Enter a detailed description of the project...'}
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Location */}
        <SectionCard
          icon={MapPinIcon}
          title={t('projects.location')}
          subtitle={t('projects.locationDesc') || 'Geographic information and address details'}
          variant="info"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField>
              <SearchableSelect
                label={t('projects.country')}
                name="country"
                value={formData.country}
                onChange={handleChange}
                options={countryOptions}
                placeholder={t('common.selectOption') || 'Select country...'}
                required
              />
            </FormField>

            <FormField>
              <Input
                label={t('projects.region')}
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder={t('projects.regionPlaceholder') || 'State, province, or region...'}
              />
            </FormField>

            <FormField>
              <Input
                label={t('projects.city')}
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder={t('projects.cityPlaceholder') || 'City or town name...'}
              />
            </FormField>

            <FormField>
              <Input
                label={t('projects.address')}
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleChange}
                placeholder={t('projects.addressPlaceholder') || 'Street address...'}
              />
            </FormField>

            <FormField>
              <Input
                label={t('projects.latitude')}
                name="locationLatitude"
                type="number"
                step="any"
                value={formData.locationLatitude}
                onChange={handleChange}
                placeholder="e.g., 24.7136"
              />
            </FormField>

            <FormField>
              <Input
                label={t('projects.longitude')}
                name="locationLongitude"
                type="number"
                step="any"
                value={formData.locationLongitude}
                onChange={handleChange}
                placeholder="e.g., 46.6753"
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Project Management */}
        <SectionCard
          icon={CogIcon}
          title={t('projects.projectManagement')}
          subtitle={t('projects.projectManagementDesc') || 'Status, team assignment and progress tracking'}
          variant="warning"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField>
              <Select
                label={t('projects.status')}
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                required
              />
            </FormField>

            <FormField>
              <Select
                label={t('projects.priority') || 'Priority'}
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
              />
            </FormField>

            <FormField>
              <Select
                label={t('projects.contractor')}
                name="contractor"
                value={formData.contractor}
                onChange={handleChange}
                options={contractorOptions}
              />
            </FormField>

            <FormField>
              <Select
                label={t('projects.projectManager')}
                name="projectManager"
                value={formData.projectManager}
                onChange={handleChange}
                options={managerOptions}
              />
            </FormField>

            <FormField span>
              <div className="p-5 bg-gradient-to-br from-primary-50/80 to-primary-100/50 rounded-xl border-2 border-primary-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-secondary-700">
                    <ChartBarIcon className="w-5 h-5 text-primary-500" />
                    {t('projects.progress')}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-primary-600">{formData.progress}</span>
                    <span className="text-lg font-bold text-primary-400">%</span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    name="progress"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={handleChange}
                    className="w-full h-4 bg-white rounded-full appearance-none cursor-pointer 
                      shadow-inner border-2 border-primary-200
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-6
                      [&::-webkit-slider-thumb]:h-6
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-gradient-to-br
                      [&::-webkit-slider-thumb]:from-primary-400
                      [&::-webkit-slider-thumb]:to-primary-600
                      [&::-webkit-slider-thumb]:shadow-lg
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-white
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:transition-transform
                      [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                </div>
                <div className="flex justify-between text-xs font-medium text-secondary-400 mt-3 px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </FormField>
          </div>
        </SectionCard>

        {/* Budget & Timeline */}
        <SectionCard
          icon={CurrencyDollarIcon}
          title={t('projects.budgetTimeline')}
          subtitle={t('projects.budgetTimelineDesc') || 'Financial allocation and project schedule'}
          variant="success"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    label={t('projects.budget')}
                    name="budgetAmount"
                    type="number"
                    step="0.01"
                    value={formData.budgetAmount}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="w-28">
                  <Select
                    label={t('projects.currency')}
                    name="budgetCurrency"
                    value={formData.budgetCurrency}
                    onChange={handleChange}
                    options={[
                      { value: 'USD', label: 'USD' },
                      { value: 'EUR', label: 'EUR' },
                      { value: 'SAR', label: 'SAR' },
                    ]}
                  />
                </div>
              </div>
            </FormField>

            <div></div>

            <FormField>
              <Input
                label={t('projects.startDate')}
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
              />
            </FormField>

            <FormField>
              <Input
                label={t('projects.expectedEndDate')}
                name="expectedEndDate"
                type="date"
                value={formData.expectedEndDate}
                onChange={handleChange}
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Well Details */}
        {formData.projectType === PROJECT_TYPES.WELL && (
          <SectionCard
            icon={WrenchScrewdriverIcon}
            title={t('projects.wellSpecifications')}
            subtitle={t('projects.wellSpecificationsDesc') || 'Technical parameters for well construction'}
            variant="info"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <SpecTile label={t('projects.depth')} variant="info">
                <Input
                  name="wellDepth"
                  type="number"
                  step="0.1"
                  value={formData.wellDepth}
                  onChange={handleChange}
                  placeholder="meters"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.diameter')} variant="primary">
                <Input
                  name="wellDiameter"
                  type="number"
                  step="0.1"
                  value={formData.wellDiameter}
                  onChange={handleChange}
                  placeholder="cm"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.capacity')} variant="success">
                <Input
                  name="wellCapacity"
                  type="number"
                  value={formData.wellCapacity}
                  onChange={handleChange}
                  placeholder="L/hour"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.waterQuality')} variant="warning">
                <Input
                  name="wellWaterQuality"
                  value={formData.wellWaterQuality}
                  onChange={handleChange}
                  placeholder="e.g., Fresh"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.pumpType')} variant="default">
                <Input
                  name="wellPumpType"
                  value={formData.wellPumpType}
                  onChange={handleChange}
                  placeholder="e.g., Solar"
                  className="bg-white/80"
                />
              </SpecTile>
            </div>
          </SectionCard>
        )}

        {/* Mosque Details */}
        {formData.projectType === PROJECT_TYPES.MOSQUE && (
          <SectionCard
            icon={BuildingOfficeIcon}
            title={t('projects.mosqueSpecifications') || 'Mosque Specifications'}
            subtitle={t('projects.mosqueSpecificationsDesc') || 'Facility specifications and capacity details'}
            variant="warning"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <SpecTile label={t('projects.mosqueArea') || 'Area (m²)'} variant="warning">
                <Input
                  name="mosqueArea"
                  type="number"
                  step="0.1"
                  value={formData.mosqueArea}
                  onChange={handleChange}
                  placeholder="m²"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.mosqueCapacity') || 'Capacity'} variant="success">
                <Input
                  name="mosqueCapacity"
                  type="number"
                  value={formData.mosqueCapacity}
                  onChange={handleChange}
                  placeholder="people"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.mosqueMinarets') || 'Minarets'} variant="primary">
                <Input
                  name="mosqueMinarets"
                  type="number"
                  value={formData.mosqueMinarets}
                  onChange={handleChange}
                  placeholder="count"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.mosqueDomes') || 'Domes'} variant="info">
                <Input
                  name="mosqueDomes"
                  type="number"
                  value={formData.mosqueDomes}
                  onChange={handleChange}
                  placeholder="count"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.mosquePrayerHalls') || 'Prayer Halls'} variant="default">
                <Input
                  name="mosquePrayerHalls"
                  type="number"
                  value={formData.mosquePrayerHalls}
                  onChange={handleChange}
                  placeholder="count"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.mosqueAblutionFacilities') || 'Ablution'} variant="info">
                <Input
                  name="mosqueAblutionFacilities"
                  type="number"
                  value={formData.mosqueAblutionFacilities}
                  onChange={handleChange}
                  placeholder="count"
                  className="bg-white/80"
                />
              </SpecTile>

              <SpecTile label={t('projects.mosqueParkingSpaces') || 'Parking'} variant="success">
                <Input
                  name="mosqueParkingSpaces"
                  type="number"
                  value={formData.mosqueParkingSpaces}
                  onChange={handleChange}
                  placeholder="spaces"
                  className="bg-white/80"
                />
              </SpecTile>
            </div>
          </SectionCard>
        )}

        {/* Other Details */}
        {formData.projectType === PROJECT_TYPES.OTHER && (
          <SectionCard
            icon={ClipboardDocumentListIcon}
            title={t('projects.otherSpecifications') || 'Project Specifications'}
            subtitle={t('projects.otherSpecificationsDesc') || 'Custom project details in JSON format'}
            variant="purple"
          >
            <div className="p-4 bg-gradient-to-br from-purple-50/80 to-purple-100/50 rounded-xl border-2 border-purple-200">
              <Textarea
                label={t('projects.otherDetails') || 'Project Details (JSON format)'}
                name="otherDetails"
                value={formData.otherDetails}
                onChange={handleChange}
                rows={8}
                placeholder='{"field1": "value1", "field2": "value2"}'
                className="font-mono text-sm bg-white/80"
              />
              <p className="mt-3 flex items-start gap-2 text-xs text-secondary-500">
                <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{t('projects.otherDetailsNote') || 'Enter project details in JSON format. Example: {"size": "100m²", "rooms": 5}'}</span>
              </p>
            </div>
          </SectionCard>
        )}

        {/* Beneficiaries */}
        <SectionCard
          icon={UserGroupIcon}
          title={t('projects.beneficiaries')}
          subtitle={t('projects.beneficiariesDesc') || 'Estimated impact and population served'}
          variant="success"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField>
              <div className="group p-5 bg-gradient-to-br from-success-50 to-success-100/50 rounded-xl border-2 border-success-200 
                hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-400 to-success-600 
                    flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <label className="text-sm font-bold text-secondary-700">
                    {t('projects.estimatedFamilies') || 'Estimated Families'}
                  </label>
                </div>
                <Input
                  name="estimatedFamilies"
                  type="number"
                  value={formData.estimatedFamilies}
                  onChange={handleChange}
                  placeholder="Number of families"
                  className="bg-white/80"
                />
              </div>
            </FormField>

            <FormField>
              <div className="group p-5 bg-gradient-to-br from-info-50 to-info-100/50 rounded-xl border-2 border-info-200 
                hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info-400 to-info-600 
                    flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <label className="text-sm font-bold text-secondary-700">
                    {t('projects.estimatedPeople') || 'Estimated People'}
                  </label>
                </div>
                <Input
                  name="estimatedPeople"
                  type="number"
                  value={formData.estimatedPeople}
                  onChange={handleChange}
                  placeholder="Number of individuals"
                  className="bg-white/80"
                />
              </div>
            </FormField>
          </div>
        </SectionCard>

        {/* Client Information */}
        <SectionCard
          icon={UserIcon}
          title={t('projects.clientInformation')}
          subtitle={t('projects.clientInformationDesc') || 'Donor or client contact details'}
          variant="default"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField>
              <Input
                label={t('projects.clientName')}
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder={t('projects.clientNamePlaceholder') || 'Full name...'}
              />
            </FormField>

            <FormField>
              <Input
                label={t('projects.clientEmail')}
                name="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </FormField>

            <FormField>
              <Input
                label={t('projects.clientPhone')}
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Notes */}
        <SectionCard
          icon={TagIcon}
          title={t('projects.notes')}
          subtitle={t('projects.notesDesc') || 'Additional information and internal notes'}
          variant="default"
        >
          <FormField>
            <Textarea
              label={t('projects.additionalNotes')}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder={t('projects.notesPlaceholder') || 'Enter any additional notes, special requirements, or important information...'}
            />
          </FormField>
        </SectionCard>

        {/* ==================== STICKY ACTIONS BAR ==================== */}
        <div className="sticky bottom-0 z-20 -mx-4 px-4 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 bg-white/95 backdrop-blur-xl rounded-2xl 
              border-2 border-secondary-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/projects')}
                className="sm:w-auto w-full hover:shadow-md"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                size="lg"
                loading={loading}
                icon={isEditMode ? CheckCircleIcon : SparklesIcon}
                className="sm:w-auto w-full bg-gradient-to-r from-primary-500 to-primary-600 
                  shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 
                  hover:-translate-y-0.5 transition-all duration-300"
              >
                {isEditMode ? t('common.update') : t('common.create')} {t('projects.project')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;