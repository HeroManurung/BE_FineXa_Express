import db from '../config/database';

class UserModel {
    // Mengambil semua user (tanpa password untuk keamanan)
    static async getAll() {
        const [rows]: any = await db.query(
            'SELECT id_user, nama_lengkap, email, role, last_login_at, created_at, updated_at, no_telepon, lokasi, tanggal_lahir FROM users'
        );
        return rows;
    }

    // Mengambil satu user berdasarkan ID
    static async getById(id: string) {
        const [rows]: any = await db.query('SELECT * FROM users WHERE id_user = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    // Memperbarui data profil user lengkap dengan email
    static async update(id: string, namaLengkap: string, email: string, noTelepon: string, lokasi: string, tanggal_lahir: string) {
        await db.query(
            'UPDATE users SET nama_lengkap = ?, email = ?, no_telepon = ?, lokasi = ?, tanggal_lahir = ? WHERE id_user = ?',
            [namaLengkap, email, noTelepon, lokasi, tanggal_lahir, id]
        );
    }

    // Menghapus user
    static async delete(id: string) {
        await db.query('DELETE FROM users WHERE id_user = ?', [id]);
    }
}

export default UserModel;