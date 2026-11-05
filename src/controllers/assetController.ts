import { Request, Response } from 'express';
import Asset from '../models/assetModel';

export const getAssets = (req: Request, res: Response): void => {
    Asset.getAllAssets((err: Error | null, data: any) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: "Gagal menarik data dari database.",
                error: err.message
            });
            return; // Tarik rem tangan kalau error
        }
        
        // Kalau sukses, kirim datanya ke frontend
        res.status(200).json({
            success: true,
            message: "Berhasil mengambil katalog produk investasi.",
            data: data
        });
    });
};