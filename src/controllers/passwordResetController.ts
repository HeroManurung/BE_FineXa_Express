import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import PasswordResetModel from '../models/PasswordResetModel';
import db from '../config/database'; 

// 1. FUNGSI MEMINTA OTP KE EMAIL
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ success: false, message: "Email wajib diisi!" });
            return;
        }

        const checkUserSql = "SELECT * FROM users WHERE email = ?";
        const [users]: any = await db.query(checkUserSql, [email]);

        if (users.length === 0) {
            res.status(404).json({ success: false, message: "Email tidak terdaftar!" });
            return;
        }

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        await PasswordResetModel.saveToken(email, token);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'hermanvro6@gmail.com', 
                pass: 'xpwuszupdxgfrjse' 
            }
        });

        const mailOptions = {
            from: '"FineXa Security" <hermanvro6@gmail.com>',
            to: email,
            subject: 'Kode Pemulihan Password Akun FineXa',
            text: `Halo! Kode OTP pemulihan password kamu adalah: ${token}\n\nJangan berikan kode ini kepada siapa pun, termasuk tim FineXa.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Kode OTP telah berhasil dikirim ke email kamu."
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Gagal mengirim email.",
            error: error.message
        });
    }
};

// 2. FUNGSI VERIFIKASI OTP & GANTI PASSWORD
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, token, password, confirm_password } = req.body;

        if (!email || !token || !password || !confirm_password) {
            res.status(400).json({ success: false, message: "Semua kolom wajib diisi!" });
            return; 
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)){
            res.status(400).json({
                success: false,
                message: "format emmail tidak valid! pastikan menggunakan @ dan . contoh investor@mail.com"
            });
            return;
        }

        if (password !== confirm_password) {
            res.status(400).json({ success: false, message: "Password dan konfirmasi password tidak sama!" });
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^=&_>,.</?''"":;}{|]).{8,}$/;
        if (!passwordRegex.test(password)) {
            res.status(400).json({
                success: false,
                message: "Password minimal 8 karakter, harus mengandung huruf besar, huruf kecil, angka, dan simbol!"
            });
            return;
        }

        const isValidToken = await PasswordResetModel.verifyToken(email, token);
        if (!isValidToken) {
            res.status(400).json({ success: false, message: "Token salah, sudah kedaluwarsa, atau email tidak sesuai!" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const updateSql = "UPDATE users SET password = ? WHERE email = ?";
        await db.query(updateSql, [hashedPassword, email]);

        await PasswordResetModel.deleteToken(email);

        res.status(200).json({ 
            success: true, 
            message: "Password berhasil diperbarui! Silakan login menggunakan password baru." 
        });

    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan pada server.", 
            error: error.message 
        });
    }
};