import { Router } from 'express';
import { getAssets } from '../controllers/assetController';

const router = Router();

// Endpoint yang terbentuk: GET /api/assets
router.get('/', getAssets);

export default router;