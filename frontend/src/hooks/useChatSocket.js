import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
};

const useChatSocket = ({
  onNewMessage,
  onConversationUpdated,
  onTypingUpdate,
  onReadUpdate,
  onPresenceUpdate,
  onInitialPresence,
} = {}) => {
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const callbacksRef = useRef({
    onNewMessage,
    onConversationUpdated,
    onTypingUpdate,
    onReadUpdate,
    onPresenceUpdate,
    onInitialPresence,
  });

  // Keep callbacks up to date without reconnecting the socket.
  useEffect(() => {
    callbacksRef.current = {
      onNewMessage,
      onConversationUpdated,
      onTypingUpdate,
      onReadUpdate,
      onPresenceUpdate,
      onInitialPresence,
    };
  }, [
    onNewMessage,
    onConversationUpdated,
    onTypingUpdate,
    onReadUpdate,
    onPresenceUpdate,
    onInitialPresence,
  ]);

  const connect = useCallback(() => {
    // Already connected.
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    const token = getToken();

    if (!token) {
      setConnectionError("Authentication token is missing");
      return null;
    }

    // Remove an old disconnected socket before creating
    // a new connection.
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },

      // Socket.IO will use WebSocket and fall back to polling.
      transports: ["websocket", "polling"],

      withCredentials: true,

      autoConnect: true,
    });

    socketRef.current = socket;

    /**
     * Connected
     */
    socket.on("connect", () => {
      console.log(
        "[Chat Socket] Connected:",
        socket.id
      );

      setConnected(true);
      setConnectionError("");
    });

    /**
     * Disconnected
     */
    socket.on("disconnect", (reason) => {
      console.log(
        "[Chat Socket] Disconnected:",
        reason
      );

      setConnected(false);
    });

    /**
     * Connection error
     */
    socket.on("connect_error", (error) => {
      console.error(
        "[Chat Socket] Connection error:",
        error
      );

      setConnected(false);

      setConnectionError(
        error?.message ||
          "Unable to connect to chat server"
      );
    });

    /**
     * Initial presence
     *
     * Backend sends:
     *
     * {
     *   userId,
     *   status: "online"
     * }
     *
     * Therefore this must NOT be treated as an array.
     */
    socket.on("presence:initial", (payload) => {
      if (!payload) {
        return;
      }

      const userId = payload.userId
        ? String(payload.userId)
        : null;

      if (
        payload.status === "online" &&
        userId
      ) {
        setOnlineUsers((previousUsers) => {
          const users = Array.isArray(previousUsers)
            ? previousUsers
            : [];

          if (users.includes(userId)) {
            return users;
          }

          return [...users, userId];
        });
      }

      callbacksRef.current.onInitialPresence?.(
        payload
      );
    });

    /**
     * User presence updates
     *
     * Backend sends:
     *
     * {
     *   userId,
     *   status,
     *   timestamp
     * }
     */
    socket.on("user:presence", (payload) => {
      if (!payload?.userId) {
        return;
      }

      const userId = String(payload.userId);

      setOnlineUsers((previousUsers) => {
        const users = Array.isArray(previousUsers)
          ? previousUsers
          : [];

        if (payload.status === "online") {
          if (users.includes(userId)) {
            return users;
          }

          return [...users, userId];
        }

        if (payload.status === "offline") {
          return users.filter(
            (id) => String(id) !== userId
          );
        }

        return users;
      });

      callbacksRef.current.onPresenceUpdate?.(
        payload
      );
    });

    /**
     * New message
     */
    socket.on("message:new", (payload) => {
      callbacksRef.current.onNewMessage?.(
        payload
      );
    });

    /**
     * Conversation updated
     */
    socket.on(
      "conversation:updated",
      (payload) => {
        callbacksRef.current.onConversationUpdated?.(
          payload
        );
      }
    );

    /**
     * Typing update
     */
    socket.on("typing:update", (payload) => {
      callbacksRef.current.onTypingUpdate?.(
        payload
      );
    });

    /**
     * Read receipt update
     */
    socket.on(
      "message:read:update",
      (payload) => {
        callbacksRef.current.onReadUpdate?.(
          payload
        );
      }
    );

    return socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setConnected(false);
  }, []);

  /**
   * Join conversation room.
   */
  const joinConversation = useCallback(
    (conversationId) => {
      const socket = socketRef.current;

      if (
        !socket?.connected ||
        !conversationId
      ) {
        return;
      }

      socket.emit("conversation:join", {
        conversationId,
      });
    },
    []
  );

  /**
   * Leave conversation room.
   */
  const leaveConversation = useCallback(
    (conversationId) => {
      const socket = socketRef.current;

      if (
        !socket?.connected ||
        !conversationId
      ) {
        return;
      }

      socket.emit("conversation:leave", {
        conversationId,
      });
    },
    []
  );

  /**
   * Start typing.
   */
  const startTyping = useCallback(
    (conversationId) => {
      const socket = socketRef.current;

      if (
        !socket?.connected ||
        !conversationId
      ) {
        return;
      }

      socket.emit("typing:start", {
        conversationId,
      });
    },
    []
  );

  /**
   * Stop typing.
   */
  const stopTyping = useCallback(
    (conversationId) => {
      const socket = socketRef.current;

      if (
        !socket?.connected ||
        !conversationId
      ) {
        return;
      }

      socket.emit("typing:stop", {
        conversationId,
      });
    },
    []
  );

  /**
   * Connect on mount and disconnect on unmount.
   */
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    connected,
    connectionError,
    onlineUsers,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  };
};

export default useChatSocket;
