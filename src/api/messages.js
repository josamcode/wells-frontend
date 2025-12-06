import axios from './axios';

export const messagesAPI = {
  // Get all conversations (inbox)
  getConversations: (params) => axios.get('/messages/conversations', { params }),

  // Get messages in a conversation thread
  getConversationMessages: (threadId) => axios.get(`/messages/conversations/${threadId}/messages`),

  // Get allowed recipients for composing
  getAllowedRecipients: () => axios.get('/messages/recipients'),

  // Send a new message
  sendMessage: (data) => axios.post('/messages', data),

  // Mark conversation as read
  markAsRead: (threadId) => axios.patch(`/messages/conversations/${threadId}/read`),

  // Delete a conversation
  deleteConversation: (threadId) => axios.delete(`/messages/conversations/${threadId}`),

  // Get unread message count
  getUnreadCount: () => axios.get('/messages/unread-count'),
};
