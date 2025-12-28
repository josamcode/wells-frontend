import React, { memo, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { notificationsAPI } from '../../api/notifications';
import { messagesAPI } from '../../api/messages';
import {
  HomeIcon,
  FolderIcon,
  DocumentTextIcon,
  BellIcon,
  Squares2X2Icon,
  EnvelopeIcon,
  UsersIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  BellIcon as BellIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
} from '@heroicons/react/24/solid';

const BottomNav = memo(() => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, hasRole, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [notificationsRes, messagesRes] = await Promise.all([
          notificationsAPI.getUnreadCount().catch(() => ({ data: { data: { count: 0 } } })),
          messagesAPI.getUnreadCount().catch(() => ({ data: { data: { count: 0 } } })),
        ]);
        setUnreadNotifications(notificationsRes.data.data.count || 0);
        setUnreadMessages(messagesRes.data.data.count || 0);
      } catch (e) {
        // Silent fail
      }
    };
    fetchCounts();
    // Removed automatic refresh interval
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreMenu]);

  const handleLogout = useCallback(() => {
    setShowMoreMenu(false);
    logout();
  }, [logout]);

  const navigation = useMemo(() => [
    {
      name: t('nav.dashboard'),
      href: '/',
      icon: HomeIcon,
      iconActive: HomeIconSolid,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor', 'viewer'],
    },
    {
      name: t('projects.myProjects') || 'My Projects',
      href: '/my-projects',
      icon: FolderIcon,
      iconActive: FolderIconSolid,
      roles: ['client'],
    },
    {
      name: t('nav.projects'),
      href: '/projects',
      icon: FolderIcon,
      iconActive: FolderIconSolid,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor', 'viewer'],
    },
    {
      name: t('nav.reports'),
      href: '/reports',
      icon: DocumentTextIcon,
      iconActive: DocumentTextIconSolid,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor'],
    },
    {
      name: t('nav.notifications'),
      href: '/notifications',
      icon: BellIcon,
      iconActive: BellIconSolid,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor', 'viewer'],
      badge: unreadNotifications,
    },
  ], [t, unreadNotifications]);

  // All navigation items for the "More" menu
  const allNavigation = useMemo(() => [
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
      badge: unreadNotifications,
    },
    {
      name: t('nav.messages'),
      href: '/messages',
      icon: EnvelopeIcon,
      roles: ['super_admin', 'admin', 'project_manager', 'contractor'],
      badge: unreadMessages,
    },
  ], [t, unreadNotifications, unreadMessages]);

  const filteredAllNavigation = useMemo(() =>
    allNavigation.filter(item => hasRole(...item.roles)),
    [allNavigation, hasRole]
  );

  const filteredNavigation = useMemo(() =>
    navigation.filter(item => hasRole(...item.roles)).slice(0, 4),
    [navigation, hasRole]
  );

  // Don't show on login and error pages
  if (location.pathname === '/login' || location.pathname === '/forgot-password' || location.pathname === '/reset-password') {
    return null;
  }

  return (
    <>
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-secondary-200 safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));
            const Icon = isActive ? item.iconActive : item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full relative"
              >
                <div className={`
                  relative flex items-center justify-center w-12 h-8 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-primary-100' : ''}
                `}>
                  <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-primary-600' : 'text-secondary-400'}`} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-danger-500 rounded-full text-[10px] font-bold text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-secondary-400'}`}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center flex-1 h-full relative"
          >
            <div className={`
              relative flex items-center justify-center w-12 h-8 rounded-xl transition-all duration-200
              ${showMoreMenu ? 'bg-primary-100' : ''}
            `}>
              <Squares2X2Icon className={`w-6 h-6 transition-colors ${showMoreMenu ? 'text-primary-600' : 'text-secondary-400'}`} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-danger-500 rounded-full text-[10px] font-bold text-white">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium transition-colors ${showMoreMenu ? 'text-primary-600' : 'text-secondary-400'}`}>
              {t('nav.more') || 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* More Menu Bottom Sheet */}
      {showMoreMenu && (
        <>
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 z-50 bg-secondary-900/60 backdrop-blur-md animate-fade-in"
            onClick={() => setShowMoreMenu(false)}
          />

          {/* Bottom Sheet */}
          <div
            ref={moreMenuRef}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-soft-xl border-t border-secondary-200 animate-slide-up max-h-[85vh] flex flex-col"
          >
            {/* Handle bar */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="w-12 h-1.5 bg-secondary-300 rounded-full mx-auto" />
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 text-secondary-500 hover:bg-secondary-100 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-secondary-50 to-secondary-100/50 rounded-2xl mb-4">
                <div className="avatar-lg text-lg flex-shrink-0">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-secondary-900 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-sm text-secondary-500 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-secondary-400 mt-0.5">
                    {t(`users.roles.${user?.role}`)}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1 mb-4">
                {filteredAllNavigation.map((item) => {
                  const isActive = location.pathname === item.href ||
                    (item.href !== '/' && location.pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setShowMoreMenu(false)}
                      className={`
                        flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors
                        ${isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-secondary-700 hover:bg-secondary-50'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                        ${isActive
                          ? 'bg-primary-500 text-white'
                          : 'bg-secondary-100 text-secondary-500'
                        }
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="flex-1 text-base font-medium">{item.name}</span>
                      {item.badge > 0 && (
                        <span className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-danger-500 rounded-full text-xs font-bold text-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-4 w-full px-4 py-3.5 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-colors mb-4"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-500 flex items-center justify-center">
                  <GlobeAltIcon className="w-5 h-5" />
                </div>
                <span className="flex-1 text-base font-medium text-left">
                  {t('settings.language')} ({language === 'en' ? 'AR' : 'EN'})
                </span>
              </button>

              {/* Profile & Logout */}
              <div className="space-y-1 pt-4 border-t border-secondary-100">
                <Link
                  to="/profile"
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-4 px-4 py-3.5 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-500 flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 text-base font-medium text-left">{t('nav.profile')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 w-full px-4 py-3.5 text-danger-600 hover:bg-danger-50 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 text-base font-medium text-left">{t('auth.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
