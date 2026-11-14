import { Request, Response } from 'express';
import UserModel from '../models/UserModel';

// FUNGSI MENGAMBIL SEMUA USER (Khusus Admin)
export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await UserModel.getAll();

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

// FUNGSI UPDATE (Mengubah profil pengguna)
export const updateUser = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string; 
    const { nama_lengkap, email, no_telepon, lokasi, tanggal_lahir } = req.body; 

    // 1. Validasi Nama Lengkap
    if (!nama_lengkap || nama_lengkap.trim() === "") {
        return res.status(400).json({ success: false, message: "Nama lengkap tidak boleh kosong!" });
    }

    // 2. Validasi Email (harus ada @ dan .com)
    if (!email || !email.includes('@') || !email.endsWith('.com')) {
        return res.status(400).json({ success: false, message: "Email harus mengandung '@' dan berakhiran '.com'!" });
    }

    // 3. Validasi Nomor Telepon (hanya angka)
    const phoneRegex = /^[0-9]+$/;
    if (!no_telepon || !phoneRegex.test(no_telepon)) {
        return res.status(400).json({ success: false, message: "Nomor telepon harus berupa angka!" });
    }

    // 4. Validasi Lokasi (ide: minimal 3 karakter)
    if (!lokasi || lokasi.trim().length < 3) {
        return res.status(400).json({ success: false, message: "Lokasi minimal diisi 3 karakter!" });
    }

    // 5. Validasi Tanggal Lahir (ide: format YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!tanggal_lahir || !dateRegex.test(tanggal_lahir)) {
        return res.status(400).json({ success: false, message: "Format tanggal lahir harus YYYY-MM-DD (contoh: 2004-05-20)!" });
    }

    try {
        const existingUser = await UserModel.getById(id);
        
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        // Lanjut proses update ke database...
        await UserModel.update(id, nama_lengkap, email, no_telepon, lokasi, tanggal_lahir);

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
    // Tambahkan 'as string'
    const id = req.params.id as string; 

    try {
        const existingUser = await UserModel.getById(id);
        
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        await UserModel.delete(id);

        return res.status(200).json({
            success: true,
            message: "Pengguna berhasil dihapus permanen dari sistem!"
        });
    } catch (error) {
        console.error("Error saat delete user:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan pada database." });
    }
};

// FUNGSI MENGAMBIL PROFIL SATU USER BERDASARKAN ID
export const getUserById = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;

    try {
        const user = await UserModel.getById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Data profil berhasil diambil",
            data: user
        });
    } catch (error) {
        console.error("Error get user by id:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server."
        });
    }
};