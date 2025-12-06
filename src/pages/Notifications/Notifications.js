import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { notificationsAPI } from '../../api/notifications';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/Loading';
import { formatDateTime } from '../../utils/helpers';
import {
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  FolderIcon,
  UserIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const Notifications = memo(() => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { unreadOnly: 'true', limit: 50 } : { limit: 50 };
      const response = await notificationsAPI.getAll(params);
      setNotifications(response.data.data.notifications);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      toast.error(t('notifications.failedToMarkAsRead'));
    }
  }, [fetchNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();
      toast.success(t('notifications.allMarkedAsRead'));
      fetchNotifications();
    } catch (error) {
      toast.error(t('notifications.failedToMarkAllAsRead'));
    }
  }, [fetchNotifications]);

  const handleDelete = useCallback(async (id) => {
    try {
      await notificationsAPI.delete(id);
      toast.success(t('notifications.notificationDeleted'));
      fetchNotifications();
    } catch (error) {
      toast.error(t('notifications.failedToDelete'));
    }
  }, [fetchNotifications]);

  const getIcon = useCallback((type) => {
    const icons = {
      project_assigned: FolderIcon,
      project_status_changed: FolderIcon,
      report_submitted: DocumentTextIcon,
      report_approved: DocumentTextIcon,
      report_rejected: DocumentTextIcon,
      user_role_changed: UserIcon,
    };
    return icons[type] || BellIcon;
  }, []);

  const getPriorityStyles = useCallback((priority) => {
    const styles = {
      high: 'border-l-danger-500',
      medium: 'border-l-warning-500',
      low: 'border-l-info-500',
    };
    return styles[priority] || 'border-l-secondary-300';
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 skeleton rounded-lg" />
          <div className="h-10 w-32 skeleton rounded-lg" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} lines={2} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">{t('notifications.title')}</h1>
          <p className="section-subtitle">
            {t('notifications.stayUpdated')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-xl bg-secondary-100 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                ? 'bg-white text-secondary-900 shadow-soft'
                : 'text-secondary-500 hover:text-secondary-700'
                }`}
            >
              {t('notifications.all')}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread'
                ? 'bg-white text-secondary-900 shadow-soft'
                : 'text-secondary-500 hover:text-secondary-700'
                }`}
            >
              {t('notifications.unread')}
            </button>
          </div>
          <Button variant="secondary" size="sm" icon={CheckCircleIcon} onClick={handleMarkAllAsRead}>
            {t('notifications.markAllRead')}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const title = notification.title[language] || notification.title.en;
            const message = notification.message[language] || notification.message.en;

            return (
              <Card
                key={notification._id}
                className={`
                  border-l-4 transition-all duration-200 hover:shadow-soft-lg
                  ${getPriorityStyles(notification.priority)}
                  ${notification.isRead ? 'bg-white' : 'bg-primary-50/50'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                    ${notification.isRead ? 'bg-secondary-100' : 'bg-primary-100'}
                  `}>
                    <Icon className={`w-5 h-5 ${notification.isRead ? 'text-secondary-500' : 'text-primary-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${notification.isRead ? 'text-secondary-700' : 'text-secondary-900'}`}>
                          {title}
                        </p>
                        <p className={`text-sm mt-1 ${notification.isRead ? 'text-secondary-500' : 'text-secondary-600'}`}>
                          {message}
                        </p>
                        <p className="text-xs text-secondary-400 mt-2">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                            title={t('common.markAsRead')}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title={t('common.deleteItem')}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <Link
                        to={notification.actionUrl}
                        className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {t('notifications.viewDetails')}
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="empty-state py-16">
            <BellIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-secondary-700">{t('notifications.noNotifications')}</p>
            <p className="text-secondary-500 mt-1">{t('notifications.allCaughtUp')}</p>
          </div>
        </Card>
      )}
    </div>
  );
});

Notifications.displayName = 'Notifications';

export default Notifications;
