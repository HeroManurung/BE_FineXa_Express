import { Request, Response } from 'express';
import db from '../config/database';

export const getDashboardData = async (req: Request, res: Response): Promise<any> => {
    try {
        const [usersResult]: any = await db.query('SELECT COUNT(*) as total FROM users');
        const totalUsers = usersResult[0].total;

        const [sessionsResult]: any = await db.query(
            'SELECT COUNT(*) as total FROM login_logs WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())'
        );
        const activeSessions = sessionsResult[0].total;

        const [faqsResult]: any = await db.query("SELECT COUNT(*) as total FROM faqs WHERE status = 'published'");
        const totalFaqs = faqsResult[0].total;

        const [riskResult]: any = await db.query('SELECT role, COUNT(*) as total FROM users GROUP BY role');
        const pieData = riskResult.map((item: any) => {
            let color = '#3B82F6';
            const roleName = item.role.toLowerCase();
            if (roleName === 'moderat') color = '#10B981';
            if (roleName === 'agresif') color = '#F59E0B';
            if (roleName === 'admin') color = '#8B5CF6';
            const percentage = totalUsers > 0 ? Math.round((item.total / totalUsers) * 100) : 0;
            return { name: item.role.charAt(0).toUpperCase() + item.role.slice(1), value: percentage, color };
        });

        const [recentUsersResult]: any = await db.query(
            'SELECT id_user as id, nama_lengkap as name, email, role as riskProfile, created_at as joinDate FROM users ORDER BY created_at DESC LIMIT 4'
        );

        // --- TAMBAHAN UNTUK GRAFIK PERTUMBUHAN ASLI ---
        const [growthResult]: any = await db.query(`
            SELECT MONTH(created_at) as month, COUNT(*) as users
            FROM users
            WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
            GROUP BY MONTH(created_at)
            ORDER BY MONTH(created_at)
        `);
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        const lineData = growthResult.map((item: any) => ({
            month: monthNames[item.month - 1],
            users: item.users
        }));

        return res.status(200).json({
            success: true,
            data: {
                metrics: { totalUsers, activeSessions, totalFaqs },
                pieData,
                recentUsers: recentUsersResult,
                lineData // Data grafik dikirim ke frontend
            }
        });

    } catch (error) {
        console.error("Error get dashboard data:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};