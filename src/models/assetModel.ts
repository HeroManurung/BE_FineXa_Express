import db from '../config/database';

const Asset = {
    getAllAssets: async (callback: (err: Error | null, results: any) => void) => {
        const sql = "SELECT * FROM assets";
        try {
            const [results] = await db.query(sql); 
            callback(null, results); 
        } catch (error: any) {
            callback(error, null); 
        }
    }
};

export default Asset;