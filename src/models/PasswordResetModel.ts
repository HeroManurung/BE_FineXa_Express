import db from '../config/database';

const PasswordResetModel = {
    // Fungsi 1: Menyimpan token baru saat user klik "Lupa Password"
    saveToken: async (email: string, token: string) => {
        const sql = `
            INSERT INTO password_reset_tokens (email, token, created_at) 
            VALUES (?, ?, NOW()) 
            ON DUPLICATE KEY UPDATE token = ?, created_at = NOW()
        `;
        await db.query(sql, [email, token, token]);
    },

    // Fungsi 2: Mengecek token saat user mau mereset password
    verifyToken: async (email: string, token: string) => {
        const sql = "SELECT * FROM password_reset_tokens WHERE email = ? AND token = ?";
        const [rows]: any = await db.query(sql, [email, token]);
        
        return rows.length > 0 ? rows[0] : null; 
    },

    // Fungsi 3: Menghapus token setelah password berhasil diubah agar token hangus
    deleteToken: async (email: string) => {
        const sql = "DELETE FROM password_reset_tokens WHERE email = ?";
        await db.query(sql, [email]);
    }
};

export default PasswordResetModel;