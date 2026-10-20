import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Supaya TypeScript tidak mengeluh saat kita menitipkan data 'user' ke dalam 'req'
export interface AuthRequest extends Request {
    user?: any;
}

export const cekAdmin = (req: AuthRequest, res: Response, next: NextFunction): any => {
    try {
        // 1. Tangkap token dari header otorisasi (Postman)
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: "Akses ditolak. Token tidak ditemukan. Silakan login kembali!" 
            });
        }

        // 2. Pisahkan tulisan "Bearer " dari token aslinya
        const token = authHeader.split(' ')[1];
        
        // 3. Verifikasi keaslian token
        const tokenSecret = process.env.JWT_SECRET || 'rahasia_negara_finexa_2026';
        const decodedToken = jwt.verify(token, tokenSecret);

        // 4. Titipkan data user (hasil bongkaran token) ke dalam request
        req.user = decodedToken;

        // 5. Khusus untuk middleware ini, pastikan yang masuk hanya role Admin!
        if (req.user.role !== 'admin') {
             return res.status(403).json({ 
                success: false, 
                message: "Akses ditolak. Anda bukan Admin!" 
            });
        }

        // Semua aman, silakan lewat!
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: "Token tidak valid atau sudah kadaluarsa!" 
        });
    }
};


export const cekLogin = (req: AuthRequest, res: Response, next: NextFunction): any => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "Silakan login terlebih dahulu!" });
        }

        const token = authHeader.split(' ')[1];
        const tokenSecret = process.env.JWT_SECRET || 'rahasia_negara_finexa_2026';
        req.user = jwt.verify(token, tokenSecret);
        
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token tidak valid/kadaluarsa!" });
    }
};
