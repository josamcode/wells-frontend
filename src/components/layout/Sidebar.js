import React, { memo, useMemo, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { messagesAPI } from '../../api/messages';
import {
  HomeIcon,
  FolderIcon,
  DocumentTextIcon,
  UsersIcon,
  BellIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const Sidebar = memo(({ isOpen, closeSidebar, isCollapsed, toggleCollapse }) => {
  const { t } = useTranslation();
  const { user, hasRole } = useAuth();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await messagesAPI.getUnreadCount();
        setUnreadMessagesCount(response.data.data.count || 0);
      } catch (error) {
        // Silent fail
      }
    };
    fetchUnreadCount();
    // Removed automatic refresh interval
  }, []);

  const navigation = useMemo(() => [
    {
      name: t('nav.dashboard'),
      href: '/',
      icon: HomeIcon,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor', 'viewer'],
    },
    {
      name: t('projects.myProjects') || 'My Projects',
      href: '/my-projects',
      icon: FolderIcon,
      roles: ['client'],
    },
    {
      name: t('nav.projects'),
      href: '/projects',
      icon: FolderIcon,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor', 'viewer'],
    },
    {
      name: t('nav.reports'),
      href: '/reports',
      icon: DocumentTextIcon,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor'],
    },
    {
      name: t('nav.users'),
      href: '/users',
      icon: UsersIcon,
      roles: ['super_admin', 'admin'],
    },
    {
      name: t('nav.notifications'),
      href: '/notifications',
      icon: BellIcon,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor', 'viewer'],
    },
    {
      name: t('nav.messages'),
      href: '/messages',
      icon: EnvelopeIcon,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor'],
      badge: unreadMessagesCount,
    },
  ], [t, unreadMessagesCount]);

  const filteredNavigation = useMemo(() =>
    navigation.filter(item => hasRole(...item.roles)),
    [navigation, hasRole]
  );

  return (
    <>
      {/* Mobile overlay - Only for tablet, not phone */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-secondary-900/60 backdrop-blur-sm sm:hidden lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Hidden on mobile (phone), shown on tablet and desktop */}
      <aside
        className={`
          hidden sm:block
          fixed inset-y-0 ltr:left-0 rtl:right-0 z-50 
          ${isCollapsed ? 'w-20' : 'w-72'}
          bg-white/80 backdrop-blur-xl
          ltr:border-r rtl:border-l border-secondary-200/50
          shadow-soft
          transform transition-all duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className={`flex items-center h-16 px-4 border-b border-secondary-200/50 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src="/logo.png"
                  alt={t('app.name')}
                  className="h-12 w-12 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-secondary-900 tracking-tight truncate leading-tight">
                    {t('app.name')}
                  </h1>
                  {/* <p className="text-[10px] text-secondary-500 truncate">Management System</p> */}
                </div>
              </div>
            )}

            {/* Collapse Toggle - Desktop only */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-secondary-100 text-secondary-500 transition-colors flex-shrink-0"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-5 h-5 rtl:rotate-180" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5 rtl:rotate-180" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {!isCollapsed && (
              <p className="px-4 mb-4 text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                {t('nav.menu') || 'Menu'}
              </p>
            )}

            {filteredNavigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && closeSidebar()}
                  className={({ isActive }) =>
                    `nav-item group ${isCollapsed ? 'justify-center px-3' : ''} ${isActive ? 'nav-item-active' : ''
                    }`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`
                        relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200
                        ${isActive
                          ? 'bg-primary-500 text-white shadow-glow'
                          : 'bg-secondary-100 text-secondary-500 group-hover:bg-secondary-200 group-hover:text-secondary-700'
                        }
                      `}>
                        <IconComponent className="w-5 h-5" />
                        {item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-danger-500 rounded-full text-[10px] font-bold text-white border-2 border-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <span className="font-medium flex-1">{item.name}</span>
                      )}
                      {!isCollapsed && item.badge > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-danger-500 rounded-full text-[11px] font-bold text-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User info */}
          <div className={`p-4 border-t border-secondary-200/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
            {isCollapsed ? (
              <div className="avatar-md" title={user?.fullName}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-secondary-50 to-secondary-100/50">
                <div className="avatar-md flex-shrink-0">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-secondary-900 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-secondary-500 truncate">
                    {t(`users.roles.${user?.role}`)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
