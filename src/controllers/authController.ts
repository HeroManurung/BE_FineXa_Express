import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database'; 
import jwt from 'jsonwebtoken';

// FUNGSI REGISTER (Dengan Enkripsi Password)
export const registerUser = async (req: Request, res: Response): Promise<any> => {
    const { nama_lengkap, email, password, role } = req.body;
    
    if (!nama_lengkap || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Nama lengkap, email, dan password wajib diisi!" 
        });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^=&_>,.</?''"":;}{|]).{8,}$/;
    
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password minimal 8 karakter, harus mengandung huruf besar, huruf kecil, angka, dan simbol!"
        });
    }

    try {
        // 1. Cek duplikasi email
        const [existingUser]: any = await db.query('SELECT id_user FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Email sudah terdaftar, gunakan email lain!" 
            });
        }

        // 2. ENKRIPSI PASSWORD (Salt factor = 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Simpan password yang SUDAH dienkripsi ke database
        const roleUser = role || 'investor';
        const [result]: any = await db.query(
            'INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, ?)',
            [nama_lengkap, email, hashedPassword, roleUser]
        );

        return res.status(201).json({ 
            success: true, 
            message: "Registrasi akun FineXa berhasil!", 
            data: {
                id_user: result.insertId,
                nama_lengkap,
                email,
                role: roleUser
            }
        });

    } catch (error) {
        console.error("Error saat register:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan pada server/database." 
        });
    }
};

// FUNGSI LOGIN (Pencocokan Hashed Password)
export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email dan password wajib diisi!" });
    }

    try {
        const [rows]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "Email tidak terdaftar!" });
        }

        const user = rows[0]; 

        // PENCOCOKAN PASSWORD: Membandingkan password mentah dari req.body dengan hash di DB
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Password salah!" });
        }

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