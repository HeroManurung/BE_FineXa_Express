import { Request, Response } from 'express';
import db from '../config/database';

export const getDashboardData = async (req: Request, res: Response): Promise<any> => {
    try {
        // --- 1. TOTAL USERS & PERTUMBUHAN ---
// --- 1. TOTAL USERS & PERTUMBUHAN (Rolling 30 Days) ---
        const [usersResult]: any = await db.query('SELECT COUNT(*) as total FROM users');
        const totalUsers = usersResult[0].total;

        const [userBulanIniRes]: any = await db.query('SELECT COUNT(*) as total FROM users WHERE created_at >= NOW() - INTERVAL 30 DAY');
        const [userBulanLaluRes]: any = await db.query('SELECT COUNT(*) as total FROM users WHERE created_at >= NOW() - INTERVAL 60 DAY AND created_at < NOW() - INTERVAL 30 DAY');
        
        const userBulanIni = userBulanIniRes[0].total;
        const userBulanLalu = userBulanLaluRes[0].total;
        let userGrowth = userBulanLalu > 0 ? Number((((userBulanIni - userBulanLalu) / userBulanLalu) * 100).toFixed(1)) : (userBulanIni > 0 ? 100 : 0);

        // --- 2. ACTIVE SESSIONS & PERTUMBUHAN (Rolling 30 Days) ---
        const [sessionsResult]: any = await db.query('SELECT COUNT(DISTINCT user_id) as total FROM login_logs WHERE created_at >= NOW() - INTERVAL 30 DAY');
        const activeSessions = sessionsResult[0].total;

        const [sessionBulanIniRes]: any = await db.query('SELECT COUNT(DISTINCT user_id) as total FROM login_logs WHERE created_at >= NOW() - INTERVAL 30 DAY');
        const [sessionBulanLaluRes]: any = await db.query('SELECT COUNT(DISTINCT user_id) as total FROM login_logs WHERE created_at >= NOW() - INTERVAL 60 DAY AND created_at < NOW() - INTERVAL 30 DAY');
        
        const sessionBulanIni = sessionBulanIniRes[0].total;
        const sessionBulanLalu = sessionBulanLaluRes[0].total;
        let activeGrowth = sessionBulanLalu > 0 ? Number((((sessionBulanIni - sessionBulanLalu) / sessionBulanLalu) * 100).toFixed(1)) : (sessionBulanIni > 0 ? 100 : 0);

        // --- 3. TOTAL FAQS & PERTUMBUHAN (Rolling 30 Days) ---
        const [faqsResult]: any = await db.query("SELECT COUNT(*) as total FROM faqs WHERE status = 'published'");
        const totalFaqs = faqsResult[0].total;

        const [faqBulanIniRes]: any = await db.query("SELECT COUNT(*) as total FROM faqs WHERE status = 'published' AND created_at >= NOW() - INTERVAL 30 DAY");
        const [faqBulanLaluRes]: any = await db.query("SELECT COUNT(*) as total FROM faqs WHERE status = 'published' AND created_at >= NOW() - INTERVAL 60 DAY AND created_at < NOW() - INTERVAL 30 DAY");
        
        const faqBulanIni = faqBulanIniRes[0].total;
        const faqBulanLalu = faqBulanLaluRes[0].total;
        let faqGrowth = faqBulanLalu > 0 ? Number((((faqBulanIni - faqBulanLalu) / faqBulanLalu) * 100).toFixed(1)) : (faqBulanIni > 0 ? 100 : 0); 

        // --- 4. GRAFIK PERTUMBUHAN PENGGUNA (Garis) ---
        const [growthResult]: any = await db.query(`
            SELECT DATE_FORMAT(created_at, '%b') as name, COUNT(*) as pengguna
            FROM users
            GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
            ORDER BY MIN(created_at) ASC
        `);
        const lineData = growthResult.map((item: any) => ({ month: item.name, users: item.pengguna }));

        // --- 5. GRAFIK PROFIL RISIKO (Lingkaran) ---
        const [riskResult]: any = await db.query(`
            SELECT profil_risiko as name, COUNT(*) as value
            FROM financial_profiles
            WHERE profil_risiko IS NOT NULL AND profil_risiko != ''
            GROUP BY profil_risiko
        `);
        
        // Hitung total orang yang punya profil risiko (menghindari pembagian dengan nol)
        const totalProfiles = riskResult.reduce((sum: number, item: any) => sum + item.value, 0);

        const pieColors: { [key: string]: string } = {
            'Sangat Konservatif': '#3B82F6', // Sesuaikan nama dengan yang ada di database
            'Moderat': '#10B981',
            'Sangat Agresif': '#F59E0B'
        };
        
        const pieData = riskResult.map((item: any) => ({
            name: item.name,
            // Ubah value menjadi persentase bulat
            value: totalProfiles > 0 ? Math.round((item.value / totalProfiles) * 100) : 0,
            color: pieColors[item.name] || '#6B7280'
        }));    

        // --- 6. PENGGUNA TERBARU ---
        const [recentUsersResult]: any = await db.query(
            'SELECT id_user as id, nama_lengkap as name, email, role as riskProfile, created_at as joinDate FROM users ORDER BY created_at DESC LIMIT 4'
        );

        // --- 7. KIRIM RESPONSE KE FRONTEND ---
        return res.status(200).json({
            success: true,
            data: {
                metrics: {
                    totalUsers,
                    activeSessions,
                    totalFaqs,
                    activeGrowth,
                    userGrowth, 
                    faqGrowth
                },
                pieData,
                recentUsers: recentUsersResult,
                lineData
            }
        });

    } catch (error) {
        console.error("Error get dashboard data:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};