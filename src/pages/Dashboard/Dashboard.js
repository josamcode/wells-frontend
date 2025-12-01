import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { analyticsAPI } from '../../api/analytics';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';
import {
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const stats = [
    {
      name: t('dashboard.totalProjects'),
      value: data?.projects?.total || 0,
      icon: FolderIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: t('dashboard.completedProjects'),
      value: data?.projects?.completed || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: t('dashboard.inProgressProjects'),
      value: data?.projects?.inProgress || 0,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: t('dashboard.delayedProjects'),
      value: data?.projects?.delayed || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: t('dashboard.pendingReports'),
      value: data?.reports?.pending || 0,
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: t('dashboard.activeContractors'),
      value: data?.activeContractors || 0,
      icon: UsersIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t('dashboard.title')}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of projects and activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;

          return (
            <Card key={index} padding={false} className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                    {IconComponent && <IconComponent className={`h-6 w-6 ${stat.color}`} />}
                  </div>
                  <div className="ltr:ml-5 rtl:mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Country */}
        <Card title={t('dashboard.projectsByCountry')}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={(data?.projectsByCountry || []).map(item => ({
                country: item._id || item.country || '',
                count: item.count || 0
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Completions */}
        <Card title={t('dashboard.monthlyCompletions')}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={(data?.monthlyCompletions || []).map(item => ({
                month: item._id?.month || item.month || '',
                count: item.count || 0
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card title={t('dashboard.recentProjects')}>
          <div className="space-y-3">
            {data?.recentProjects?.length > 0 ? (
              data.recentProjects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {project.projectName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {project.projectNumber} • {project.country}
                      </p>
                    </div>
                    <Badge status={project.status}>
                      {t(`projects.statuses.${project.status}`)}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent projects</p>
            )}
          </div>
        </Card>

        {/* Recent Reports */}
        <Card title={t('dashboard.recentReports')}>
          <div className="space-y-3">
            {data?.recentReports?.length > 0 ? (
              data.recentReports.map((report) => (
                <Link
                  key={report._id}
                  to={`/reports/${report._id}`}
                  className="block p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {report.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {report.project?.projectName} • {formatDate(report.submittedAt)}
                      </p>
                    </div>
                    <Badge status={report.status}>
                      {t(`reports.statuses.${report.status}`)}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent reports</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

