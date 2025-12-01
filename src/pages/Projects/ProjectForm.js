import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsAPI } from '../../api/projects';
import { usersAPI } from '../../api/users';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { COUNTRIES, PROJECT_STATUS } from '../../utils/constants';

const ProjectForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [formData, setFormData] = useState({
    projectName: '',
    projectNameAr: '',
    description: '',
    descriptionAr: '',
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
    estimatedFamilies: '',
    estimatedPeople: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
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
      setFormData({
        projectName: project.projectName || '',
        projectNameAr: project.projectNameAr || '',
        description: project.description || '',
        descriptionAr: project.descriptionAr || '',
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
        estimatedFamilies: project.beneficiaries?.estimatedFamilies || '',
        estimatedPeople: project.beneficiaries?.estimatedPeople || '',
        donorName: project.donor?.name || '',
        donorEmail: project.donor?.email || '',
        donorPhone: project.donor?.phone || '',
        priority: project.priority || 'medium',
        notes: project.notes || '',
      });
    } catch (error) {
      toast.error('Failed to fetch project');
      navigate('/projects');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      projectName: formData.projectName,
      projectNameAr: formData.projectNameAr,
      description: formData.description,
      descriptionAr: formData.descriptionAr,
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
      wellDetails: {
        depth: parseFloat(formData.wellDepth) || undefined,
        diameter: parseFloat(formData.wellDiameter) || undefined,
        capacity: parseFloat(formData.wellCapacity) || undefined,
        waterQuality: formData.wellWaterQuality || undefined,
        pumpType: formData.wellPumpType || undefined,
      },
      beneficiaries: {
        estimatedFamilies: parseInt(formData.estimatedFamilies) || undefined,
        estimatedPeople: parseInt(formData.estimatedPeople) || undefined,
      },
      donor: {
        name: formData.donorName || undefined,
        email: formData.donorEmail || undefined,
        phone: formData.donorPhone || undefined,
      },
      priority: formData.priority,
      notes: formData.notes,
    };

    try {
      if (isEditMode) {
        await projectsAPI.update(id, payload);
        toast.success('Project updated successfully');
      } else {
        await projectsAPI.create(payload);
        toast.success('Project created successfully');
      }
      navigate('/projects');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
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

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
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
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('projects.projectName') + ' (English)'}
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              required
            />
            <Input
              label={t('projects.projectName') + ' (Arabic)'}
              name="projectNameAr"
              value={formData.projectNameAr}
              onChange={handleChange}
            />
            <Textarea
              label={t('projects.description') + ' (English)'}
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="md:col-span-2"
            />
            <Textarea
              label={t('projects.description') + ' (Arabic)'}
              name="descriptionAr"
              value={formData.descriptionAr}
              onChange={handleChange}
              rows={3}
              className="md:col-span-2"
            />
          </div>
        </Card>

        {/* Location */}
        <Card title="Location">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('projects.country')}
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={countryOptions}
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
              label="Address"
              name="locationAddress"
              value={formData.locationAddress}
              onChange={handleChange}
            />
            <Input
              label="Latitude"
              name="locationLatitude"
              type="number"
              step="any"
              value={formData.locationLatitude}
              onChange={handleChange}
            />
            <Input
              label="Longitude"
              name="locationLongitude"
              type="number"
              step="any"
              value={formData.locationLongitude}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Project Management */}
        <Card title="Project Management">
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
        <Card title="Budget & Timeline">
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
                label="Currency"
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

        {/* Well Details */}
        <Card title="Well Specifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Depth (meters)"
              name="wellDepth"
              type="number"
              step="0.1"
              value={formData.wellDepth}
              onChange={handleChange}
            />
            <Input
              label="Diameter (cm)"
              name="wellDiameter"
              type="number"
              step="0.1"
              value={formData.wellDiameter}
              onChange={handleChange}
            />
            <Input
              label="Capacity (L/h)"
              name="wellCapacity"
              type="number"
              value={formData.wellCapacity}
              onChange={handleChange}
            />
            <Input
              label="Water Quality"
              name="wellWaterQuality"
              value={formData.wellWaterQuality}
              onChange={handleChange}
            />
            <Input
              label="Pump Type"
              name="wellPumpType"
              value={formData.wellPumpType}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Beneficiaries */}
        <Card title="Beneficiaries">
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

        {/* Donor Information */}
        <Card title="Donor Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Donor Name"
              name="donorName"
              value={formData.donorName}
              onChange={handleChange}
            />
            <Input
              label="Donor Email"
              name="donorEmail"
              type="email"
              value={formData.donorEmail}
              onChange={handleChange}
            />
            <Input
              label="Donor Phone"
              name="donorPhone"
              value={formData.donorPhone}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Notes */}
        <Card title="Notes">
          <Textarea
            label="Additional Notes"
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
