import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI } from '../../api/projects';
import { toast } from 'react-toastify';
import CardView from '../../components/common/CardView';

const MyProjects = memo(() => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchProjects = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await projectsAPI.getAll({ page, limit: 12 });
      setProjects(response.data.data.projects || []);
      setPagination(response.data.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (error) {
      toast.error(t('projects.failedToFetchProjects'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleItemClick = useCallback((project) => {
    window.location.href = `/my-projects/${project._id}`;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">{t('projects.myProjects') || 'My Projects'}</h1>
        <p className="text-secondary-500 mt-1">
          {t('projects.myProjectsSubtitle') || 'View all projects assigned to you'}
        </p>
      </div>

      <CardView
        data={projects}
        loading={loading}
        onItemClick={handleItemClick}
        emptyMessage={t('projects.noProjects')}
        type="project"
      />
    </div>
  );
});

MyProjects.displayName = 'MyProjects';

export default MyProjects;
