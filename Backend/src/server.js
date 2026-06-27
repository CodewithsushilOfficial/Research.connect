import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// Handle uncaught exceptions globally
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Load Env variables
dotenv.config();

// Connect to Database
connectDB();

// Start Server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
