const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database + ensure geospatial indexes exist
(async () => {
  await connectDB();

  try {
    // Ensure $geoNear can find the 2dsphere index on `locationPoint`
    const User = require('./models/User');
    await User.syncIndexes();
    console.log('[Mongo] User geospatial indexes synced');
  } catch (e) {
    console.warn('[Mongo] Failed to sync indexes. $geoNear may require manual index creation:', e.message);
  }
})();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
    origin: function(origin, callback) {
      // Allow all origins
      return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Passport config
require('./config/passport');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/fasal-planner', require('./routes/fasalPlannerRoutes'));
app.use('/api/laborers', require('./routes/laborerRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));

app.get('/api/status', (req, res) => {
  res.json({ message: 'API is running' });
});

// ────────── Socket.IO Real-time Chat ──────────
const onlineUsers = {}; // { communityName: Set of socket ids }

io.on('connection', (socket) => {
  console.log(`[Socket.IO] User connected: ${socket.id}`);

  // Join a community room
  socket.on('join-community', ({ community, user }) => {
    socket.join(community);
    socket.communityRoom = community;
    socket.userData = user;

    if (!onlineUsers[community]) onlineUsers[community] = new Set();
    onlineUsers[community].add(socket.id);

    // Broadcast updated online count
    io.to(community).emit('online-count', {
      community,
      count: onlineUsers[community].size,
    });

    console.log(`[Socket.IO] ${user?.name || 'User'} joined ${community} (${onlineUsers[community].size} online)`);
  });

  // Handle new message
  socket.on('new-message', (message) => {
    if (socket.communityRoom) {
      // Broadcast to everyone in that community (including sender for confirmation)
      io.to(socket.communityRoom).emit('message', message);
    }
  });

  // Handle typing indicator
  socket.on('typing', ({ community, user }) => {
    socket.to(community).emit('user-typing', { user });
  });

  socket.on('stop-typing', ({ community }) => {
    socket.to(community).emit('user-stop-typing');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const room = socket.communityRoom;
    if (room && onlineUsers[room]) {
      onlineUsers[room].delete(socket.id);
      io.to(room).emit('online-count', {
        community: room,
        count: onlineUsers[room].size,
      });
    }
    console.log(`[Socket.IO] User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
