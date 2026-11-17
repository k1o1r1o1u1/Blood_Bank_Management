const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

async function runMigration() {
  console.log('Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blood_bank',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  try {
    console.log('1. Checking and updating `hospitals` table...');
    const [hCols] = await conn.query('DESCRIBE hospitals');
    const hColNames = hCols.map(c => c.Field);

    if (!hColNames.includes('password')) {
      await conn.query("ALTER TABLE hospitals ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'hospital123' AFTER email;");
      console.log('   ✓ Added `password` column to hospitals');
    }
    if (!hColNames.includes('role')) {
      await conn.query("ALTER TABLE hospitals ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'Hospital' AFTER password;");
      console.log('   ✓ Added `role` column to hospitals');
    }

    console.log('2. Checking and updating `donors` table...');
    const [dCols] = await conn.query('DESCRIBE donors');
    const dColNames = dCols.map(c => c.Field);

    if (!dColNames.includes('email')) {
      await conn.query("ALTER TABLE donors ADD COLUMN email VARCHAR(100) NULL UNIQUE AFTER name;");
      console.log('   ✓ Added `email` column to donors');
    }
    if (!dColNames.includes('password')) {
      await conn.query("ALTER TABLE donors ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'donor123' AFTER email;");
      console.log('   ✓ Added `password` column to donors');
    }
    if (!dColNames.includes('role')) {
      await conn.query("ALTER TABLE donors ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'Donor' AFTER password;");
      console.log('   ✓ Added `role` column to donors');
    }

    console.log('3. Seeding emails and credentials for existing donors...');
    const donorEmails = [
      { id: 1, email: 'rahul.sharma@gmail.com' },
      { id: 2, email: 'priya.nair@gmail.com' },
      { id: 3, email: 'vikram.mehta@gmail.com' },
      { id: 4, email: 'ananya.sen@gmail.com' },
      { id: 5, email: 'rohan.verma@gmail.com' },
      { id: 6, email: 'sneha.patel@gmail.com' },
      { id: 7, email: 'karthik.iyer@gmail.com' },
      { id: 8, email: 'neha.gupta@gmail.com' },
      { id: 9, email: 'rajesh.k@gmail.com' },
      { id: 10, email: 'divya.reddy@gmail.com' }
    ];

    for (const d of donorEmails) {
      await conn.query(
        "UPDATE donors SET email = ?, password = 'donor123', role = 'Donor' WHERE donor_id = ?",
        [d.email, d.id]
      );
    }
    console.log('   ✓ Donors seeded with test email accounts.');

    console.log('4. Ensuring hospital passwords and roles...');
    await conn.query("UPDATE hospitals SET password = 'hospital123', role = 'Hospital' WHERE password IS NULL OR password = '' OR role IS NULL;");
    console.log('   ✓ Hospitals verified with password and role.');

    console.log('\n🎉 Multi-role database migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

runMigration();
