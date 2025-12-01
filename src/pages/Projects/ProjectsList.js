import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectsAPI } from '../../api/projects';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import CardView from '../../components/common/CardView';
import ViewToggle from '../../components/common/ViewToggle';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/helpers';
import { PlusIcon } from '@heroicons/react/24/outline';

const ProjectsList = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // View state: default to cards on mobile, table on desktop
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('projectsView');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'cards' : 'table';
  });

  useEffect(() => {
    fetchProjects(1);
  }, []);

  const fetchProjects = async (page) => {
    setLoading(true);
    try {
      const response = await projectsAPI.getAll({ page, limit: 10 });
      setProjects(response.data.data.projects);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: t('projects.projectNumber'), accessor: 'projectNumber' },
    {
      header: t('projects.projectName'),
      accessor: 'projectName',
      render: (row) => language === 'ar' && row.projectNameAr ? row.projectNameAr : row.projectName
    },
    { header: t('projects.country'), accessor: 'country' },
    {
      header: t('projects.status'),
      render: (row) => (
        <Badge status={row.status}>{t(`projects.statuses.${row.status}`)}</Badge>
      ),
    },
    {
      header: t('projects.progress'),
      render: (row) => `${row.progress}%`,
    },
    {
      header: t('projects.contractor'),
      render: (row) => row.contractor?.fullName || t('common.n/a'),
    },
    {
      header: t('common.date'),
      render: (row) => formatDate(row.createdAt),
    },
  ];

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem('projectsView', newView);
  };

  const handleItemClick = (row) => {
    window.location.href = `/projects/${row._id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('projects.title')}</h1>
        <div className="flex items-center gap-4">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <Link to="/projects/new">
            <Button>
              <PlusIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
              {t('projects.newProject')}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        {view === 'table' ? (
          <Table
            columns={columns}
            data={projects}
            loading={loading}
            onRowClick={handleItemClick}
          />
        ) : (
          <CardView
            data={projects}
            columns={columns}
            loading={loading}
            onItemClick={handleItemClick}
            emptyMessage={t('projects.noProjects')}
          />
        )}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={fetchProjects}
        />
      </Card>
    </div>
  );
};

export default ProjectsList;

