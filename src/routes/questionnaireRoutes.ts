import { Router } from 'express';
import { submitQuestionnaire } from '../controllers/questionnaireController';
import { cekLogin } from '../middlewares/authMiddleware';

const router = Router();

// Gunakan cekLogin sebagai middleware penjaga rutenya
router.post('/submit', cekLogin, submitQuestionnaire);

export default router;