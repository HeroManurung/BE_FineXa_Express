import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

// Memanggil Middleware dan Routes menggunakan syntax Import
import catatLog from './middlewares/logMiddleware';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import faqRoutes from './routes/faqRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Membuka gerbang khusus untuk Next.js 
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true // Diaktifkan agar token autentikasi/cookie bisa lewat
}));

app.use(express.json());
app.use(catatLog);

app.get('/', (req: Request, res: Response) => {
    res.send('Backend Admin FineXa Berjalan dengan TypeScript!');
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/dashboard', dashboardRoutes);



app.listen(port, () => {
    console.log(`Server nyala di http://localhost:${port}`);
});
