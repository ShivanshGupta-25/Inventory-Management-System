const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(
        /^Bearer\s+/i,
        ""
      );

    if (!token) {
      return next(
        new Error("Authentication token required")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId =
      decoded.userId ||
      decoded.id ||
      decoded._id ||
      decoded.sub;

    if (!userId) {
      return next(
        new Error("Invalid authentication payload")
      );
    }

    const user = await User.findById(userId)
      .select("_id name email role isActive")
      .lean();

    if (!user) {
      return next(new Error("User not found"));
    }

    if (user.isActive === false) {
      return next(
        new Error("User account is inactive")
      );
    }

    if (!["admin", "manager", "staff"].includes(user.role)) {
      return next(new Error("Unauthorized chat role"));
    }

    socket.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error(
      "[Socket] Authentication failed:",
      error.message
    );

    next(
      new Error("Invalid or expired authentication token")
    );
  }
};

module.exports = socketAuth;
