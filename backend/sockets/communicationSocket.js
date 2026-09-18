const socketAuth = require("./socketAuth");

const ConversationParticipant =
  require("../models/ConversationParticipant");

/* =====================================================
   INITIALIZE COMMUNICATION SOCKET
===================================================== */

const initializeCommunicationSocket = (
  io
) => {
  /*
   * Authenticate every socket connection.
   */
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    try {
      /*
       * Personal user room.
       *
       * Used for:
       * - new conversations
       * - participant changes
       * - future notifications
       */
      socket.join(
        `user:${socket.userId}`
      );

      /*
       * Automatically join every conversation
       * this user belongs to.
       */
      const participants =
        await ConversationParticipant.find({
          userId: socket.userId,
        })
          .select("conversationId")
          .lean();

      for (const participant of participants) {
        socket.join(
          `conversation:${participant.conversationId}`
        );
      }

      console.log(
        `Communication socket connected: ${socket.userId}`
      );

      /*
       * Explicitly join a conversation.
       *
       * The server verifies membership first.
       */
      socket.on(
        "conversation:join",
        async (conversationId, callback) => {
          try {
            const participant =
              await ConversationParticipant.findOne(
                {
                  conversationId,
                  userId: socket.userId,
                }
              );

            if (!participant) {
              throw new Error(
                "You are not a participant in this conversation"
              );
            }

            socket.join(
              `conversation:${conversationId}`
            );

            if (
              typeof callback === "function"
            ) {
              callback({
                success: true,
              });
            }
          } catch (error) {
            if (
              typeof callback === "function"
            ) {
              callback({
                success: false,
                message: error.message,
              });
            }
          }
        }
      );

      /*
       * Leave conversation room.
       */
      socket.on(
        "conversation:leave",
        (
          conversationId,
          callback
        ) => {
          socket.leave(
            `conversation:${conversationId}`
          );

          if (
            typeof callback === "function"
          ) {
            callback({
              success: true,
            });
          }
        }
      );

      /*
       * Typing start.
       */
      socket.on(
        "typing:start",
        async (conversationId) => {
          try {
            const participant =
              await ConversationParticipant.findOne(
                {
                  conversationId,
                  userId: socket.userId,
                }
              );

            if (!participant) {
              return;
            }

            socket
              .to(
                `conversation:${conversationId}`
              )
              .emit("typing:start", {
                conversationId,
                userId:
                  socket.userId,
              });
          } catch (error) {
            console.error(
              "Typing start error:",
              error
            );
          }
        }
      );

      /*
       * Typing stop.
       */
      socket.on(
        "typing:stop",
        async (conversationId) => {
          try {
            const participant =
              await ConversationParticipant.findOne(
                {
                  conversationId,
                  userId: socket.userId,
                }
              );

            if (!participant) {
              return;
            }

            socket
              .to(
                `conversation:${conversationId}`
              )
              .emit("typing:stop", {
                conversationId,
                userId:
                  socket.userId,
              });
          } catch (error) {
            console.error(
              "Typing stop error:",
              error
            );
          }
        }
      );

      socket.on(
        "disconnect",
        (reason) => {
          console.log(
            `Communication socket disconnected: ${socket.userId}`,
            reason
          );
        }
      );
    } catch (error) {
      console.error(
        "Communication socket initialization error:",
        error
      );

      socket.disconnect(true);
    }
  });
};

module.exports = {
  initializeCommunicationSocket,
};