import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthModel from '../models/AuthModel';

// FUNGSI REGISTER (Dengan Enkripsi Password)
export const registerUser = async (req: Request, res: Response): Promise<any> => {
    const { nama_lengkap, email, password, role } = req.body;
    
    if (!nama_lengkap || !email || !password) {
        return res.status(400).json({ success: false, message: "Nama lengkap, email, dan password wajib diisi!" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^=&_>,.</?''"":;}{|]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password minimal 8 karakter, harus mengandung huruf besar, huruf kecil, angka, dan simbol!"
        });
    }

    try {
        // 1. Cek duplikasi email via Model
        const existingUser = await AuthModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email sudah terdaftar, gunakan email lain!" });
        }

        // 2. ENKRIPSI PASSWORD (Salt factor = 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Simpan user ke database via Model
        const roleUser = role || 'investor';
        const newUserId = await AuthModel.createUser(nama_lengkap, email, hashedPassword, roleUser);

        return res.status(201).json({ 
            success: true, 
            message: "Registrasi akun FineXa berhasil!", 
            data: { id_user: newUserId, nama_lengkap, email, role: roleUser }
        });

    } catch (error) {
        console.error("Error saat register:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server/database." });
    }
};

// FUNGSI LOGIN (Pencocokan Hashed Password)
export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { email, password, platform } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email dan password wajib diisi!" });
    }

    try {
        // Cari user via Model
        const user = await AuthModel.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: "Email tidak terdaftar!" });
        }

        // PENCOCOKAN PASSWORD
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Password salah!" });
        }

        if (platform === 'web' && user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: "Halaman ini khusus Admin! Silahkan login melalui aplikasi." });
        }

        if (platform === 'mobile' && user.role !== 'investor') {
            return res.status(403).json({ status: 'error', message: "Akses ditolak. Akun admin tidak dapat digunakan di aplikasi investor." });
        }

        // Catat log aktivitas via Model
        await AuthModel.updateLastLogin(user.id_user);
        await AuthModel.createLoginLog(user.id_user);
        
        const tokenSecret = process.env.JWT_SECRET || 'rahasia_negara_finexa_2026';
        const token = jwt.sign(
            { id_user: user.id_user, role: user.role },
            tokenSecret,
            { expiresIn: '1d' } 
        );

        return res.status(200).json({
            success: true,
            message: "Login Berhasil! Selamat datang di FineXa.",
            data: { 
                id_user: user.id_user, 
                nama: user.nama_lengkap, 
                email: user.email, 
                role: user.role,
                token: token
            }
        });
    } catch (error) {
        console.error("Error saat login:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan pada database." });
    }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) {
            return res.status(400).json({ status: 'error', message: 'Token tidak ditemukan. Anda mungkin sudah logout.' });
        }

        // Eksekusi penghapusan token via Model
        const affectedRows = await AuthModel.deleteToken(token);

        if (affectedRows === 0) {
            console.warn("Token tidak ditemukan di database saat mencoba logout.");
        }

        return res.status(200).json({ status: 'success', message: 'Berhasil logout, akses token telah dihancurkan permanen.' });

    } catch (error) {
        console.error("Error Logout:", error);
        return res.status(500).json({ status: 'error', message: "Terjadi kesalahan internal saat memproses logout." });
    }
};