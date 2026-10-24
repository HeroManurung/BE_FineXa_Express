import db from '../config/database';

class UserModel {
    // Mengambil semua user (tanpa password untuk keamanan)
    static async getAll() {
        const [rows]: any = await db.query(
            'SELECT id_user, nama_lengkap, email, role, last_login_at, created_at, updated_at FROM users'
        );
        return rows;
    }

    // Mengambil satu user berdasarkan ID
    static async getById(id: string) {
        const [rows]: any = await db.query('SELECT * FROM users WHERE id_user = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    // Memperbarui data user
    static async update(id: string, namaLengkap: string, role: string) {
        await db.query(
            'UPDATE users SET nama_lengkap = ?, role = ? WHERE id_user = ?',
            [namaLengkap, role, id]
        );
    }

    // Menghapus user
    static async delete(id: string) {
        await db.query('DELETE FROM users WHERE id_user = ?', [id]);
    }
}

export default UserModel;