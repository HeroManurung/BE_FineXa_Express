import { Router } from 'express';
import { getAnalyticsData } from '../controllers/analyticsController';
import { cekAdmin } from '../middlewares/authMiddleware'; 

const router = Router();

// Rute ini dilindungi oleh cekAdmin, hanya admin yang bisa melihat data dashboard!
router.get('/', cekAdmin, getAnalyticsData);

export default router;