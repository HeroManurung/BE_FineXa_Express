import { Router } from 'express';
import { getAllUsers, updateUser, deleteUser} from '../controllers/userController'; 
import {cekAdmin} from '../middlewares/authMiddleware';

const router = Router();

// Rute READ (Sudah ada)
router.get('/', cekAdmin, getAllUsers);
// Rute UPDATE (Menambahkan /:id untuk menangkap ID user target)
router.put('/:id', cekAdmin, updateUser);
// Rute DELETE 
router.delete('/:id', cekAdmin, deleteUser);

// Ini yang dicari oleh index.ts dari tadi!
export default router;