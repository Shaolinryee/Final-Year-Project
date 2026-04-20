require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database');
const corsOptions = require('./config/corsOptions');
const errorHandler = require('./middleware/errorHandler');

const http = require('http');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to PostgreSQL
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/invitations', require('./routes/invitationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin', require('./routes/impersonationRoutes'));
app.use('/api/temp', require('./routes/tempRoutes'));
app.use('/api/simple', require('./routes/simpleAdminRoutes'));

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler Middleware (should be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Start notification scheduler
  const notificationScheduler = require('./schedulers/notificationScheduler');
  notificationScheduler.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    notificationScheduler.stop();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    notificationScheduler.stop();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

module.exports = app;
