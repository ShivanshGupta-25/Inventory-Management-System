
import api from "./api";

const chatService = {
  // Get conversations available to the logged-in user
  getConversations: async (params = {}) => {
    const response = await api.get("/chat/conversations", {
      params,
    });

    return response.data;
  },

  // Create a new direct conversation or return existing one
  createConversation: async (recipientId) => {
    const response = await api.post("/chat/conversations", {
      recipientId,
    });

    return response.data;
  },

  // Get a single conversation
  getConversationById: async (conversationId) => {
    const response = await api.get(
      `/chat/conversations/${conversationId}`
    );

    return response.data;
  },

  // Fetch paginated messages
  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages`,
      {
        params,
      }
    );

    return response.data;
  },

  // Send a text message
  sendMessage: async (conversationId, payload) => {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      payload
    );

    return response.data;
  },

  // Edit an existing message
  editMessage: async (messageId, content) => {
    const response = await api.patch(
      `/chat/messages/${messageId}`,
      {
        content,
      }
    );

    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(
      `/chat/messages/${messageId}`
    );

    return response.data;
  },

  // Mark conversation messages as read
  markAsRead: async (conversationId) => {
    const response = await api.patch(
      `/chat/conversations/${conversationId}/read`
    );

    return response.data;
  },
};

export default chatService;