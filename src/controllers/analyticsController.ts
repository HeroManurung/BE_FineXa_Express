import { Request, Response } from 'express';
import db from '../config/database';

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
    try {
        // 1. HITUNG TOTAL VIEWS (Dari tabel faq_logs)
        const [viewsData]: any = await db.query('SELECT COUNT(id) as total FROM faq_logs');
        const totalViews = viewsData[0].total;
        
        // 2. HITUNG TOTAL LOGIN (7 hari terakhir, tanpa batasan distinct)
        const [activeUsersData]: any = await db.query(
            'SELECT COUNT(id) as total FROM login_logs WHERE created_at >= NOW() - INTERVAL 7 DAY'
        );
        const activeUsers = activeUsersData[0].total;

        // 3. HITUNG RATA-RATA ENGAGEMENT
        // Ambil semua FAQ yang pernah di-klik, hitung persentasenya
        const [allContentEngagement]: any = await db.query(
            'SELECT faq_id, COUNT(id) as views FROM faq_logs GROUP BY faq_id'
        );

        let avgEngagement = 0;
        if (allContentEngagement.length > 0 && totalViews > 0) {
            // Kalkulasi persentase masing-masing FAQ dan jumlahkan (reduce)
            const totalPercent = allContentEngagement.reduce((sum: number, item: any) => {
                return sum + ((item.views / totalViews) * 100);
            }, 0);
            // Hitung rata-rata dan bulatkan 1 desimal
            avgEngagement = Number((totalPercent / allContentEngagement.length).toFixed(1));
        }

        // 4. AMBIL TOP 5 KONTEN UNTUK TABEL BAWAH
        const [topContentData]: any = await db.query(`
            SELECT faqs.pertanyaan as title, COUNT(faq_logs.id) as views
            FROM faq_logs
            JOIN faqs ON faq_logs.faq_id = faqs.id_faq
            GROUP BY faqs.id_faq, faqs.pertanyaan
            ORDER BY views DESC
            LIMIT 5
        `);

        // Format hasil Top 5 dan tambahkan kalkulasi engagement
        const topContent = topContentData.map((item: any) => {
            const engagement = totalViews > 0 ? ((item.views / totalViews) * 100) : 0;
            return {
                title: item.title,
                views: item.views,
                engagement: Number(engagement.toFixed(1))
            };
        });

        // 5. HITUNG PERTUMBUHAN MINGGUAN (GROWTH)
        
        // a. Pertumbuhan Views
        const [viewsMingguIniData]: any = await db.query(
            'SELECT COUNT(id) as total FROM faq_logs WHERE created_at >= NOW() - INTERVAL 7 DAY'
        );
        const viewsMingguIni = viewsMingguIniData[0].total;

        const [viewsMingguLaluData]: any = await db.query(
            'SELECT COUNT(id) as total FROM faq_logs WHERE created_at >= NOW() - INTERVAL 14 DAY AND created_at < NOW() - INTERVAL 7 DAY'
        );
        const viewsMingguLalu = viewsMingguLaluData[0].total;
        
        let viewsGrowth = 0;
        if (viewsMingguLalu > 0) {
            viewsGrowth = Number((((viewsMingguIni - viewsMingguLalu) / viewsMingguLalu) * 100).toFixed(1));
        } else if (viewsMingguIni > 0) {
            viewsGrowth = 100; 
        }

        // b. Pertumbuhan Users/Login
        const usersMingguIni = activeUsers; 
        const [usersMingguLaluData]: any = await db.query(
            'SELECT COUNT(id) as total FROM login_logs WHERE created_at >= NOW() - INTERVAL 14 DAY AND created_at < NOW() - INTERVAL 7 DAY'
        );
        const usersMingguLalu = usersMingguLaluData[0].total;
        
        let usersGrowth = 0;
        if (usersMingguLalu > 0) {
            usersGrowth = Number((((usersMingguIni - usersMingguLalu) / usersMingguLalu) * 100).toFixed(1));
        } else if (usersMingguIni > 0) {
            usersGrowth = 100;
        }

        // Pertumbuhan engagement kita selaraskan dengan views sesuai kodemu
        const engagementGrowth = viewsGrowth; 

        // 6. BUNGKUS DAN KIRIM KE REACT (Struktur JSON persis seperti kodemu)
        return res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    total_views: totalViews,
                    active_users: activeUsers,
                    avg_engagement: avgEngagement,
                    views_growth: viewsGrowth,
                    users_growth: usersGrowth,
                    engagement_growth: engagementGrowth
                },
                top_content: topContent
            }
        });

    } catch (error) {
        console.error("Error Admin Analytics:", error);
        return res.status(500).json({ status: 'error', message: "Terjadi kesalahan saat menghitung statistik." });
    }
};