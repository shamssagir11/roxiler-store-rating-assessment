const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { errorResponse } = require('./utils/responseHandler');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all REST endpoints under /api
app.use('/api', apiRoutes);

// Handle unknown routes
app.use((req, res) => {
  return errorResponse(res, 404, `Route ${req.method} ${req.originalUrl} not found.`);
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
