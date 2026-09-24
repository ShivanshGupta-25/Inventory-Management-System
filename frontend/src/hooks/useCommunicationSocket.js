import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

const useCommunicationSocket = ({
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
}) => {
  const socketRef = useRef(null);

  /*
   * Connection states:
   *
   * connecting   -> trying to connect
   * connected    -> Socket.IO connection is active
   * disconnected -> connection is not active
   */
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

      // Optional but recommended for local development.
      transports: ["websocket"],
    });

    socketRef.current = socket;

    /* =====================================================
       CONNECTION EVENTS
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

    socket.on("message:new", onMessage);

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
       REACTION EVENTS
    ====================================================== */

    socket.on(
      "message:reaction",
      onReaction
    );

    /* =====================================================
   DELETION EVENTS
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
       TYPING EVENTS
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

      socketRef.current = null;

      setConnectionStatus("disconnected");
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
  ]);

  /* =====================================================
     CONVERSATION
  ====================================================== */

  const joinConversation = useCallback(
    (conversationId) => {
      socketRef.current?.emit(
        "conversation:join",
        conversationId
      );
    },
    []
  );

  const leaveConversation = useCallback(
    (conversationId) => {
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
      socketRef.current?.emit(
        "typing:start",
        conversationId
      );
    },
    []
  );

  const stopTyping = useCallback(
    (conversationId) => {
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