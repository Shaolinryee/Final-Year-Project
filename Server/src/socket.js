const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error: Invalid token"));
      socket.user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        name: decoded.name
      };
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // Join user-specific room for private notifications
    socket.join(`user_${socket.user.id}`);

    // Join project-specific rooms for collaborative updates
    socket.on("join_project", (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`User ${socket.user.name} joined project room: ${projectId}`);
    });

    socket.on("leave_project", (projectId) => {
      socket.leave(`project_${projectId}`);
      console.log(`User ${socket.user.name} left project room: ${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Helper to send notification via socket
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Helper to broadcast to project members
const emitToProject = (projectId, event, data, excludeUserId = null) => {
  if (io) {
    let emitter = io.to(`project_${projectId}`);
    // If we want to exclude the sender (e.g. for "user is typing" or manual movements)
    // Note: To exclude sender via room broadcast we might need to handle it in client or use socket.broadcast.to
    emitter.emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToUser, emitToProject };
