import axiosInstance from '../../../api/axiosInstance';

class MessagesService {
  /**
   * Get list of conversations for current user
   */
  async getConversations() {
    const res = await axiosInstance.get('/v1/conversations');
    return res.data;
  }

  /**
   * Create or fetch a direct conversation with a participant
   */
  async createConversation(participantId) {
    const res = await axiosInstance.post('/v1/conversations', { participantId });
    return res.data;
  }

  /**
   * Get paginated messages of a conversation
   */
  async getMessages(conversationId, params = {}) {
    const res = await axiosInstance.get(`/v1/messages/${conversationId}`, { params });
    return res.data;
  }

  /**
   * Send a new message
   */
  async sendMessage(payload, content, attachments) {
    let body;
    if (typeof payload === 'object' && payload !== null) {
      body = payload;
    } else {
      body = { conversationId: payload, text: content, attachments };
    }
    const res = await axiosInstance.post('/v1/messages', body);
    return res.data;
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markAsRead(conversationId) {
    const res = await axiosInstance.patch('/v1/messages/read', { conversationId });
    return res.data;
  }

  async markConversationRead(conversationId) {
    return this.markAsRead(conversationId);
  }

  /**
   * Pin a conversation
   */
  async pinConversation(conversationId) {
    const res = await axiosInstance.patch(`/v1/conversations/${conversationId}/pin`);
    return res.data;
  }

  /**
   * Unpin a conversation
   */
  async unpinConversation(conversationId) {
    const res = await axiosInstance.patch(`/v1/conversations/${conversationId}/unpin`);
    return res.data;
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId) {
    const res = await axiosInstance.patch(`/v1/conversations/${conversationId}/archive`);
    return res.data;
  }

  /**
   * Restore/Unarchive a conversation
   */
  async restoreConversation(conversationId) {
    const res = await axiosInstance.patch(`/v1/conversations/${conversationId}/restore`);
    return res.data;
  }

  /**
   * Mute a conversation
   */
  async muteConversation(conversationId) {
    const res = await axiosInstance.patch(`/v1/conversations/${conversationId}/mute`);
    return res.data;
  }

  /**
   * Unmute a conversation
   */
  async unmuteConversation(conversationId) {
    const res = await axiosInstance.patch(`/v1/conversations/${conversationId}/unmute`);
    return res.data;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId) {
    const res = await axiosInstance.delete(`/v1/conversations/${conversationId}`);
    return res.data;
  }

  /**
   * Edit a message text
   */
  async editMessage(messageId, text) {
    const res = await axiosInstance.patch(`/v1/messages/${messageId}`, { text });
    return res.data;
  }

  /**
   * Delete a message
   * @param {string} messageId 
   * @param {string} deleteType - 'everyone' or 'me'
   */
  async deleteMessage(messageId, deleteType = 'everyone') {
    const res = await axiosInstance.delete(`/v1/messages/${messageId}`, {
      data: { deleteType }
    });
    return res.data;
  }

  /**
   * Add a reaction to a message
   */
  async reactToMessage(messageId, reaction) {
    const res = await axiosInstance.post(`/v1/messages/${messageId}/react`, { reaction });
    return res.data;
  }

  /**
   * Upload an attachment file
   */
  async uploadAttachment(formData) {
    const res = await axiosInstance.post('/v1/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }

  /**
   * Search messages across user's conversations
   */
  async searchMessages(query) {
    const res = await axiosInstance.get('/v1/search/messages', { params: { q: query } });
    return res.data;
  }

  /**
   * Search conversations
   */
  async searchConversations(query) {
    const res = await axiosInstance.get('/v1/search/conversations', { params: { q: query } });
    return res.data;
  }

  /**
   * Get all shared files across conversations
   */
  async getSharedFiles() {
    const res = await axiosInstance.get('/v1/messages/shared-files');
    return res.data;
  }

  /**
   * Create a group chat
   */
  async createGroup(name, description, participantIds = []) {
    const res = await axiosInstance.post('/v1/messages/group/create', { name, description, participantIds });
    return res.data;
  }

  /**
   * Invite members to group chat
   */
  async inviteToGroup(conversationId, participantIds = []) {
    const res = await axiosInstance.post('/v1/messages/group/invite', { conversationId, participantIds });
    return res.data;
  }

  /**
   * Start a call log
   */
  async startCall(payload) {
    const res = await axiosInstance.post('/v1/messages/call/start', payload);
    return res.data;
  }

  /**
   * End a call log
   */
  async endCall(callId, status) {
    const res = await axiosInstance.post('/v1/messages/call/end', { callId, status });
    return res.data;
  }

  /**
   * Get call history
   */
  async getCallHistory() {
    const res = await axiosInstance.get('/v1/messages/call/history');
    return res.data;
  }

  /**
   * Get pending connection requests
   */
  async getRequests() {
    const res = await axiosInstance.get('/v1/messages/requests');
    return res.data;
  }

  /**
   * Accept connection request
   */
  async acceptRequest(requestId) {
    const res = await axiosInstance.post('/v1/network/accept', { requestId });
    return res.data;
  }

  /**
   * Reject connection request
   */
  async rejectRequest(requestId) {
    const res = await axiosInstance.post('/v1/network/reject', { requestId });
    return res.data;
  }

  /**
   * Get messaging contacts — returns connections, followers, and following
   * each enriched with online status and existingConversationId.
   */
  async getContacts() {
    const res = await axiosInstance.get('/v1/messages/contacts');
    return res.data;
  }
}

export default new MessagesService();
