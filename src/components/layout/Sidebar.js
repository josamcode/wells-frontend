import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  FolderIcon,
  DocumentTextIcon,
  UsersIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { t } = useTranslation();
  const { user, hasRole } = useAuth();

  const navigation = [
    {
      name: t('nav.dashboard'),
      href: '/',
      icon: HomeIcon,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor', 'viewer'],
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
    // {
    //   name: t('nav.settings'),
    //   href: '/settings',
    //   icon: Cog6ToothIcon,
    //   roles: ['super_admin', 'admin'],
    // },
  ];

  const filteredNavigation = navigation.filter(item =>
    hasRole(...item.roles)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar - Left for English, Right for Arabic */}
      <aside
        className={`fixed inset-y-0 ltr:left-0 rtl:right-0 z-50 w-64 bg-white ltr:border-r rtl:border-l border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Navigation - Vertical */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {filteredNavigation.map((item) => {
              const IconComponent = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && closeSidebar()}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {IconComponent && <IconComponent className="w-5 h-5 ltr:mr-3 rtl:ml-3" />}
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ltr:ml-3 rtl:mr-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {t(`users.roles.${user?.role}`)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

