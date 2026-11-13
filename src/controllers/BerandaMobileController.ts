import { Request, Response } from 'express';
import { getLatestProfile } from '../models/BerandaMobileModel';

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        // 1. Tangkap userId dari parameter URL
        const userId = req.params.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID tidak valid" });
        }

        // 2. Panggil fungsi dari Model
        const rows: any = await getLatestProfile(userId as string);
        // 3. Cek hasil dan kirim respons ke Flutter
        if (rows && rows.length > 0) {
            // Jika data ditemukan, kirim baris pertama (data terbaru)
            return res.status(200).json(rows[0]);
        } else {
            // Jika user belum pernah isi kuesioner, kembalikan null
            return res.status(200).json({ profil_risiko: null });
        }

    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
};