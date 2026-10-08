const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const donorRoutes = require('./routes/donor.routes');
const donationRoutes = require('./routes/donation.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const requestRoutes = require('./routes/request.routes');
const issueRoutes = require('./routes/issue.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { getAllBloodGroups } = require('./controllers/dashboard.controller');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Blood Bank API is healthy and operational',
    timestamp: new Date().toISOString()
  });
});

// Helper route for blood group list
app.get('/api/blood-groups', getAllBloodGroups);

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
