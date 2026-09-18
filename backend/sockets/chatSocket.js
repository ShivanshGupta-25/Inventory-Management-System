
const {
  canAccessConversation,
  getAccessibleConversation,
} = require("../services/chatService");

const socketAuth = require("./socketAuth");

const onlineUsers = new Map();

const getUserId = (socket) => {
  return socket.user?._id?.toString();
};

const getUserRoom = (userId) => {
  return `user:${userId}`;
};

const getConversationRoom = (conversationId) => {
  return `conversation:${conversationId}`;
};

const addUserConnection = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socketId);
};

const removeUserConnection = (userId, socketId) => {
  const connections = onlineUsers.get(userId);

  if (!connections) return false;

  connections.delete(socketId);

  if (connections.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }

  return false;
};

const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

const emitPresence = (io, userId, status) => {
  io.emit("user:presence", {
    userId,
    status,
    timestamp: new Date(),
  });
};

const initializeChatSocket = (io) => {
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = getUserId(socket);

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    addUserConnection(userId, socket.id);

    // Personal room for notifications.
    socket.join(getUserRoom(userId));

    // Send current user presence to this socket.
    socket.emit("presence:initial", {
      userId,
      status: "online",
    });

    // Only broadcast online when the user first connects.
    if (onlineUsers.get(userId)?.size === 1) {
      emitPresence(io, userId, "online");
    }

    console.log(
      `[Socket] Connected: ${socket.user.email} (${socket.id})`
    );

    /**
     * Join an authorized conversation room.
     */
    socket.on("conversation:join", async (payload = {}, callback) => {
      try {
        const { conversationId } = payload;

        if (!conversationId) {
          throw new Error("conversationId is required");
        }

        const conversation =
          await getAccessibleConversation(
            conversationId,
            socket.user
          );

        const canAccess =
          await canAccessConversation(
            conversation,
            socket.user
          );

        if (!canAccess) {
          throw new Error("Conversation access denied");
        }

        const room = getConversationRoom(conversationId);

        socket.join(room);

        socket.emit("conversation:joined", {
          conversationId,
          room,
        });

        if (typeof callback === "function") {
          callback({
            success: true,
            conversationId,
          });
        }
      } catch (error) {
        console.error(
          "[Socket] Join conversation error:",
          error.message
        );

        if (typeof callback === "function") {
          callback({
            success: false,
            message: error.message,
          });
        } else {
          socket.emit("chat:error", {
            message: error.message,
          });
        }
      }
    });

    /**
     * Leave a conversation room.
     */
    socket.on("conversation:leave", (payload = {}) => {
      const { conversationId } = payload;

      if (!conversationId) return;

      socket.leave(getConversationRoom(conversationId));

      socket.emit("conversation:left", {
        conversationId,
      });
    });

    /**
     * Typing started.
     */
    socket.on("typing:start", async (payload = {}) => {
      try {
        const { conversationId } = payload;

        if (!conversationId) return;

        const conversation =
          await getAccessibleConversation(
            conversationId,
            socket.user
          );

        const allowed =
          await canAccessConversation(
            conversation,
            socket.user
          );

        if (!allowed) return;

        const room = getConversationRoom(conversationId);

        socket.to(room).emit("typing:update", {
          conversationId,
          userId,
          userName: socket.user.name,
          isTyping: true,
        });
      } catch (error) {
        console.error(
          "[Socket] Typing start error:",
          error.message
        );
      }
    });

    /**
     * Typing stopped.
     */
    socket.on("typing:stop", async (payload = {}) => {
      try {
        const { conversationId } = payload;

        if (!conversationId) return;

        const conversation =
          await getAccessibleConversation(
            conversationId,
            socket.user
          );

        const allowed =
          await canAccessConversation(
            conversation,
            socket.user
          );

        if (!allowed) return;

        const room = getConversationRoom(conversationId);

        socket.to(room).emit("typing:update", {
          conversationId,
          userId,
          userName: socket.user.name,
          isTyping: false,
        });
      } catch (error) {
        console.error(
          "[Socket] Typing stop error:",
          error.message
        );
      }
    });

    /**
     * Disconnect.
     */
    socket.on("disconnect", (reason) => {
      const becameOffline = removeUserConnection(
        userId,
        socket.id
      );

      if (becameOffline) {
        emitPresence(io, userId, "offline");
      }

      console.log(
        `[Socket] Disconnected: ${socket.user.email} (${reason})`
      );
    });
  });

  return io;
};

module.exports = {
  initializeChatSocket,
  onlineUsers,
  isUserOnline,
  getConversationRoom,
  getUserRoom,
};