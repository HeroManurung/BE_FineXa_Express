import { Request, Response } from 'express';
import DashboardModel from '../models/DashboardModel';

export const getDashboardData = async (req: Request, res: Response): Promise<any> => {
    try {
        // --- 1. TOTAL USERS & PERTUMBUHAN ---
        const totalUsers = await DashboardModel.getTotalUsers();
        const userBulanIni = await DashboardModel.getUsersLast30Days();
        const userBulanLalu = await DashboardModel.getUsersPrevious30Days();
        
        let userGrowth = userBulanLalu > 0 ? Number((((userBulanIni - userBulanLalu) / userBulanLalu) * 100).toFixed(1)) : (userBulanIni > 0 ? 100 : 0);

        // --- 2. ACTIVE SESSIONS & PERTUMBUHAN ---
        const activeSessions = await DashboardModel.getActiveSessionsLast30Days();
        const sessionBulanIni = activeSessions; // Hasilnya sama dengan activeSessions
        const sessionBulanLalu = await DashboardModel.getActiveSessionsPrevious30Days();
        
        let activeGrowth = sessionBulanLalu > 0 ? Number((((sessionBulanIni - sessionBulanLalu) / sessionBulanLalu) * 100).toFixed(1)) : (sessionBulanIni > 0 ? 100 : 0);

        // --- 3. TOTAL FAQS & PERTUMBUHAN ---
        const totalFaqs = await DashboardModel.getTotalFaqs();
        const faqBulanIni = await DashboardModel.getFaqsLast30Days();
        const faqBulanLalu = await DashboardModel.getFaqsPrevious30Days();
        
        let faqGrowth = faqBulanLalu > 0 ? Number((((faqBulanIni - faqBulanLalu) / faqBulanLalu) * 100).toFixed(1)) : (faqBulanIni > 0 ? 100 : 0);

        // --- 4. GRAFIK PERTUMBUHAN PENGGUNA (Garis) ---
        const growthResult = await DashboardModel.getGrowthLineData();
        const lineData = growthResult.map((item: any) => ({ month: item.name, users: item.pengguna }));

        // --- 5. GRAFIK PROFIL RISIKO (Lingkaran) ---
        const riskResult = await DashboardModel.getRiskProfileDistribution();
        
        const totalProfiles = riskResult.reduce((sum: number, item: any) => sum + item.value, 0);
        const pieColors: { [key: string]: string } = {
            'Sangat Konservatif': '#3B82F6', 
            'Moderat': '#10B981',
            'Sangat Agresif': '#F59E0B'
        };
        
        const pieData = riskResult.map((item: any) => ({
            name: item.name,
            value: totalProfiles > 0 ? Math.round((item.value / totalProfiles) * 100) : 0,
            color: pieColors[item.name] || '#6B7280'
        }));    

        // --- 6. PENGGUNA TERBARU ---
        const recentUsersResult = await DashboardModel.getRecentUsers();

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