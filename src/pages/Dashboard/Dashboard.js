import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsAPI } from '../../api/analytics';
import Card, { StatCard } from '../../components/common/Card';
import { StatsGridSkeleton, CardSkeleton } from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';
import {
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

// Custom Tooltip Component
const CustomTooltip = memo(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-soft-lg border border-secondary-100">
        <p className="text-sm font-semibold text-secondary-900">{label}</p>
        <p className="text-sm text-primary-600 mt-1">
          {payload[0].value} {payload[0].dataKey === 'count' ? 'projects' : ''}
        </p>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

const Dashboard = memo(() => {
  const { t } = useTranslation();
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setData(response.data.data);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = useMemo(() => {
    const baseStats = [
      {
        name: t('dashboard.totalProjects'),
        value: data?.projects?.total || 0,
        icon: FolderIcon,
        color: 'primary',
      },
      {
        name: t('dashboard.completedProjects'),
        value: data?.projects?.completed || 0,
        icon: CheckCircleIcon,
        color: 'success',
      },
      {
        name: t('dashboard.inProgressProjects'),
        value: data?.projects?.inProgress || 0,
        icon: ClockIcon,
        color: 'warning',
      },
      {
        name: t('dashboard.delayedProjects'),
        value: data?.projects?.delayed || 0,
        icon: ExclamationTriangleIcon,
        color: 'danger',
      },
    ];

    // Add active contractors stat only for super admin, admin, and project managers
    if (hasRole('super_admin', 'admin', 'project_manager') && data?.activeContractors !== undefined) {
      baseStats.push({
        name: t('dashboard.activeContractors'),
        value: data?.activeContractors || 0,
        icon: UserIcon,
        color: 'primary',
      });
    }

    // Add pending reports stat for roles that can review reports
    if (hasRole('super_admin', 'admin', 'project_manager') && data?.reports?.pending !== undefined) {
      baseStats.push({
        name: t('dashboard.pendingReports'),
        value: data?.reports?.pending || 0,
        icon: ClockIcon,
        color: 'warning',
      });
    }

    return baseStats;
  }, [data, t, hasRole]);

  const chartData = useMemo(() => ({
    byCountry: (data?.projectsByCountry || []).map(item => ({
      country: item._id || item.country || 'Unknown',
      count: item.count || 0
    })),
    monthlyCompletions: (data?.monthlyCompletions || []).map(item => ({
      month: item._id?.month || item.month || '',
      count: item.count || 0
    }))
  }), [data]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <div className="h-8 w-48 skeleton rounded-lg mb-2" />
          <div className="h-4 w-64 skeleton rounded-lg" />
        </div>
        <StatsGridSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton lines={6} />
          <CardSkeleton lines={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('dashboard.title')}</h1>
          <p className="section-subtitle">
            {hasRole('super_admin') || hasRole('admin')
              ? t('dashboard.subtitle')
              : hasRole('project_manager')
                ? t('dashboard.subtitleMyProjects') || 'Overview of your assigned projects and activities'
                : hasRole('contractor')
                  ? t('dashboard.subtitleMyProjects') || 'Overview of your assigned projects and activities'
                  : t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.projects?.completionRate > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-success-50 text-success-700 rounded-xl text-sm font-medium">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <span>{t('dashboard.increaseThisMonth')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${stats.length > 4 ? 'lg:grid-cols-3 xl:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            label={stat.name}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Country */}
        <Card title={t('dashboard.projectsByCountry')} className="overflow-hidden">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.byCountry} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="country"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#colorBar)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Completions */}
        <Card title={t('dashboard.monthlyCompletions')} className="overflow-hidden">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.monthlyCompletions} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card
          title={t('dashboard.recentProjects')}
          actions={
            <Link
              to="/projects"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
            >
              {t('dashboard.viewAll')}
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          }
        >
          <div className="space-y-3">
            {data?.recentProjects?.length > 0 ? (
              data.recentProjects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block p-4 hover:bg-secondary-50 rounded-xl border border-secondary-100 transition-all duration-200 hover:border-primary-200 hover:shadow-soft group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                          <FolderIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary-900 truncate">
                            {project.projectName}
                          </p>
                          <p className="text-xs text-secondary-500 mt-0.5">
                            {project.projectNumber} • {project.country}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge status={project.status} size="sm">
                      {t(`projects.statuses.${project.status}`)}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state py-8">
                <FolderIcon className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500 text-sm">{t('dashboard.noRecentProjects')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Reports */}
        <Card
          title={t('dashboard.recentReports')}
          actions={
            <Link
              to="/reports"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
            >
              {t('dashboard.viewAll')}
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          }
        >
          <div className="space-y-3">
            {data?.recentReports?.length > 0 ? (
              data.recentReports.map((report) => (
                <Link
                  key={report._id}
                  to={`/reports/${report._id}`}
                  className="block p-4 hover:bg-secondary-50 rounded-xl border border-secondary-100 transition-all duration-200 hover:border-primary-200 hover:shadow-soft group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center group-hover:bg-success-100 transition-colors">
                          <CheckCircleIcon className="w-5 h-5 text-success-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary-900 truncate">
                            {report.title}
                          </p>
                          <p className="text-xs text-secondary-500 mt-0.5">
                            {report.project?.projectName} • {formatDate(report.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge status={report.status} size="sm">
                      {t(`reports.statuses.${report.status}`)}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state py-8">
                <CheckCircleIcon className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-secondary-500 text-sm">{t('dashboard.noRecentReports')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
