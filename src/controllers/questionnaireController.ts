import { Request, Response } from 'express';
import QuestionnaireModel from '../models/QuestionnaireModel'; 

export const submitQuestionnaire = async (req: Request, res: Response): Promise<any> => {
    try {
        // Ambil ID User dari token JWT (Pastikan rute ini dipasang middleware verifyToken nantinya)
        const userId = (req as any).user.id_user; 
        const { answers } = req.body; 

        // 1. Validasi Input: Pastikan bentuknya array dan isinya pas 5
        if (!answers || !Array.isArray(answers) || answers.length !== 5) {
            return res.status(400).json({ 
                success: false, 
                message: "Kuesioner harus berisi tepat 5 jawaban!" 
            });
        }

        // 2. KOKI BEKERJA: Simpan 5 jawaban mentah ke MySQL
        await QuestionnaireModel.saveRawAnswers(userId, answers);

        // 3. TELEPON FLASK (Machine Learning) -> Tebak Profil Risiko
        const mlResponse = await fetch(`${process.env.FLASK_API_URL}/predict-risk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers })
        });
        const mlData = await mlResponse.json();
        const profilRisiko = mlData.risk_profile; // Contoh: "Moderat"

        // 4. TELEPON FLASK (LLM / RAG) -> Minta Saran Investasi format JSON
        const ragResponse = await fetch(`${process.env.FLASK_API_URL}/generate-advice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ risk_profile: profilRisiko })
        });
        const ragData = await ragResponse.json();

        // 5. KOKI BEKERJA LAGI: Update baris tadi dengan hasil ML & LLM (diubah jadi string JSON)
        await QuestionnaireModel.saveProfileResult(userId, profilRisiko, JSON.stringify(ragData));

        // 6. ANTAR KE MEJA TAMU (Aplikasi Flutter)
        return res.status(200).json({
            success: true,
            message: "Analisis investasi berhasil diselesaikan.",
            data: {
                profil_risiko: profilRisiko,
                expected_return: ragData.expected_return,
                horizon_waktu: ragData.horizon_waktu,
                alokasi_aset: ragData.alokasi_aset // Ini array persentase bar untuk UI
            }
        });

    } catch (error) {
        console.error("Error submit kuesioner:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan internal server saat memproses analisis." 
        });
    }
};