import { Router } from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/passwordResetController';

const router = Router();

// Endpoint untuk meminta kode OTP ke email
router.post('/request-otp', requestPasswordReset);

// Endpoint untuk memverifikasi OTP dan mengganti password
router.post('/reset', resetPassword);

export default router;