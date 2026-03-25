const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
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

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Initialize Passport config
require('./config/passport');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/fasal-planner', require('./routes/fasalPlannerRoutes'));

app.get('/api/status', (req, res) => {
  res.json({ message: 'API is running' });
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

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
