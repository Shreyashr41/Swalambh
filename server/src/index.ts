import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import patientRoutes from './routes/patient';
import chatRoutes from './routes/chat';
import analysisRoutes from './routes/analysis';
import reminderRoutes from './routes/reminder';
import reportRoutes from './routes/report';

// Import services
import { initializeReminderService } from './services/reminderService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Allow Vercel deploymentconst allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://dermavercel.vercel.app',
  'https://*.vercel.app', // Allow all Vercel preview deployments
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = new RegExp(allowed.replace('*', '.*'));
        return pattern.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DermaCare API is running' });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dermacare';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Initialize reminder service
    initializeReminderService();
    
    app.listen(PORT, () => {
      console.log(`🚀 DermaCare server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;
