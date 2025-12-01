import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reportsAPI } from '../../api/reports';
import { projectsAPI } from '../../api/projects';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { REPORT_TYPES } from '../../utils/constants';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ReportForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  const preselectedProject = searchParams.get('project');

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    project: preselectedProject || '',
    reportType: 'daily',
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    workDate: new Date().toISOString().split('T')[0],
    workCompleted: '',
    workCompletedAr: '',
    challenges: '',
    challengesAr: '',
    nextSteps: '',
    nextStepsAr: '',
    progressPercentage: '',
    laborersCount: '',
    weatherCondition: '',
    weatherTemperature: '',
  });

  useEffect(() => {
    fetchProjects();
    if (isEditMode) {
      fetchReport();
    }
  }, [id]);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getList();
      setProjects(response.data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await reportsAPI.getById(id);
      const report = response.data.data;
      setFormData({
        project: report.project._id,
        reportType: report.reportType,
        title: report.title || '',
        titleAr: report.titleAr || '',
        description: report.description || '',
        descriptionAr: report.descriptionAr || '',
        workDate: report.workDate ? report.workDate.split('T')[0] : '',
        workCompleted: report.workCompleted || '',
        workCompletedAr: report.workCompletedAr || '',
        challenges: report.challenges || '',
        challengesAr: report.challengesAr || '',
        nextSteps: report.nextSteps || '',
        nextStepsAr: report.nextStepsAr || '',
        progressPercentage: report.progressPercentage || '',
        laborersCount: report.laborers?.count || '',
        weatherCondition: report.weather?.condition || '',
        weatherTemperature: report.weather?.temperature || '',
      });
    } catch (error) {
      toast.error('Failed to fetch report');
      navigate('/reports');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      project: formData.project,
      reportType: formData.reportType,
      title: formData.title,
      titleAr: formData.titleAr || undefined,
      description: formData.description || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      workDate: formData.workDate,
      workCompleted: formData.workCompleted || undefined,
      workCompletedAr: formData.workCompletedAr || undefined,
      challenges: formData.challenges || undefined,
      challengesAr: formData.challengesAr || undefined,
      nextSteps: formData.nextSteps || undefined,
      nextStepsAr: formData.nextStepsAr || undefined,
      progressPercentage: formData.progressPercentage ? parseInt(formData.progressPercentage) : undefined,
      laborers: formData.laborersCount ? { count: parseInt(formData.laborersCount) } : undefined,
      weather: {
        condition: formData.weatherCondition || undefined,
        temperature: formData.weatherTemperature ? parseFloat(formData.weatherTemperature) : undefined,
      },
    };

    try {
      let reportId = id;

      if (isEditMode) {
        await reportsAPI.update(id, payload);
        toast.success('Report updated successfully');
      } else {
        const response = await reportsAPI.create(payload);
        reportId = response.data.data._id;
        toast.success('Report created successfully');
      }

      // Upload files if any
      if (files.length > 0 && reportId) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });

        try {
          await reportsAPI.uploadAttachments(reportId, formData);
          toast.success('Files uploaded successfully');
        } catch (error) {
          toast.warning('Report saved but file upload failed');
        }
      }

      navigate(`/reports/${reportId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = Object.keys(REPORT_TYPES).map((key) => ({
    value: REPORT_TYPES[key],
    label: t(`reports.types.${REPORT_TYPES[key]}`),
  }));

  const projectOptions = projects.map((project) => ({
    value: project._id,
    label: `${project.projectNumber} - ${project.projectName}`,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEditMode ? t('common.edit') : t('common.create')} {t('reports.title')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('projects.projectName')}
              name="project"
              value={formData.project}
              onChange={handleChange}
              options={projectOptions}
              required
              className="md:col-span-2"
            />
            <Select
              label={t('reports.reportType')}
              name="reportType"
              value={formData.reportType}
              onChange={handleChange}
              options={typeOptions}
              required
            />
            <Input
              label={t('reports.workDate')}
              name="workDate"
              type="date"
              value={formData.workDate}
              onChange={handleChange}
              required
            />
            <Input
              label={t('reports.reportTitle') + ' (English)'}
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="md:col-span-2"
            />
            <Input
              label={t('reports.reportTitle') + ' (Arabic)'}
              name="titleAr"
              value={formData.titleAr}
              onChange={handleChange}
              className="md:col-span-2"
            />
          </div>
        </Card>

        {/* Work Details */}
        <Card title="Work Details">
          <div className="space-y-4">
            <Textarea
              label="Description (English)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
            <Textarea
              label="Description (Arabic)"
              name="descriptionAr"
              value={formData.descriptionAr}
              onChange={handleChange}
              rows={3}
            />
            <Textarea
              label="Work Completed (English)"
              name="workCompleted"
              value={formData.workCompleted}
              onChange={handleChange}
              rows={4}
            />
            <Textarea
              label="Work Completed (Arabic)"
              name="workCompletedAr"
              value={formData.workCompletedAr}
              onChange={handleChange}
              rows={4}
            />
            <Textarea
              label="Challenges (English)"
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              rows={3}
            />
            <Textarea
              label="Challenges (Arabic)"
              name="challengesAr"
              value={formData.challengesAr}
              onChange={handleChange}
              rows={3}
            />
            <Textarea
              label="Next Steps (English)"
              name="nextSteps"
              value={formData.nextSteps}
              onChange={handleChange}
              rows={3}
            />
            <Textarea
              label="Next Steps (Arabic)"
              name="nextStepsAr"
              value={formData.nextStepsAr}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </Card>

        {/* Additional Details */}
        <Card title="Additional Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Progress (%)"
              name="progressPercentage"
              type="number"
              min="0"
              max="100"
              value={formData.progressPercentage}
              onChange={handleChange}
            />
            <Input
              label="Number of Laborers"
              name="laborersCount"
              type="number"
              min="0"
              value={formData.laborersCount}
              onChange={handleChange}
            />
            <Input
              label="Weather Condition"
              name="weatherCondition"
              value={formData.weatherCondition}
              onChange={handleChange}
              placeholder="e.g., Sunny, Cloudy, Rainy"
            />
            <Input
              label="Temperature (°C)"
              name="weatherTemperature"
              type="number"
              step="0.1"
              value={formData.weatherTemperature}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* File Attachments */}
        <Card title={t('reports.attachments')}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reports.uploadFiles')}
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ArrowUpTrayIcon className="w-10 h-10 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Images, PDFs, Videos (Max 50MB each)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf,video/*,.xlsx,.xls"
                  />
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ltr:ml-3 rtl:mr-3 text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/reports')}
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

export default ReportForm;
