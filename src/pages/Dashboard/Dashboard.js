import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsAPI } from '../../api/analytics';
import Card from '../../components/common/Card';
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
    const dataKey = payload[0].dataKey;
    const value = payload[0].value;
    let labelText = label;

    return (
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-soft-lg border border-secondary-100">
        <p className="text-sm font-semibold text-secondary-900">{labelText}</p>
        <p className="text-sm text-primary-600 mt-1">
          {value} {dataKey === 'count' ? 'projects' : dataKey === 'completed' ? 'completed' : ''}
        </p>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

// StatCard component with 3D design from ProjectDetail
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

  const chartData = useMemo(() => {
    // Format monthly completions with proper month names
    const formatMonthlyCompletions = (items) => {
      if (!items || items.length === 0) return [];

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      return items.map(item => {
        const year = item._id?.year || new Date().getFullYear();
        const month = item._id?.month || 1;
        const monthName = monthNames[month - 1] || 'Unknown';
        return {
          month: `${monthName} ${year}`,
          monthShort: monthName,
          year: year,
          monthNum: month,
          count: item.count || 0
        };
      }).sort((a, b) => {
        // Sort by year first, then by month
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNum - b.monthNum;
      });
    };

    return {
      byCountry: (data?.projectsByCountry || []).map(item => ({
        country: item._id || item.country || 'Unknown',
        count: item.count || 0,
        completed: item.completed || 0
      })),
      monthlyCompletions: formatMonthlyCompletions(data?.monthlyCompletions || [])
    };
  }, [data]);

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
            variant={stat.color}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Country */}
        <Card title={t('dashboard.projectsByCountry')} className="overflow-hidden">
          <div className="h-80">
            {chartData.byCountry && chartData.byCountry.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FolderIcon className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500 text-sm">{t('common.noData')}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Monthly Completions */}
        <Card title={t('dashboard.monthlyCompletions')} className="overflow-hidden">
          <div className="h-80">
            {chartData.monthlyCompletions && chartData.monthlyCompletions.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <CheckCircleIcon className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500 text-sm">{t('common.noData')}</p>
                </div>
              </div>
            )}
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
