import { Router } from 'express';
import { getUserProfile } from '../controllers/BerandaMobileController';

const router = Router();

router.get('/user-profile/:userId', getUserProfile);

export default router; // Export router agar bisa dipakai di file utama