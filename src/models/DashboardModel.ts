import db from '../config/database';

class DashboardModel {
    // --- USERS ---
    static async getTotalUsers() {
        const [rows]: any = await db.query('SELECT COUNT(*) as total FROM users');
        return rows[0].total;
    }

    static async getUsersLast30Days() {
        const [rows]: any = await db.query('SELECT COUNT(*) as total FROM users WHERE created_at >= NOW() - INTERVAL 30 DAY');
        return rows[0].total;
    }

    static async getUsersPrevious30Days() {
        const [rows]: any = await db.query('SELECT COUNT(*) as total FROM users WHERE created_at >= NOW() - INTERVAL 60 DAY AND created_at < NOW() - INTERVAL 30 DAY');
        return rows[0].total;
    }

    // --- ACTIVE SESSIONS ---
    static async getActiveSessionsLast30Days() {
        const [rows]: any = await db.query('SELECT COUNT(DISTINCT user_id) as total FROM login_logs WHERE created_at >= NOW() - INTERVAL 30 DAY');
        return rows[0].total;
    }

    static async getActiveSessionsPrevious30Days() {
        const [rows]: any = await db.query('SELECT COUNT(DISTINCT user_id) as total FROM login_logs WHERE created_at >= NOW() - INTERVAL 60 DAY AND created_at < NOW() - INTERVAL 30 DAY');
        return rows[0].total;
    }

    // --- FAQS ---
    static async getTotalFaqs() {
        const [rows]: any = await db.query("SELECT COUNT(*) as total FROM faqs WHERE status = 'published'");
        return rows[0].total;
    }

    static async getFaqsLast30Days() {
        const [rows]: any = await db.query("SELECT COUNT(*) as total FROM faqs WHERE status = 'published' AND created_at >= NOW() - INTERVAL 30 DAY");
        return rows[0].total;
    }

    static async getFaqsPrevious30Days() {
        const [rows]: any = await db.query("SELECT COUNT(*) as total FROM faqs WHERE status = 'published' AND created_at >= NOW() - INTERVAL 60 DAY AND created_at < NOW() - INTERVAL 30 DAY");
        return rows[0].total;
    }

    // --- CHARTS & DATA ---
    static async getGrowthLineData() {
        const [rows]: any = await db.query(`
            SELECT DATE_FORMAT(created_at, '%b') as name, COUNT(*) as pengguna
            FROM users
            GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
            ORDER BY MIN(created_at) ASC
        `);
        return rows;
    }

    static async getRiskProfileDistribution() {
        const [rows]: any = await db.query(`
            SELECT profil_risiko as name, COUNT(*) as value
            FROM financial_profiles
            WHERE profil_risiko IS NOT NULL AND profil_risiko != ''
            GROUP BY profil_risiko
        `);
        return rows;
    }

    static async getRecentUsers() {
        const [rows]: any = await db.query(
            'SELECT id_user as id, nama_lengkap as name, email, role as riskProfile, created_at as joinDate FROM users ORDER BY created_at DESC LIMIT 4'
        );
        return rows;
    }
}

export default DashboardModel;