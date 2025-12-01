import React, { useState, useEffect } from 'react';
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

const Header = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4">
            <img
              src="/logo.png"
              alt={t('app.name')}
              className="h-10 w-auto object-contain"
            />
            <h2 className="ltr:ml-4 rtl:mr-4 text-lg font-semibold text-gray-900 hidden sm:block">
              {t('app.name')}
            </h2>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 p-2 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
            title={t('settings.language')}
          >
            <span className="sr-only sm:not-sr-only text-sm">
              {language === 'en' ? 'AR' : 'EN'}
            </span>
            <GlobeAltIcon className="w-6 h-6" />
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <UserCircleIcon className="w-6 h-6" />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                ></div>
                <div className="absolute ltr:right-0 rtl:left-0 z-20 w-48 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <UserCircleIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                    {t('nav.profile')}
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                    {t('auth.logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

