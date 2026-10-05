require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL database via Prisma.');

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  Roxiler Store Rating API Server Running!     `);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port:        ${PORT}`);
      console.log(`  API Base:    http://localhost:${PORT}/api    `);
      console.log(`  Health:      http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        await prisma.$disconnect();
        console.log('Database connection disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
