import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));

// Only parse JSON for non-upload routes
app.use((req, res, next) => {
  if (req.path === '/api/documents/upload') {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Minimal health check - no database dependencies
app.get('/health', (req, res) => {
  console.log('Health check requested at', new Date().toISOString());
  res.status(200).json({ status: 'OK' });
});

// Root endpoint for basic connectivity test
app.get('/', (req, res) => {
  console.log('Root endpoint accessed at', new Date().toISOString());
  res.status(200).json({ 
    message: 'Knowledge Scout API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Railway-specific healthcheck endpoint
app.get('/api/health', (req, res) => {
  console.log('API health check requested at', new Date().toISOString());
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Import routes
import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import chatRoutes from './routes/chat';
import aiRoutes from './routes/ai';
import { initializeDemoUser } from './scripts/initDemoUser';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
// app.use('/api', aiRoutes); // Commented out to avoid route conflicts

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
console.log('Starting server...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Knowledge Scout API running on port ${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server listening on 0.0.0.0:${PORT}`);
  console.log(`✅ Server started successfully at ${new Date().toISOString()}`);
  
  // Test the health endpoint immediately
  console.log('Testing health endpoint...');
  
  // Initialize demo user (non-blocking)
  setTimeout(async () => {
    try {
      await initializeDemoUser();
      console.log(`👤 Demo credentials: admin@mail.com / admin123`);
    } catch (error) {
      console.error('Failed to initialize demo user:', error);
      // Don't exit on demo user failure
    }
  }, 1000);
});

// Handle server errors
server.on('error', (error: any) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
