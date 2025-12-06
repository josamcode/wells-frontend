import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { messagesAPI } from '../../api/messages';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import MultiSelect from '../../components/common/MultiSelect';
import { CardSkeleton } from '../../components/common/Loading';
import { formatDateTime, formatDate } from '../../utils/helpers';
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Messages = memo(() => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user, hasRole } = useAuth();
  const [view, setView] = useState('inbox'); // 'inbox', 'compose', 'conversation'
  const [conversations, setConversations] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [composeData, setComposeData] = useState({
    recipientIds: [],
    subject: '',
    body: '',
    threadId: null,
  });

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await messagesAPI.getConversations({ page: 1, limit: 50 });
      setConversations(response.data.data.conversations);
    } catch (error) {
      toast.error(t('messages.failedToFetchConversations'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch allowed recipients
  const fetchRecipients = useCallback(async () => {
    try {
      const response = await messagesAPI.getAllowedRecipients();
      setRecipients(response.data.data.recipients);
    } catch (error) {
      toast.error(t('messages.failedToFetchRecipients'));
    }
  }, [t]);

  // Fetch conversation messages
  const fetchMessages = useCallback(async (threadId) => {
    if (!threadId) return;
    setLoading(true);
    setMessages([]); // Clear messages before fetching to prevent duplication
    try {
      const response = await messagesAPI.getConversationMessages(threadId);
      setMessages(response.data.data.messages || []);
      await messagesAPI.markAsRead(threadId);
      fetchConversations(); // Refresh conversations to update unread count
    } catch (error) {
      toast.error(t('messages.failedToFetchMessages'));
    } finally {
      setLoading(false);
    }
  }, [t, fetchConversations]);

  useEffect(() => {
    fetchConversations();
    if (view === 'compose') {
      fetchRecipients();
    }
  }, [view, fetchConversations, fetchRecipients]);

  const handleSelectConversation = useCallback((conversation) => {
    // Prevent duplicate calls
    if (selectedThread?.threadId === conversation.threadId && view === 'conversation') {
      return;
    }
    setSelectedThread(conversation);
    setView('conversation');
    setMessages([]); // Clear messages before loading new ones
    fetchMessages(conversation.threadId);
  }, [selectedThread, view, fetchMessages]);

  const handleCompose = useCallback((threadId = null, initialRecipients = []) => {
    // If replying, auto-select the other participants
    let autoSelectedRecipients = initialRecipients;
    if (threadId && selectedThread?.participants) {
      // Get IDs of other participants (not the current user)
      autoSelectedRecipients = selectedThread.participants
        .filter((p) => p._id?.toString() !== user?._id?.toString())
        .map((p) => p._id?.toString() || p._id);
    }

    setComposeData({
      recipientIds: autoSelectedRecipients,
      subject: threadId ? `Re: ${selectedThread?.subject || ''}` : '',
      body: '',
      threadId,
    });
    setView('compose');
    fetchRecipients();
  }, [selectedThread, user, fetchRecipients]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!composeData.recipientIds.length) {
      toast.error(t('messages.selectRecipient'));
      return;
    }
    if (!composeData.subject.trim()) {
      toast.error(t('messages.subjectRequired'));
      return;
    }
    if (!composeData.body.trim()) {
      toast.error(t('messages.bodyRequired'));
      return;
    }

    setSending(true);
    try {
      const payload = {
        recipients: composeData.recipientIds,
        subject: composeData.subject,
        body: composeData.body,
      };
      // Only include threadId if it's not null/undefined
      if (composeData.threadId) {
        payload.threadId = composeData.threadId;
      }
      await messagesAPI.sendMessage(payload);
      toast.success(t('messages.messageSent'));
      setComposeData({ recipientIds: [], subject: '', body: '', threadId: null });
      if (composeData.threadId) {
        // If replying, go back to conversation
        fetchMessages(composeData.threadId);
      } else {
        // If new message, go to inbox
        setView('inbox');
        fetchConversations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.failedToSend'));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (threadId) => {
    if (!window.confirm(t('messages.deleteConversationConfirm'))) return;
    try {
      await messagesAPI.deleteConversation(threadId);
      toast.success(t('messages.conversationDeleted'));
      if (selectedThread?.threadId === threadId) {
        setView('inbox');
        setSelectedThread(null);
        setMessages([]);
      }
      fetchConversations();
    } catch (error) {
      toast.error(t('messages.failedToDelete'));
    }
  };

  const recipientOptions = recipients.map((r) => ({
    value: r._id?.toString() || r._id,
    label: `${r.fullName} (${t(`users.roles.${r.role}`)})`,
  }));

  // Inbox View
  if (view === 'inbox') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">{t('messages.title')}</h1>
            <p className="text-secondary-500 mt-1">{t('messages.subtitle')}</p>
          </div>
          <Button icon={PencilSquareIcon} onClick={() => handleCompose()}>
            {t('messages.compose')}
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} lines={2} />
              ))}
            </div>
          ) : conversations.length > 0 ? (
            <div className="divide-y divide-secondary-100">
              {conversations.map((conv, index) => (
                <div
                  key={`${conv.threadId}-${conv._id}-${index}`}
                  onClick={() => handleSelectConversation(conv)}
                  className="p-4 hover:bg-secondary-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-secondary-900 truncate">{conv.subject}</h3>
                        {conv.unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary-600 truncate mb-1">{conv.lastMessage}</p>
                      <div className="flex items-center gap-2 text-xs text-secondary-500">
                        <span>
                          {conv.participants.length === 1
                            ? conv.participants[0]?.fullName
                            : `${conv.participants.length} ${t('messages.participants')}`}
                        </span>
                        <span>•</span>
                        <span>{formatDate(conv.lastMessageAt)}</span>
                      </div>
                    </div>
                    {hasRole('super_admin') && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.threadId);
                          }}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-12">
              <EnvelopeIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-500">{t('messages.noConversations')}</p>
              <Button className="mt-4" onClick={() => handleCompose()}>
                {t('messages.composeFirst')}
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Compose View
  if (view === 'compose') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setView('inbox');
              setComposeData({ recipientIds: [], subject: '', body: '', threadId: null });
            }}
            className="p-2 rounded-xl hover:bg-secondary-100 text-secondary-500 transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
              {composeData.threadId ? t('messages.reply') : t('messages.compose')}
            </h1>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSendMessage} className="space-y-6">
            <MultiSelect
              label={t('messages.recipients')}
              options={recipientOptions}
              value={composeData.recipientIds}
              onChange={(selectedIds) => setComposeData({ ...composeData, recipientIds: selectedIds })}
              placeholder={t('messages.selectRecipients') || 'Select recipients...'}
              required
            />
            <Input
              label={t('messages.subject')}
              name="subject"
              value={composeData.subject}
              onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              required
            />
            <Textarea
              label={t('messages.message')}
              name="body"
              value={composeData.body}
              onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
              rows={10}
              required
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setView('inbox');
                  setComposeData({ recipientIds: [], subject: '', body: '', threadId: null });
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={sending} icon={PaperAirplaneIcon}>
                {t('messages.send')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Conversation View
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setView('inbox');
            setSelectedThread(null);
            setMessages([]);
          }}
          className="p-2 rounded-xl hover:bg-secondary-100 text-secondary-500 transition-all"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
            {selectedThread?.subject || t('messages.conversation')}
          </h1>
          <p className="text-secondary-500 mt-1">
            {selectedThread?.participants?.map((p) => p.fullName).join(', ') || ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={PencilSquareIcon} onClick={() => handleCompose(selectedThread?.threadId)}>
            {t('messages.reply')}
          </Button>
          {hasRole('super_admin') && (
            <Button
              variant="outline-danger"
              size="sm"
              icon={TrashIcon}
              onClick={() => handleDeleteConversation(selectedThread?.threadId)}
            >
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>

      <Card className="flex flex-col" style={{ minHeight: '500px', maxHeight: '70vh' }}>
        <div className="flex-1 overflow-y-auto space-y-4 p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} lines={3} />
              ))}
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => {
              const isFromMe = message.sender._id.toString() === user?._id?.toString();

              return (
                <div
                  key={message._id}
                  className={`flex gap-4 ${isFromMe ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0`}>
                    <UserIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className={`flex-1 ${isFromMe ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[80%] ${isFromMe ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-900'} rounded-2xl p-4`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${isFromMe ? 'text-white' : 'text-secondary-700'}`}>
                          {message.sender.fullName}
                        </span>
                        <span className={`text-xs ${isFromMe ? 'text-primary-100' : 'text-secondary-500'}`}>
                          {formatDateTime(message.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm ${isFromMe ? 'text-white' : 'text-secondary-700'} whitespace-pre-wrap`}>
                        {message.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state py-12">
              <EnvelopeIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-500">{t('messages.noMessages')}</p>
            </div>
          )}
        </div>
        <div className="border-t border-secondary-100 p-4">
          <Button
            fullWidth
            icon={PencilSquareIcon}
            onClick={() => handleCompose(selectedThread?.threadId)}
          >
            {t('messages.reply')}
          </Button>
        </div>
      </Card>
    </div>
  );
});

Messages.displayName = 'Messages';

export default Messages;
