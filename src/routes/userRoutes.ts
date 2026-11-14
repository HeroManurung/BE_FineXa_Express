import { Router } from 'express';
import { getAllUsers, updateUser, deleteUser, getUserById} from '../controllers/userController'; 
import {cekAdmin} from '../middlewares/authMiddleware';


const router = Router();

// Rute READ (Sudah ada)
router.get('/', cekAdmin, getAllUsers);
// Rute UPDATE (Menambahkan /:id untuk menangkap ID user target)
router.put('/:id', updateUser);
// Rute DELETE 
router.delete('/:id', cekAdmin, deleteUser);
// rute profil mobile
router.get('/:id', getUserById);


export default router;