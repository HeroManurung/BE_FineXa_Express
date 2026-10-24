import db from '../config/database';

class FaqModel {
    // Mengambil semua FAQ
    static async getAll() {
        const [rows]: any = await db.query('SELECT * FROM faqs ORDER BY created_at DESC');
        return rows;
    }

    // Mengambil satu FAQ berdasarkan ID
    static async getById(id: string) {
        const [rows]: any = await db.query('SELECT * FROM faqs WHERE id_faq = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    // Menambahkan FAQ baru
    static async create(kategori: string, pertanyaan: string, jawaban: string, status: string) {
        const [result]: any = await db.query(
            'INSERT INTO faqs (kategori, pertanyaan, jawaban, status, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [kategori, pertanyaan, jawaban, status]
        );
        return result.insertId;
    }

    // Memperbarui FAQ
    static async update(id: string, kategori: string, pertanyaan: string, jawaban: string, status: string) {
        await db.query(
            'UPDATE faqs SET kategori = ?, pertanyaan = ?, jawaban = ?, status = ? WHERE id_faq = ?',
            [kategori, pertanyaan, jawaban, status, id]
        );
    }

    // Menghapus FAQ
    static async delete(id: string) {
        await db.query('DELETE FROM faqs WHERE id_faq = ?', [id]);
    }

    // Mencatat log pembacaan FAQ
    static async recordView(faqId: number, userId: number) {
        await db.query(
            'INSERT INTO faq_logs (faq_id, user_id, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [faqId, userId]
        );
    }
}

export default FaqModel;