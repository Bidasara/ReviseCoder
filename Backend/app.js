import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import {ApiError} from './utils/apiError.js';

dotenv.config(); 
const app = express();

// Setting up CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json(
  {limit: '16kb'}
));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Security middleware
app.use(helmet());

// // Importing routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js';
import dataRoutes from './routes/data.routes.js';

// // API routes 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/data', dataRoutes);

import animationRoutes from './routes/animation.routes.js';
app.use('/api/v1/animation', animationRoutes);



app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }
  
  // For unhandled errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

export {app};
