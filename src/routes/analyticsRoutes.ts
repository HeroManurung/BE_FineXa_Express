import { Router } from 'express';
import { getDashboardStats } from '../controllers/analyticsController';
import { cekAdmin } from '../middlewares/authMiddleware'; 

const router = Router();

// Rute ini hanya bisa diakses oleh Admin
router.get('/', cekAdmin, getDashboardStats);

export default router;