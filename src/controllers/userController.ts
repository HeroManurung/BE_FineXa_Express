import { Request, Response } from 'express';
import db from '../config/database';

// FUNGSI MENGAMBIL SEMUA USER (Khusus Admin)
export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        // Kita ambil data user, TAPI kolom password tidak diikutkan agar aman!
        const [users]: any = await db.query(
            'SELECT id_user, nama_lengkap, email, role, last_login_at, created_at, updated_at FROM users'
        );

        return res.status(200).json({
            success: true,
            message: "Data seluruh pengguna berhasil diambil",
            data: users
        });
    } catch (error) {
        console.error("Error get users:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan pada server." 
        });
    }
};


// FUNGSI UPDATE (Mengubah nama atau role user)
export const updateUser = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params; // Menangkap ID dari URL
    const { nama_lengkap, role } = req.body; // Menangkap data baru dari body Postman

    try {
        // 1. Pastikan user yang mau diupdate itu ada di database
        const [existingUser]: any = await db.query('SELECT * FROM users WHERE id_user = ?', [id]);
        
        if (existingUser.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        // 2. Jika ada field yang kosong, gunakan data lama agar tidak tertimpa NULL
        const updatedNama = nama_lengkap || existingUser[0].nama_lengkap;
        const updatedRole = role || existingUser[0].role;

        // 3. Eksekusi query UPDATE
        await db.query(
            'UPDATE users SET nama_lengkap = ?, role = ? WHERE id_user = ?',
            [updatedNama, updatedRole, id]
        );

        return res.status(200).json({
            success: true,
            message: "Data pengguna berhasil diperbarui!"
        });
    } catch (error) {
        console.error("Error saat update user:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan pada database." });
    }
};

// FUNGSI DELETE (Menghapus user dari sistem)
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
        // 1. Pastikan user yang mau dihapus itu ada
        const [existingUser]: any = await db.query('SELECT * FROM users WHERE id_user = ?', [id]);
        
        if (existingUser.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        // 2. Eksekusi query DELETE
        await db.query('DELETE FROM users WHERE id_user = ?', [id]);

        return res.status(200).json({
            success: true,
            message: "Pengguna berhasil dihapus permanen dari sistem!"
        });
    } catch (error) {
        console.error("Error saat delete user:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan pada database." });
    }
};