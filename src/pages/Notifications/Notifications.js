import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { notificationsAPI } from '../../api/notifications';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatDateTime } from '../../utils/helpers';
import {
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  FolderIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const Notifications = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { unreadOnly: 'true', limit: 50 } : { limit: 50 };
      const response = await notificationsAPI.getAll(params);
      setNotifications(response.data.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'project_assigned':
      case 'project_status_changed':
        return FolderIcon;
      case 'report_submitted':
      case 'report_approved':
      case 'report_rejected':
        return DocumentTextIcon;
      case 'user_role_changed':
        return UserIcon;
      default:
        return BellIcon;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t('notifications.title')}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'unread' ? 'primary' : 'secondary'}
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          <Button size="sm" variant="secondary" onClick={handleMarkAllAsRead}>
            <CheckCircleIcon className="w-4 h-4 ltr:mr-1 rtl:ml-1" />
            {t('notifications.markAllRead')}
          </Button>
        </div>
      </div>

      <Card>
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const title = notification.title[language] || notification.title.en;
              const message = notification.message[language] || notification.message.en;

              return (
                <div
                  key={notification._id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${notification.isRead ? 'bg-white' : 'bg-blue-50'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-primary-100'
                          }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${notification.isRead ? 'text-gray-500' : 'text-primary-600'
                            }`}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'
                              }`}
                          >
                            {title}
                          </p>
                          <p
                            className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'
                              }`}
                          >
                            {message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDateTime(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded"
                              title="Mark as read"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {notification.actionUrl && (
                        <Link
                          to={notification.actionUrl}
                          className="inline-block mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">{t('notifications.noNotifications')}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;

