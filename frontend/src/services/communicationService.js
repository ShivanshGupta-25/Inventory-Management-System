import apiRequest from "./api";

const communicationService = {
  /* =====================================================
     USERS
  ===================================================== */

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

  /* =====================================================
     CONVERSATIONS
  ===================================================== */

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

  /* =====================================================
     MESSAGES
  ===================================================== */

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
    text = "",
    files = [],
    replyTo = null
  ) => {
    const formData =
      new FormData();

    if (text?.trim()) {
      formData.append(
        "text",
        text.trim()
      );
    }

    if (replyTo) {
      formData.append(
        "replyTo",
        replyTo
      );
    }

    files.forEach((file) => {
      formData.append(
        "files",
        file
      );
    });

    return apiRequest(
      `/communication/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: formData,
      }
    );
  },

  /* =====================================================
     READ STATUS
  ===================================================== */

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

  /* =====================================================
     REACTIONS
  ===================================================== */

  toggleMessageReaction: async (
    messageId,
    emoji
  ) => {
    const response =
      await apiRequest(
        `/communication/messages/${messageId}/reactions`,
        {
          method: "POST",

          body: JSON.stringify({
            emoji,
          }),
        }
      );

    return response.data;
  },

  /* =====================================================
     SINGLE MESSAGE DELETE
  ===================================================== */

  deleteMessageForMe: async (
    messageId
  ) => {
    return apiRequest(
      `/communication/messages/${messageId}/me`,
      {
        method: "DELETE",
      }
    );
  },

  deleteMessageForEveryone: async (
    messageId
  ) => {
    return apiRequest(
      `/communication/messages/${messageId}/everyone`,
      {
        method: "DELETE",
      }
    );
  },

  /* =====================================================
     BULK DELETE
  ===================================================== */

  deleteMessagesForMe: async (
    messageIds
  ) => {
    return apiRequest(
      "/communication/messages/bulk/me",
      {
        method: "DELETE",

        body: JSON.stringify({
          messageIds,
        }),
      }
    );
  },

  deleteMessagesForEveryone: async (
    messageIds
  ) => {
    return apiRequest(
      "/communication/messages/bulk/everyone",
      {
        method: "DELETE",

        body: JSON.stringify({
          messageIds,
        }),
      }
    );
  },

  /* =====================================================
     FORWARD MESSAGES
  ===================================================== */

  forwardMessages: async (
    messageIds,
    conversationIds
  ) => {
    return apiRequest(
      "/communication/messages/forward",
      {
        method: "POST",

        body: JSON.stringify({
          messageIds,
          conversationIds,
        }),
      }
    );
  },

  /* =====================================================
     MESSAGE THREAD
  ===================================================== */

  getMessageThread: async (
    conversationId,
    messageId
  ) => {
    return apiRequest(
      `/communication/conversations/${conversationId}/messages/${messageId}/thread`,
      {
        method: "GET",
      }
    );
  },
};

export default communicationService;