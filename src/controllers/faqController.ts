import { Request, Response } from 'express';
import FaqModel from '../models/FaqModel';

// 1. READ ALL 
export const getAllFaqs = async (req: Request, res: Response): Promise<any> => {
    try {
        const faqs = await FaqModel.getAll();
        return res.status(200).json({ success: true, data: faqs });
    } catch (error) {
        console.error("Error get FAQ:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};


// 2. CREATE 
export const createFaq = async (req: Request, res: Response): Promise<any> => {
    let { kategori, pertanyaan, jawaban, status } = req.body;
    
    // 1. Validasi Keberadaan Data (Kosong atau undefined)
    if (!kategori || !pertanyaan || !jawaban) {
        return res.status(400).json({ success: false, message: "Kategori, Pertanyaan, dan Jawaban wajib diisi!" });
    }

    // 2. Bersihkan spasi kosong di awal/akhir teks
    kategori = kategori.trim();
    pertanyaan = pertanyaan.trim();
    jawaban = jawaban.trim();

    // 3. Validasi Teks Kosong (Cegah user yang hanya mengetik spasi "   ")
    if (kategori === "" || pertanyaan === "" || jawaban === "") {
        return res.status(400).json({ success: false, message: "Input tidak boleh hanya berisi spasi!" });
    }

    // 4. Validasi Panjang Karakter Minimum
    if (pertanyaan.length < 10) {
        return res.status(400).json({ success: false, message: "Pertanyaan terlalu singkat (minimal 10 karakter)." });
    }
    if (jawaban.length < 10) {
        return res.status(400).json({ success: false, message: "Jawaban terlalu singkat (minimal 10 karakter)." });
    }

    try {
        // 5. Konversi Checkbox Frontend menjadi Enum Database
        // Jika frontend mengirim checkbox true (dicentang) -> 'published', jika false -> 'draft'
        const finalStatus = (status === true || status === 'true' || status === 'published') ? 'published' : 'draft';
        
        await FaqModel.create(kategori, pertanyaan, jawaban, finalStatus);
        
        return res.status(201).json({ success: true, message: "FAQ berhasil ditambahkan!" });
    } catch (error) {
        console.error("Error create FAQ:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server saat menyimpan FAQ." });
    }
};

// 3. UPDATE 
export const updateFaq = async (req: Request, res: Response): Promise<any> => {
    // PERBAIKAN: Gunakan 'as string' agar TypeScript tidak bingung
    const id = req.params.id as string; 
    const { kategori, pertanyaan, jawaban, status } = req.body;

    try {
        const existingFaq = await FaqModel.getById(id);
        if (!existingFaq) {
            return res.status(404).json({ success: false, message: "FAQ tidak ditemukan!" });
        }

        const updateKategori = kategori || existingFaq.kategori;
        const updatePertanyaan = pertanyaan || existingFaq.pertanyaan;
        const updateJawaban = jawaban || existingFaq.jawaban;
        const updateStatus = status || existingFaq.status;

        await FaqModel.update(id, updateKategori, updatePertanyaan, updateJawaban, updateStatus);
        
        return res.status(200).json({ success: true, message: "FAQ berhasil diperbarui!" });
    } catch (error) {
        console.error("Error update FAQ:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};

// 4. DELETE 
export const deleteFaq = async (req: Request, res: Response): Promise<any> => {
    // PERBAIKAN: Gunakan 'as string' 
    const id = req.params.id as string; 

    try {
        const existingFaq = await FaqModel.getById(id);
        if (!existingFaq) {
            return res.status(404).json({ success: false, message: "FAQ tidak ditemukan!" });
        }

        await FaqModel.delete(id);
        return res.status(200).json({ success: true, message: "FAQ berhasil dihapus!" });
    } catch (error) {
        console.error("Error delete FAQ:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};

// 5. RECORD VIEW (Log Analytics)
export const recordFaqView = async (req: Request, res: Response): Promise<any> => {
    try {
        const { faq_id, user_id } = req.body;

        if (!faq_id || !user_id) {
            return res.status(400).json({ success: false, message: "faq_id dan user_id wajib diisi!" });
        }

        await FaqModel.recordView(faq_id, user_id);
        return res.status(201).json({ success: true, message: "Aktivitas baca FAQ berhasil dicatat!" });
    } catch (error) {
        console.error("Error mencatat FAQ log:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};