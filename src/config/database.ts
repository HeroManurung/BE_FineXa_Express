import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Membuat koneksi ke database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Mengecek apakah koneksi berhasil
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Gagal koneksi ke database:', err.message);
    } else {
        console.log('Berhasil terhubung ke database FineXa MySQL!');
        connection.release();
    }
});

export default pool.promise();