const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function test() {
  console.log('Testing DB connection with config:');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('DB:', process.env.DB_NAME);
  
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      connectTimeout: 3000
    });
    console.log('SUCCESS: Connected to DB successfully!');
    const [rows] = await conn.query('SHOW DATABASES;');
    console.log('Databases:', rows.map(r => Object.values(r)[0]));
    await conn.end();
  } catch (err) {
    console.log('Configured connection failed:', err.message);
    
    // Try localhost root
    console.log('\nTrying localhost root...');
    try {
      const localConn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        connectTimeout: 2000
      });
      console.log('SUCCESS: Connected to local MySQL with root/no password!');
      await localConn.end();
    } catch (localErr) {
      console.log('Localhost root failed:', localErr.message);
    }
  }
}

test();

