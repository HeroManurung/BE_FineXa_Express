import { Router } from 'express';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faqController';
import { cekLogin, cekAdmin } from '../middlewares/authMiddleware'; // Import 2 satpam

const router = Router();

// READ: Cukup login saja (Admin & Investor boleh baca)
router.get('/', cekLogin, getAllFaqs);

// CREATE, UPDATE, DELETE: Wajib Admin
router.post('/', cekAdmin, createFaq);
router.put('/:id', cekAdmin, updateFaq);
router.delete('/:id', cekAdmin, deleteFaq);

export default router;