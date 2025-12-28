import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { notificationsAPI } from '../../api/notifications';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const Header = memo(({ toggleSidebar }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    // Removed automatic refresh interval
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      // Silent fail
    }
  }, []);

  const handleLogout = useCallback(() => {
    setShowProfileMenu(false);
    logout();
  }, [logout]);

  return (
    <>
      {/* Hide header on mobile, show on desktop */}
      <header className="hidden sm:block sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-secondary-200/50 shadow-soft">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button - Only show on tablet, not phone */}
            <button
              onClick={toggleSidebar}
              className="sm:hidden lg:hidden p-2.5 text-secondary-500 rounded-xl hover:bg-secondary-100 hover:text-secondary-700 transition-all"
              aria-label="Toggle navigation"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2.5 text-secondary-600 rounded-xl hover:bg-secondary-100 transition-all group"
              title={t('settings.language')}
            >
              <GlobeAltIcon className="w-5 h-5 group-hover:text-primary-600 transition-colors" />
              <span className="hidden sm:inline text-sm font-medium">
                {language === 'en' ? 'AR' : 'EN'}
              </span>
            </button>

            {/* Notifications - Hidden on mobile, shown in bottom nav */}
            <Link
              to="/notifications"
              className="hidden sm:flex relative p-2.5 text-secondary-500 rounded-xl hover:bg-secondary-100 hover:text-secondary-700 transition-all"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-danger-500 to-danger-600 rounded-full text-[11px] font-bold text-white shadow-glow-danger animate-pulse-soft">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-secondary-100 transition-all"
              >
                <div className="avatar-md text-sm">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-secondary-900 truncate max-w-[120px]">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {t(`users.roles.${user?.role}`)}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu - Desktop */}
              {showProfileMenu && (
                <>
                  {/* Backdrop with blur */}
                  <div
                    className="fixed inset-0 z-40 bg-secondary-900/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
                    onClick={() => setShowProfileMenu(false)}
                  />

                  {/* Desktop Dropdown */}
                  <div className="hidden sm:block absolute ltr:right-0 rtl:left-0 z-50 w-56 mt-2 bg-white rounded-xl shadow-soft-lg border border-secondary-100 py-2 animate-scale-in origin-top-right">
                    <div className="px-4 py-3 border-b border-secondary-100">
                      <p className="text-sm font-semibold text-secondary-900 truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-secondary-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                      >
                        <UserCircleIcon className="w-5 h-5 text-secondary-400" />
                        <span>{t('nav.profile')}</span>
                      </Link>
                    </div>

                    <div className="border-t border-secondary-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>{t('auth.logout')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Bottom Sheet */}
                  <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 animate-slide-up">
                    <div className="bg-white rounded-t-3xl shadow-soft-xl border-t border-secondary-200 p-4 pb-8">
                      {/* Handle bar */}
                      <div className="w-12 h-1.5 bg-secondary-300 rounded-full mx-auto mb-4" />

                      {/* User Info */}
                      <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-2xl mb-4">
                        <div className="avatar-lg text-lg">
                          {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-secondary-900 truncate">
                            {user?.fullName}
                          </p>
                          <p className="text-sm text-secondary-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-4 px-4 py-3.5 text-secondary-700 hover:bg-secondary-50 rounded-xl transition-colors"
                        >
                          <UserCircleIcon className="w-6 h-6 text-secondary-400" />
                          <span className="text-base font-medium">{t('nav.profile')}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-4 w-full px-4 py-3.5 text-danger-600 hover:bg-danger-50 rounded-xl transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-6 h-6" />
                          <span className="text-base font-medium">{t('auth.logout')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
});

Header.displayName = 'Header';

export default Header;
