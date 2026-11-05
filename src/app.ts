import express from 'express';
import cors from 'cors';
import analyticsRoutes from './routes/analyticsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import faqRoutes from './routes/faqRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import questionnaireRoutes from './routes/questionnaireRoutes';
import assetRoutes from './routes/assetRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Routes (Lobby Method)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mobile/questionnaire', questionnaireRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/password', passwordResetRoutes);


export default app;