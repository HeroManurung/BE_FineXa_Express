import db from '../config/database'; // Sesuaikan jika path koneksi database-mu berbeda

class QuestionnaireModel {
    // 1. Menyimpan 5 jawaban mentah pengguna ke database
    static async saveRawAnswers(userId: number, answers: string[]): Promise<any> {
    const query = `
        INSERT INTO financial_profiles 
        (id_user, jawaban_1, jawaban_2, jawaban_3, jawaban_4, jawaban_5) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        jawaban_1 = VALUES(jawaban_1),
        jawaban_2 = VALUES(jawaban_2),
        jawaban_3 = VALUES(jawaban_3),
        jawaban_4 = VALUES(jawaban_4),
        jawaban_5 = VALUES(jawaban_5)
    `;
    
    const [result] = await db.execute(query, [
        userId, 
        answers[0], answers[1], answers[2], answers[3], answers[4]
    ]);
    
    return result;
}

    // 2. Memperbarui baris data tadi dengan hasil analisis ML dan LLM
    static async saveProfileResult(id_user: number, profil_risiko: string, saran_investasi: string): Promise<any> {
        // Kita gunakan UPDATE berdasarkan id_user dan diurutkan dari yang terbaru (LIMIT 1)
        // Ini memastikan yang di-update adalah kuesioner yang baru saja diisi sepersekian detik yang lalu
        const query = `
            UPDATE financial_profiles 
            SET profil_risiko = ?, saran_investasi = ? 
            WHERE id_user = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        const [result] = await db.query(query, [profil_risiko, saran_investasi, id_user]);
        return result;
    }
}

export default QuestionnaireModel;