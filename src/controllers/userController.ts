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

// FUNGSI UPDATE (Mengubah nama atau role user)
export const updateUser = async (req: Request, res: Response): Promise<any> => {
    // Tambahkan 'as string' agar terhindar dari error tipe data TypeScript
    const id = req.params.id as string; 
    const { nama_lengkap, role } = req.body; 

    try {
        const existingUser = await UserModel.getById(id);
        
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        const updatedNama = nama_lengkap || existingUser.nama_lengkap;
        const updatedRole = role || existingUser.role;

        await UserModel.update(id, updatedNama, updatedRole);

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