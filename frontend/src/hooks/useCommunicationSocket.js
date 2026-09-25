import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

const noop = () => {};

const useCommunicationSocket = ({
  token,
  onMessage = noop,
  onConversationNew = noop,
  onConversationUpdated = noop,
  onMessageRead = noop,
  onTypingStart = noop,
  onTypingStop = noop,
  onReaction = noop,
  onMessageDeleted = noop,
  onMessageDeletedForMe = noop,
  onMessagesDeleted = noop,
  onMessagesDeletedForMe = noop,
}) => {
  const socketRef = useRef(null);

  const [connectionStatus, setConnectionStatus] =
    useState("connecting");

  useEffect(() => {
    if (!token) {
      setConnectionStatus("disconnected");
      return;
    }

    setConnectionStatus("connecting");

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    /* =====================================================
       CONNECTION
    ====================================================== */

    socket.on("connect", () => {
      console.log(
        "[Communication Socket] Connected:",
        socket.id
      );

      setConnectionStatus("connected");
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "[Communication Socket] Disconnected:",
        reason
      );

      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error(
        "[Communication Socket] Connection error:",
        error
      );

      setConnectionStatus("disconnected");
    });

    /* =====================================================
       MESSAGE EVENTS
    ====================================================== */

    socket.on(
      "message:new",
      onMessage
    );

    socket.on(
      "conversation:new",
      onConversationNew
    );

    socket.on(
      "conversation:updated",
      onConversationUpdated
    );

    socket.on(
      "message:read",
      onMessageRead
    );

    /* =====================================================
       REACTIONS
    ====================================================== */

    socket.on(
      "message:reaction",
      onReaction
    );

    /* =====================================================
       SINGLE DELETION
    ====================================================== */

    socket.on(
      "message:deleted",
      onMessageDeleted
    );

    socket.on(
      "message:deletedForMe",
      onMessageDeletedForMe
    );

    /* =====================================================
       BULK DELETION
    ====================================================== */

    socket.on(
      "messages:deleted",
      onMessagesDeleted
    );

    socket.on(
      "messages:deletedForMe",
      onMessagesDeletedForMe
    );

    /* =====================================================
       TYPING
    ====================================================== */

    socket.on(
      "typing:start",
      onTypingStart
    );

    socket.on(
      "typing:stop",
      onTypingStop
    );

    /* =====================================================
       CLEANUP
    ====================================================== */

    return () => {
      socket.removeAllListeners();
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      setConnectionStatus(
        "disconnected"
      );
    };
  }, [
    token,
    onMessage,
    onConversationNew,
    onConversationUpdated,
    onMessageRead,
    onTypingStart,
    onTypingStop,
    onReaction,
    onMessageDeleted,
    onMessageDeletedForMe,
    onMessagesDeleted,
    onMessagesDeletedForMe,
  ]);

  /* =====================================================
     CONVERSATION
  ====================================================== */

  const joinConversation = useCallback(
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socketRef.current?.emit(
        "conversation:join",
        conversationId
      );
    },
    []
  );

  const leaveConversation = useCallback(
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socketRef.current?.emit(
        "conversation:leave",
        conversationId
      );
    },
    []
  );

  /* =====================================================
     TYPING
  ====================================================== */

  const startTyping = useCallback(
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socketRef.current?.emit(
        "typing:start",
        conversationId
      );
    },
    []
  );

  const stopTyping = useCallback(
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socketRef.current?.emit(
        "typing:stop",
        conversationId
      );
    },
    []
  );

  /* =====================================================
     RETURN
  ====================================================== */

  const connected =
    connectionStatus === "connected";

  return {
    connected,
    connectionStatus,

    joinConversation,
    leaveConversation,

    startTyping,
    stopTyping,
  };
};

export default useCommunicationSocket;