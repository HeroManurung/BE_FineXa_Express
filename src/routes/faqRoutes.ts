import { Router } from 'express';
import { getAllFaqs, createFaq, updateFaq, deleteFaq, recordFaqView } from '../controllers/faqController';
import { cekLogin, cekAdmin } from '../middlewares/authMiddleware'; // Import 2 satpam

const router = Router();

// READ: Cukup login saja (Admin & Investor boleh baca)
router.get('/', cekLogin, getAllFaqs);

// CREATE, UPDATE, DELETE: Wajib Admin
router.post('/', cekAdmin, createFaq);
router.put('/:id', cekAdmin, updateFaq);
router.delete('/:id', cekAdmin, deleteFaq);

// Route faq_logs
router.post('/log', recordFaqView);

export default router;