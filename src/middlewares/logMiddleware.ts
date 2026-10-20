import { Request, Response, NextFunction } from 'express';

const catatLog = (req: Request, res: Response, next: NextFunction) => {
    const waktu = new Date().toLocaleTimeString();
    console.log(`[${waktu}] Ada request masuk dengan method ${req.method} ke URL: ${req.url}`);
    
    // next() WAJIB dipanggil agar request tidak "menggantung"
    next(); 
};

export default catatLog;