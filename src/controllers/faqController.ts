import { Request, Response } from 'express';
import db from '../config/database';

// 1. READ ALL (Bisa diakses publik / user yang sudah login)
export const getAllFaqs = async (req: Request, res: Response): Promise<any> => {
    try {
        const [faqs]: any = await db.query('SELECT * FROM faqs ORDER BY created_at DESC');
        return res.status(200).json({ success: true, data: faqs });
    } catch (error) {
        console.error("Error get FAQ:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};

// 2. CREATE (Hanya Admin) - Ditambah kolom kategori dan status
export const createFaq = async (req: Request, res: Response): Promise<any> => {
    const { kategori, pertanyaan, jawaban, status } = req.body;
    
    // Sesuaikan validasi dengan kolom yang wajib diisi
    if (!kategori || !pertanyaan || !jawaban) {
        return res.status(400).json({ success: false, message: "Kategori, Pertanyaan, dan Jawaban wajib diisi!" });
    }

    try {
        // Status default adalah 'published' jika tidak dikirim dari body
        const finalStatus = status || 'published';
        
        await db.query(
            'INSERT INTO faqs (kategori, pertanyaan, jawaban, status, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [kategori, pertanyaan, jawaban, finalStatus]
        );
        return res.status(201).json({ success: true, message: "FAQ berhasil ditambahkan!" });
    } catch (error) {
        console.error("Error create FAQ:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};

// 3. UPDATE (Hanya Admin) - Ditambah kolom kategori dan status
export const updateFaq = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { kategori, pertanyaan, jawaban, status } = req.body;

    try {
        const [existingFaq]: any = await db.query('SELECT * FROM faqs WHERE id_faq = ?', [id]);
        if (existingFaq.length === 0) {
            return res.status(404).json({ success: false, message: "FAQ tidak ditemukan!" });
        }

        const updateKategori = kategori || existingFaq[0].kategori;
        const updatePertanyaan = pertanyaan || existingFaq[0].pertanyaan;
        const updateJawaban = jawaban || existingFaq[0].jawaban;
        const updateStatus = status || existingFaq[0].status;

        await db.query(
            'UPDATE faqs SET kategori = ?, pertanyaan = ?, jawaban = ?, status = ? WHERE id_faq = ?',
            [updateKategori, updatePertanyaan, updateJawaban, updateStatus, id]
        );
        return res.status(200).json({ success: true, message: "FAQ berhasil diperbarui!" });
    } catch (error) {
        console.error("Error update FAQ:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};

// 4. DELETE (Hanya Admin)
export const deleteFaq = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
        const [existingFaq]: any = await db.query('SELECT * FROM faqs WHERE id_faq = ?', [id]);
        if (existingFaq.length === 0) {
            return res.status(404).json({ success: false, message: "FAQ tidak ditemukan!" });
        }

        await db.query('DELETE FROM faqs WHERE id_faq = ?', [id]);
        return res.status(200).json({ success: true, message: "FAQ berhasil dihapus!" });
    } catch (error) {
        console.error("Error delete FAQ:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};