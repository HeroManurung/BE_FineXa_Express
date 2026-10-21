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
            'INSERT INTO users (nama_lengkap, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [nama_lengkap, email, hashedPassword, role || 'investor']
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
    const { email, password, platform } = req.body;
    
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

        if (platform === 'web' && user.role !== 'admin') {
            return res.status(403).json({ 
            status: 'error', 
            message: "Halaman ini khusus Admin! Silahkan login melalui aplikasi." 
            });
        }

        if (platform === 'mobile' && user.role !== 'investor') {
            return res.status(403).json({ 
            status: 'error', 
            message: "Akses ditolak. Akun admin tidak dapat digunakan di aplikasi investor." 
            });
        }

        // Catat waktu login terbaru ke database
        await db.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id_user = ?',
            [user.id_user] // Catatan: Sesuaikan 'user.id_user' dengan nama variabel user di dalam fungsi login-mu
        );
        
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
        //Tangkap token dari header yang dikirim oleh frontend (Web/Mobile)
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Memisahkan kata "Bearer " dari isi tokennya

        if (!token) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Token tidak ditemukan. Anda mungkin sudah logout.' 
            });
        }

        // Eksekusi query penghancuran token di tabel personal_access_tokens
        const [result]: any = await db.query(
            'DELETE FROM personal_access_tokens WHERE token = ?', 
            [token]
        );

        // (Opsional) Cek apakah token benar-benar ada dan terhapus
        if (result.affectedRows === 0) {
            console.warn("Token tidak ditemukan di database saat mencoba logout.");
        }

        return res.status(200).json({ 
            status: 'success', 
            message: 'Berhasil logout, akses token telah dihancurkan permanen.' 
        });

    } catch (error) {
        console.error("Error Logout:", error);
        return res.status(500).json({ 
            status: 'error', 
            message: "Terjadi kesalahan internal saat memproses logout." 
        });
    }
};