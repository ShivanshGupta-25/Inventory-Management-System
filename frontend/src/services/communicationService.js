import apiRequest from "./api";

const communicationService = {
  getUsers: async (search = "") => {
    const query = search
      ? `?search=${encodeURIComponent(search)}`
      : "";

    return apiRequest(
      `/communication/users${query}`,
      {
        method: "GET",
      }
    );
  },

  getConversations: async () => {
    return apiRequest(
      "/communication/conversations",
      {
        method: "GET",
      }
    );
  },

  getConversation: async (
    conversationId
  ) => {
    return apiRequest(
      `/communication/conversations/${conversationId}`,
      {
        method: "GET",
      }
    );
  },

  createDirectConversation: async (
    userId
  ) => {
    return apiRequest(
      "/communication/conversations/direct",
      {
        method: "POST",
        body: JSON.stringify({
          userId,
        }),
      }
    );
  },

  createGroupConversation: async (
    name,
    participantIds
  ) => {
    return apiRequest(
      "/communication/conversations/group",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          participantIds,
        }),
      }
    );
  },

  getMessages: async (
    conversationId,
    options = {}
  ) => {
    const params =
      new URLSearchParams();

    if (options.limit) {
      params.set(
        "limit",
        options.limit
      );
    }

    if (options.before) {
      params.set(
        "before",
        options.before
      );
    }

    const query =
      params.toString();

    return apiRequest(
      `/communication/conversations/${conversationId}/messages${
        query ? `?${query}` : ""
      }`,
      {
        method: "GET",
      }
    );
  },

  sendMessage: async (
    conversationId,
    text,
    replyTo = null
  ) => {
    return apiRequest(
      `/communication/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          text,
          replyTo,
        }),
      }
    );
  },

  markRead: async (
    conversationId
  ) => {
    return apiRequest(
      `/communication/conversations/${conversationId}/read`,
      {
        method: "POST",
      }
    );
  },
};

export default communicationService;