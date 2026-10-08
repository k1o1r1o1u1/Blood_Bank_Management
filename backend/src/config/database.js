const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'blood_bank',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL database "${process.env.DB_NAME || 'blood_bank'}"`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MySQL: ${error.message}`);
    console.warn('[Database Warning] Backend will remain active, but DB queries will fail until MySQL is running and schema is imported.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
