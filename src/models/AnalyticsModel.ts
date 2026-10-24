import db from '../config/database';

class AnalyticsModel {
    static async getTotalViews() {
        const [rows]: any = await db.query('SELECT COUNT(*) as total FROM faq_logs');
        return rows[0].total;
    }

    static async getActiveUsers7Days() {
        const [rows]: any = await db.query('SELECT COUNT(*) as total FROM login_logs WHERE created_at >= NOW() - INTERVAL 7 DAY');
        return rows[0].total;
    }

    static async getFaqViewsGrouped() {
        const [rows]: any = await db.query('SELECT faq_id, COUNT(id) as views FROM faq_logs GROUP BY faq_id');
        return rows;
    }

    static async getTopContent() {
        const [rows]: any = await db.query(`
            SELECT faqs.pertanyaan as title, COUNT(faq_logs.id) as views
            FROM faq_logs
            JOIN faqs ON faq_logs.faq_id = faqs.id_faq
            GROUP BY faqs.id_faq, faqs.pertanyaan
            ORDER BY views DESC
            LIMIT 5
        `);
        return rows;
    }

    static async getViewsGrowthData() {
        const [mingguIni]: any = await db.query('SELECT COUNT(*) as total FROM faq_logs WHERE created_at >= NOW() - INTERVAL 7 DAY');
        const [mingguLalu]: any = await db.query('SELECT COUNT(*) as total FROM faq_logs WHERE created_at >= NOW() - INTERVAL 14 DAY AND created_at < NOW() - INTERVAL 7 DAY');
        return { ini: mingguIni[0].total, lalu: mingguLalu[0].total };
    }

    static async getUsersGrowthData() {
        const [mingguLalu]: any = await db.query('SELECT COUNT(*) as total FROM login_logs WHERE created_at >= NOW() - INTERVAL 14 DAY AND created_at < NOW() - INTERVAL 7 DAY');
        return { lalu: mingguLalu[0].total };
    }
}

export default AnalyticsModel;