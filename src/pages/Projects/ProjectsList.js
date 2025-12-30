import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { projectsAPI } from '../../api/projects';
import { usersAPI } from '../../api/users';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import CardView from '../../components/common/CardView';
import ViewToggle from '../../components/common/ViewToggle';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import SearchableSelect from '../../components/common/SearchableSelect';
import Modal from '../../components/common/Modal';
import { SearchInput } from '../../components/common/Input';
import { formatDate } from '../../utils/helpers';
import { PROJECT_TYPES, PROJECT_STATUS, COUNTRIES } from '../../utils/constants';
import { PlusIcon, FolderIcon, BuildingLibraryIcon, BuildingOfficeIcon, WrenchScrewdriverIcon, FunnelIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const ProjectsList = memo(() => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [contractors, setContractors] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [projectTypeModalOpen, setProjectTypeModalOpen] = useState(false);

  // Initialize filters from URL params
  // Only read projectType if we're on the projects list page (not /projects/new)
  const isProjectsListPage = location.pathname === '/projects';
  const initialProjectType = isProjectsListPage ? (searchParams.get('projectType') || '') : '';

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    projectType: initialProjectType,
    status: searchParams.get('status') || '',
    country: searchParams.get('country') || '',
    contractor: searchParams.get('contractor') || '',
    projectManager: searchParams.get('projectManager') || '',
  });

  // View state with persistence
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('projectsView');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'cards' : 'table';
  });

  // Update filters when location changes (e.g., navigating back from form)
  useEffect(() => {
    const isProjectsListPage = location.pathname === '/projects' && !location.pathname.startsWith('/projects/new');
    const urlProjectType = isProjectsListPage ? searchParams.get('projectType') : '';

    setFilters(prev => ({
      ...prev,
      projectType: urlProjectType || '',
    }));
  }, [location.pathname, searchParams]);

  // Initial load from URL params - fetch once on mount (only if on projects list page)
  // Also clean up page and limit from URL on mount
  useEffect(() => {
    if (location.pathname === '/projects') {
      // Remove page and limit from URL if they exist
      const currentParams = new URLSearchParams(searchParams);
      if (currentParams.has('page') || currentParams.has('limit')) {
        currentParams.delete('page');
        currentParams.delete('limit');
        setSearchParams(currentParams, { replace: true });
      }
      fetchProjects(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch users for filters
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (hasRole('super_admin', 'admin')) {
          const [contractorsRes, managersRes] = await Promise.all([
            usersAPI.getByRole('contractor'),
            usersAPI.getByRole('project_manager'),
          ]);
          setContractors(contractorsRes.data.data);
          setProjectManagers(managersRes.data.data);
        }
      } catch (error) {
        // Silent fail
      }
    };
    fetchUsers();
  }, [hasRole]);

  // Update URL params when filters change (but only if we're on projects list page)
  // Exclude page and limit from URL params - they're only used for API requests
  useEffect(() => {
    if (location.pathname !== '/projects') return; // Don't update URL if we're not on projects list

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      // Exclude page and limit from URL - they're only for API requests
      if (key !== 'page' && key !== 'limit' && value && value.trim()) {
        params.set(key, value);
      }
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams, location.pathname]);

  const fetchProjects = useCallback(async (page) => {
    // Only fetch if we're on the projects list page
    if (location.pathname !== '/projects') {
      return;
    }

    setLoading(true);
    try {
      // Build params object with filters only (page and limit excluded from URL)
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        // Only add non-empty filter values to params
        if (value !== null && value !== undefined && String(value).trim() !== '') {
          params[key] = String(value).trim();
        }
      });

      // Note: page and limit are excluded from URL - backend will use defaults (page=1, limit=10)
      // Exclude page and limit from the URL query string
      const response = await projectsAPI.getAll(params, { excludePageLimit: true });
      setProjects(response.data.data.projects);
      setPagination(response.data.data.pagination);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [filters, location.pathname]);

  // Fetch projects when filters change - debounce search, apply others immediately
  // Only fetch if we're on the projects list page
  useEffect(() => {
    if (location.pathname !== '/projects') return;

    const timeoutId = setTimeout(() => {
      fetchProjects(1);
    }, filters.search ? 400 : 0);
    return () => clearTimeout(timeoutId);
  }, [filters, fetchProjects, location.pathname]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      projectType: '',
      status: '',
      country: '',
      contractor: '',
      projectManager: '',
    });
  }, []);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => v && v.trim()).length;
  }, [filters]);

  // Get project type icon
  const getProjectTypeIcon = (projectType) => {
    switch (projectType) {
      case PROJECT_TYPES.WELL:
        return FolderIcon;
      case PROJECT_TYPES.MOSQUE:
        return BuildingLibraryIcon;
      case PROJECT_TYPES.EDUCATIONAL_CENTER:
        return BuildingOfficeIcon;
      case PROJECT_TYPES.OTHER:
        return WrenchScrewdriverIcon;
      default:
        return FolderIcon;
    }
  };

  // Get project type label
  const getProjectTypeLabel = (projectType) => {
    return t(`projects.types.${projectType}`) || projectType;
  };

  const columns = useMemo(() => [
    {
      header: t('projects.projectNumber'),
      accessor: 'projectNumber',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-secondary-900">
          {row.projectNumber}
        </span>
      )
    },
    {
      header: t('projects.projectName'),
      accessor: 'projectName',
      render: (row) => {
        const ProjectIcon = getProjectTypeIcon(row.projectType);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <ProjectIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-secondary-900 block">
                {language === 'ar' && row.projectNameAr ? row.projectNameAr : row.projectName}
              </span>
              {row.projectType && (
                <span className="text-xs text-secondary-500 mt-0.5 block">
                  {getProjectTypeLabel(row.projectType)}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: t('projects.projectType') || 'Type',
      accessor: 'projectType',
      render: (row) => (
        <Badge variant="secondary" size="sm">
          {getProjectTypeLabel(row.projectType || PROJECT_TYPES.WELL)}
        </Badge>
      )
    },
    {
      header: t('projects.country'),
      accessor: 'country',
      render: (row) => (
        <span className="text-secondary-600">{row.country}</span>
      )
    },
    {
      header: t('projects.status'),
      render: (row) => (
        <Badge status={row.status} dot>
          {t(`projects.statuses.${row.status}`)}
        </Badge>
      ),
    },
    {
      header: t('projects.progress'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden max-w-[100px]">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-secondary-700 w-10">
            {row.progress}%
          </span>
        </div>
      ),
    },
    {
      header: t('projects.contractor'),
      render: (row) => (
        <span className="text-secondary-600">
          {row.contractor?.fullName || t('common.n/a')}
        </span>
      ),
    },
    {
      header: t('common.date'),
      render: (row) => (
        <span className="text-secondary-500 text-sm">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ], [t, language]);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
    localStorage.setItem('projectsView', newView);
  }, []);

  const handleItemClick = useCallback((row) => {
    window.location.href = `/projects/${row._id}`;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('projects.title')}</h1>
          <p className="section-subtitle">
            {t('projects.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          {hasRole('super_admin', 'admin') && (
            <Button icon={PlusIcon} onClick={() => setProjectTypeModalOpen(true)}>
              {t('projects.newProject')}
            </Button>
          )}
        </div>
      </div>

      {/* Content Card */}
      <Card className="overflow-hidden px-0">
        {/* Search and Filters Bar */}
        <div className="p-4 border-b border-secondary-100 bg-gradient-to-r from-secondary-50/50 to-transparent">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <SearchInput
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onClear={() => handleFilterChange('search', '')}
                placeholder={t('projects.searchPlaceholder')}
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`
                  group relative px-4 py-2 rounded-xl font-medium text-sm
                  transition-all duration-300 flex items-center gap-2
                  ${filtersOpen || activeFiltersCount > 0
                    ? 'bg-primary-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-white text-secondary-700 border-2 border-secondary-200 hover:border-primary-300 hover:bg-primary-50'
                  }
                `}
              >
                <FunnelIcon className={`w-5 h-5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                <span>{t('common.filters') || 'Filters'}</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl font-medium text-sm text-secondary-600 hover:text-danger-600 bg-white border-2 border-secondary-200 hover:border-danger-300 transition-all flex items-center gap-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>{t('common.clearFilters') || 'Clear'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Professional Filters Panel */}
          {filtersOpen && (
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Project Type Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    {t('projects.projectType')}
                  </label>
                  <Select
                    name="projectType"
                    value={filters.projectType}
                    onChange={(e) => handleFilterChange('projectType', e.target.value)}
                    options={[
                      { value: '', label: t('common.all') || 'All' },
                      { value: PROJECT_TYPES.WELL, label: t('projects.types.well') },
                      { value: PROJECT_TYPES.MOSQUE, label: t('projects.types.mosque') },
                      { value: PROJECT_TYPES.EDUCATIONAL_CENTER, label: t('projects.types.educational_center') },
                      { value: PROJECT_TYPES.OTHER, label: t('projects.types.other') },
                    ]}
                    className="bg-white"
                  />
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    {t('projects.status')}
                  </label>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    options={[
                      { value: '', label: t('common.all') || 'All' },
                      { value: PROJECT_STATUS.PLANNED, label: t('projects.statuses.planned') },
                      { value: PROJECT_STATUS.IN_PROGRESS, label: t('projects.statuses.in_progress') },
                      { value: PROJECT_STATUS.COMPLETED, label: t('projects.statuses.completed') },
                      { value: PROJECT_STATUS.ON_HOLD, label: t('projects.statuses.on_hold') },
                      { value: PROJECT_STATUS.CANCELLED, label: t('projects.statuses.cancelled') },
                    ]}
                    className="bg-white"
                  />
                </div>

                {/* Country Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    {t('projects.country')}
                  </label>
                  <SearchableSelect
                    name="country"
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    options={[
                      { value: '', label: t('common.all') || 'All' },
                      ...COUNTRIES.map(country => ({ value: country, label: country })),
                    ]}
                    placeholder={t('projects.country') || 'Select country'}
                    className="bg-white"
                  />
                </div>

                {/* Contractor Filter */}
                {hasRole('super_admin', 'admin') && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      {t('projects.contractor')}
                    </label>
                    <Select
                      name="contractor"
                      value={filters.contractor}
                      onChange={(e) => handleFilterChange('contractor', e.target.value)}
                      options={[
                        { value: '', label: t('common.all') || 'All' },
                        ...contractors.map(c => ({ value: c._id, label: c.fullName })),
                      ]}
                      className="bg-white"
                    />
                  </div>
                )}

                {/* Project Manager Filter */}
                {hasRole('super_admin', 'admin') && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                      {t('projects.projectManager')}
                    </label>
                    <Select
                      name="projectManager"
                      value={filters.projectManager}
                      onChange={(e) => handleFilterChange('projectManager', e.target.value)}
                      options={[
                        { value: '', label: t('common.all') || 'All' },
                        ...projectManagers.map(m => ({ value: m._id, label: m.fullName })),
                      ]}
                      className="bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Data View */}
        <div className="p-3 px-0">
          {view === 'table' ? (
            <Table
              columns={columns}
              data={projects}
              loading={loading}
              onRowClick={handleItemClick}
              emptyMessage={t('projects.noProjects')}
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
        </div>

        {/* Pagination */}
        <div className="px-3 pb-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchProjects}
          />
        </div>
      </Card>

      {/* Project Type Selection Modal */}
      <Modal
        isOpen={projectTypeModalOpen}
        onClose={() => setProjectTypeModalOpen(false)}
        title={t('projects.selectProjectType') || 'Select Project Type'}
        subtitle={t('projects.selectProjectTypeDesc') || 'Choose the type of project you want to create'}
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {/* Well Project Type */}
          <button
            onClick={() => {
              navigate(`/projects/new?projectType=${PROJECT_TYPES.WELL}`);
              setProjectTypeModalOpen(false);
            }}
            className="group relative overflow-hidden rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 via-white to-primary-100/50 p-8 transition-all duration-300 ease-out shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.3)] hover:border-primary-400 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <img src="/w.webp" alt="Well" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {t('projects.types.well')}
                </h3>
                <p className="text-sm text-secondary-600">
                  {t('projects.wellDescription') || 'Create a new well project'}
                </p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Mosque Project Type */}
          <button
            onClick={() => {
              navigate(`/projects/new?projectType=${PROJECT_TYPES.MOSQUE}`);
              setProjectTypeModalOpen(false);
            }}
            className="group relative overflow-hidden rounded-2xl border-2 border-warning-200 bg-gradient-to-br from-warning-50 via-white to-warning-100/50 p-8 transition-all duration-300 ease-out shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(234,179,8,0.3)] hover:border-warning-400 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <img src="/m.webp" alt="Mosque" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {t('projects.types.mosque')}
                </h3>
                <p className="text-sm text-secondary-600">
                  {t('projects.mosqueDescription') || 'Create a new mosque project'}
                </p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-warning-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Educational Center Project Type */}
          <button
            onClick={() => {
              navigate(`/projects/new?projectType=${PROJECT_TYPES.EDUCATIONAL_CENTER}`);
              setProjectTypeModalOpen(false);
            }}
            className="group relative overflow-hidden rounded-2xl border-2 border-info-200 bg-gradient-to-br from-info-50 via-white to-info-100/50 p-8 transition-all duration-300 ease-out shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(6,182,212,0.3)] hover:border-info-400 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-info-500 to-info-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <img src="/e.jpg" alt="Educational Center" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {t('projects.types.educational_center')}
                </h3>
                <p className="text-sm text-secondary-600">
                  {t('projects.educationalCenterDescription') || 'Create a new educational center project'}
                </p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-info-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Other Project Type */}
          <button
            onClick={() => {
              navigate(`/projects/new?projectType=${PROJECT_TYPES.OTHER}`);
              setProjectTypeModalOpen(false);
            }}
            className="group relative overflow-hidden rounded-2xl border-2 border-secondary-200 bg-gradient-to-br from-secondary-50 via-white to-secondary-100/50 p-8 transition-all duration-300 ease-out shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(107,114,128,0.3)] hover:border-secondary-400 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <WrenchScrewdriverIcon className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {t('projects.types.other')}
                </h3>
                <p className="text-sm text-secondary-600">
                  {t('projects.otherDescription') || 'Create a new project with custom details'}
                </p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-secondary-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
});

ProjectsList.displayName = 'ProjectsList';

export default ProjectsList; 
