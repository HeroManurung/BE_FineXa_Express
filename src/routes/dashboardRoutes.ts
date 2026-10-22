import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { cekAdmin } from '../middlewares/authMiddleware'; 

const router = Router();

// Rute ini dilindungi oleh cekAdmin, hanya admin yang bisa melihat data dashboard!
router.get('/', cekAdmin, getDashboardData);

export default router;