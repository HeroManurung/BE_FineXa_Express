import db from '../config/database';

class AuthModel {
    // Mengecek apakah email sudah ada / Mengambil data user berdasarkan email
    static async getUserByEmail(email: string) {
        const [rows]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
    }

    // Menyimpan user baru ke database
    static async createUser(namaLengkap: string, email: string, hash: string, role: string) {
        const [result]: any = await db.query(
            'INSERT INTO users (nama_lengkap, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [namaLengkap, email, hash, role]
        );
        return result.insertId;
    }

    // Mencatat waktu terakhir login
    static async updateLastLogin(userId: number) {
        await db.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id_user = ?',
            [userId]
        );
    }

    // Mencatat log aktivitas sesi
    static async createLoginLog(userId: number) {
        await db.query(
            'INSERT INTO login_logs (user_id, created_at, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [userId]
        );
    }

    // Menghapus token saat logout
    static async deleteToken(token: string) {
        const [result]: any = await db.query(
            'DELETE FROM personal_access_tokens WHERE token = ?',
            [token]
        );
        return result.affectedRows;
    }
}

export default AuthModel;