import db from '../config/database'; // Sesuaikan lokasi impor database-mu

// Mengekspor fungsi berbasis Promise
export const getLatestProfile = async (userId: string | number) => {
    const query = `
        SELECT profil_risiko, saran_investasi 
        FROM financial_profiles 
        WHERE id_user = ? 
        ORDER BY id_profil DESC 
        LIMIT 1
    `;
    
    // Karena menggunakan promise, kita pakai array destructuring [rows]
    const [rows] = await db.query(query, [userId]);
    
    return rows;
};