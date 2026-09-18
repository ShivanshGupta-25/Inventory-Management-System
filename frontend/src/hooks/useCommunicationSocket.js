import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";

const SOCKET_URL =
  "http://localhost:5000";

const useCommunicationSocket = ({
  token,
  onMessage,
  onConversationNew,
  onConversationUpdated,
  onMessageRead,
  onTypingStart,
  onTypingStop,
}) => {
  const socketRef = useRef(null);

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

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
    socket.on(
      "typing:start",
      onTypingStart
    );
    socket.on(
      "typing:stop",
      onTypingStop
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [
    token,
    onMessage,
    onConversationNew,
    onConversationUpdated,
    onMessageRead,
    onTypingStart,
    onTypingStop,
  ]);

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

  return {
    connected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  };
};

export default useCommunicationSocket;