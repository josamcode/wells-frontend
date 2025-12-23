import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsAPI } from '../../api/projects';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import SearchableSelect from '../../components/common/SearchableSelect';
import Textarea from '../../components/common/Textarea';
import { COUNTRIES, PROJECT_STATUS, PROJECT_TYPES } from '../../utils/constants';

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
    // Well details
    wellDepth: '',
    wellDiameter: '',
    wellCapacity: '',
    wellWaterQuality: '',
    wellPumpType: '',
    // Mosque details
    mosqueArea: '',
    mosqueCapacity: '',
    mosqueMinarets: '',
    mosqueDomes: '',
    mosquePrayerHalls: '',
    mosqueAblutionFacilities: '',
    mosqueParkingSpaces: '',
    // Other details (stored as JSON string, parsed when needed)
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
        // Well details
        wellDepth: project.wellDetails?.depth || '',
        wellDiameter: project.wellDetails?.diameter || '',
        wellCapacity: project.wellDetails?.capacity || '',
        wellWaterQuality: project.wellDetails?.waterQuality || '',
        wellPumpType: project.wellDetails?.pumpType || '',
        // Mosque details
        mosqueArea: project.mosqueDetails?.area || '',
        mosqueCapacity: project.mosqueDetails?.capacity || '',
        mosqueMinarets: project.mosqueDetails?.minarets || '',
        mosqueDomes: project.mosqueDetails?.domes || '',
        mosquePrayerHalls: project.mosqueDetails?.prayerHalls || '',
        mosqueAblutionFacilities: project.mosqueDetails?.ablutionFacilities || '',
        mosqueParkingSpaces: project.mosqueDetails?.parkingSpaces || '',
        // Other details
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

    // If project type changes, reset type-specific fields
    if (name === 'projectType') {
      setFormData({
        ...formData,
        projectType: value,
        // Reset well details
        wellDepth: '',
        wellDiameter: '',
        wellCapacity: '',
        wellWaterQuality: '',
        wellPumpType: '',
        // Reset mosque details
        mosqueArea: '',
        mosqueCapacity: '',
        mosqueMinarets: '',
        mosqueDomes: '',
        mosquePrayerHalls: '',
        mosqueAblutionFacilities: '',
        mosqueParkingSpaces: '',
        // Reset other details
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

    // Add type-specific details based on project type
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
      // Parse JSON string to object for other details
      try {
        payload.otherDetails = formData.otherDetails ? JSON.parse(formData.otherDetails) : undefined;
      } catch (e) {
        // If invalid JSON, store as plain object with the text
        payload.otherDetails = formData.otherDetails ? { notes: formData.otherDetails } : undefined;
      }
    }

    // Only include projectNumber if provided (admins/owners can set it manually)
    if (formData.projectNumber) {
      payload.projectNumber = formData.projectNumber;
    }

    // Ensure projectType is always set and valid
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
      // Extract detailed error messages
      const errorData = error.response?.data;
      let errorMessage = errorData?.message || t('projects.failedToSaveProject');

      // If there are specific validation errors, show the first one
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEditMode ? t('common.edit') : t('common.create')} {t('projects.title')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card title={t('projects.basicInformation')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Number - Only visible to admins or project owners */}
            {(() => {
              const isAdmin = hasRole('super_admin', 'admin');
              const isOwner = !isEditMode || (user && projectCreatedBy &&
                (projectCreatedBy._id === user._id || projectCreatedBy === user._id));
              return isAdmin || isOwner;
            })() && (
                <div className="md:col-span-2">
                  <Input
                    label={t('projects.projectNumber')}
                    name="projectNumber"
                    value={formData.projectNumber}
                    onChange={handleChange}
                    placeholder="Leave empty for auto-generation"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t('projects.autoGenerateNote')}
                  </p>
                </div>
              )}
            <Select
              label={t('projects.projectType') || 'Project Type'}
              name="projectType"
              value={formData.projectType || PROJECT_TYPES.WELL}
              onChange={handleChange}
              options={projectTypeOptions}
              required
            />
            <Input
              label={t('projects.projectName')}
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              required
            />
            <Textarea
              label={t('projects.notes')}
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="md:col-span-2"
            />
          </div>
        </Card>

        {/* Location */}
        <Card title={t('projects.location')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              label={t('projects.country')}
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={countryOptions}
              placeholder={t('common.selectOption') || 'Select country...'}
              required
            />
            <Input
              label={t('projects.region')}
              name="region"
              value={formData.region}
              onChange={handleChange}
            />
            <Input
              label={t('projects.city')}
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              label={t('projects.address')}
              name="locationAddress"
              value={formData.locationAddress}
              onChange={handleChange}
            />
            <Input
              label={t('projects.latitude')}
              name="locationLatitude"
              type="number"
              step="any"
              value={formData.locationLatitude}
              onChange={handleChange}
            />
            <Input
              label={t('projects.longitude')}
              name="locationLongitude"
              type="number"
              step="any"
              value={formData.locationLongitude}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Project Management */}
        <Card title={t('projects.projectManagement')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('projects.status')}
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
              required
            />
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={priorityOptions}
            />
            <Select
              label={t('projects.contractor')}
              name="contractor"
              value={formData.contractor}
              onChange={handleChange}
              options={contractorOptions}
            />
            <Select
              label={t('projects.projectManager')}
              name="projectManager"
              value={formData.projectManager}
              onChange={handleChange}
              options={managerOptions}
            />
            <Input
              label={t('projects.progress') + ' (%)'}
              name="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Budget & Timeline */}
        <Card title={t('projects.budgetTimeline')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <Input
                label={t('projects.budget')}
                name="budgetAmount"
                type="number"
                step="0.01"
                value={formData.budgetAmount}
                onChange={handleChange}
                className="flex-1"
              />
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
                className="w-24"
              />
            </div>
            <div></div>
            <Input
              label={t('projects.startDate')}
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />
            <Input
              label={t('projects.expectedEndDate')}
              name="expectedEndDate"
              type="date"
              value={formData.expectedEndDate}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Well Details - Only show for well projects */}
        {formData.projectType === PROJECT_TYPES.WELL && (
          <Card title={t('projects.wellSpecifications')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('projects.depth')}
                name="wellDepth"
                type="number"
                step="0.1"
                value={formData.wellDepth}
                onChange={handleChange}
              />
              <Input
                label={t('projects.diameter')}
                name="wellDiameter"
                type="number"
                step="0.1"
                value={formData.wellDiameter}
                onChange={handleChange}
              />
              <Input
                label={t('projects.capacity')}
                name="wellCapacity"
                type="number"
                value={formData.wellCapacity}
                onChange={handleChange}
              />
              <Input
                label={t('projects.waterQuality')}
                name="wellWaterQuality"
                value={formData.wellWaterQuality}
                onChange={handleChange}
              />
              <Input
                label={t('projects.pumpType')}
                name="wellPumpType"
                value={formData.wellPumpType}
                onChange={handleChange}
              />
            </div>
          </Card>
        )}

        {/* Mosque Details - Only show for mosque projects */}
        {formData.projectType === PROJECT_TYPES.MOSQUE && (
          <Card title={t('projects.mosqueSpecifications') || 'Mosque Specifications'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('projects.mosqueArea') || 'Area (m²)'}
                name="mosqueArea"
                type="number"
                step="0.1"
                value={formData.mosqueArea}
                onChange={handleChange}
              />
              <Input
                label={t('projects.mosqueCapacity') || 'Capacity (Worshippers)'}
                name="mosqueCapacity"
                type="number"
                value={formData.mosqueCapacity}
                onChange={handleChange}
              />
              <Input
                label={t('projects.mosqueMinarets') || 'Number of Minarets'}
                name="mosqueMinarets"
                type="number"
                value={formData.mosqueMinarets}
                onChange={handleChange}
              />
              <Input
                label={t('projects.mosqueDomes') || 'Number of Domes'}
                name="mosqueDomes"
                type="number"
                value={formData.mosqueDomes}
                onChange={handleChange}
              />
              <Input
                label={t('projects.mosquePrayerHalls') || 'Prayer Halls'}
                name="mosquePrayerHalls"
                type="number"
                value={formData.mosquePrayerHalls}
                onChange={handleChange}
              />
              <Input
                label={t('projects.mosqueAblutionFacilities') || 'Ablution Facilities'}
                name="mosqueAblutionFacilities"
                type="number"
                value={formData.mosqueAblutionFacilities}
                onChange={handleChange}
              />
              <Input
                label={t('projects.mosqueParkingSpaces') || 'Parking Spaces'}
                name="mosqueParkingSpaces"
                type="number"
                value={formData.mosqueParkingSpaces}
                onChange={handleChange}
              />
            </div>
          </Card>
        )}

        {/* Other Details - Only show for other project types */}
        {formData.projectType === PROJECT_TYPES.OTHER && (
          <Card title={t('projects.otherSpecifications') || 'Project Specifications'}>
            <Textarea
              label={t('projects.otherDetails') || 'Project Details (JSON format)'}
              name="otherDetails"
              value={formData.otherDetails}
              onChange={handleChange}
              rows={8}
              placeholder='{"field1": "value1", "field2": "value2"}'
            />
            <p className="mt-2 text-xs text-gray-500">
              {t('projects.otherDetailsNote') || 'Enter project details in JSON format. Example: {"size": "100m²", "rooms": 5}'}
            </p>
          </Card>
        )}

        {/* Beneficiaries */}
        <Card title={t('projects.beneficiaries')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Estimated Families"
              name="estimatedFamilies"
              type="number"
              value={formData.estimatedFamilies}
              onChange={handleChange}
            />
            <Input
              label="Estimated People"
              name="estimatedPeople"
              type="number"
              value={formData.estimatedPeople}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* client Information */}
        <Card title={t('projects.clientInformation')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('projects.clientName')}
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
            />
            <Input
              label={t('projects.clientEmail')}
              name="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={handleChange}
            />
            <Input
              label={t('projects.clientPhone')}
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Notes */}
        <Card title={t('projects.notes')}>
          <Textarea
            label={t('projects.additionalNotes')}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
          />
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/projects')}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={loading}>
            {isEditMode ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
