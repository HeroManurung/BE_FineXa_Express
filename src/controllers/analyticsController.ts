import { Request, Response } from 'express';
import AnalyticsModel from '../models/AnalyticsModel';

export const getAnalyticsData = async (req: Request, res: Response): Promise<any> => {
    try {
        const totalViews = await AnalyticsModel.getTotalViews();
        const activeUsers = await AnalyticsModel.getActiveUsers7Days();
        const faqViewsRes = await AnalyticsModel.getFaqViewsGrouped();

        // Hitung Rata-rata Engagement
        let avgEngagement = 0;
        if (faqViewsRes.length > 0 && totalViews > 0) {
            const engagementSum = faqViewsRes.reduce((sum: number, item: any) => sum + ((item.views / totalViews) * 100), 0);
            avgEngagement = Number((engagementSum / faqViewsRes.length).toFixed(1));
        }

        // Format Tabel Top Content
        const topContentRes = await AnalyticsModel.getTopContent();
        const formattedTopContent = topContentRes.map((item: any, index: number) => {
            const engagement = totalViews > 0 ? ((item.views / totalViews) * 100) : 0;
            return {
                id: index + 1,
                title: item.title,
                views: item.views.toLocaleString('id-ID'),
                engagement: `${engagement.toFixed(1)}%`,
                progress: `w-[${Math.round(engagement)}%]`
            };
        });

        // Hitung Pertumbuhan Views
        const viewsGrowthData = await AnalyticsModel.getViewsGrowthData();
        let viewsGrowth = 0;
        if (viewsGrowthData.lalu > 0) {
            viewsGrowth = Number((((viewsGrowthData.ini - viewsGrowthData.lalu) / viewsGrowthData.lalu) * 100).toFixed(1));
        } else if (viewsGrowthData.ini > 0) {
            viewsGrowth = 100;
        }

        // Hitung Pertumbuhan Users
        const usersGrowthData = await AnalyticsModel.getUsersGrowthData();
        let usersGrowth = 0;
        if (usersGrowthData.lalu > 0) {
            usersGrowth = Number((((activeUsers - usersGrowthData.lalu) / usersGrowthData.lalu) * 100).toFixed(1));
        } else if (activeUsers > 0) {
            usersGrowth = 100;
        }

        const engagementGrowth = viewsGrowth;

        // BUNGKUS DENGAN STRUKTUR JSON YANG TEPAT
        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    total_views: totalViews,
                    active_users: activeUsers,
                    avg_engagement: `${avgEngagement}%`,
                    views_growth: viewsGrowth,
                    users_growth: usersGrowth,
                    engagement_growth: engagementGrowth
                },
                top_content: formattedTopContent
            }
        });

    } catch (error) {
        console.error("Error get analytics data:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
};