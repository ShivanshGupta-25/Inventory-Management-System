const jwt = require("jsonwebtoken");

const socketAuth = (
  socket,
  next
) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization
        ?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return next(
        new Error("Authentication required")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.userId) {
      return next(
        new Error("Invalid authentication token")
      );
    }

    socket.userId = decoded.userId;
    socket.role = decoded.role;

    next();
  } catch (error) {
    next(
      new Error(
        "Invalid or expired authentication token"
      )
    );
  }
};

module.exports = socketAuth;