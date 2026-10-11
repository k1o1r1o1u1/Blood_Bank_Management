const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function executeSqlFile(connection, filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip all CLI DELIMITER directives
  const cleanedContent = content.replace(/^\s*DELIMITER\s+.*$/gmi, '');

  if (content.includes('$$')) {
    const rawBlocks = cleanedContent.split(/\$\$/);
    for (const raw of rawBlocks) {
      let stmt = raw.trim();
      stmt = stmt.replace(/^USE\s+[^;]+;/gmi, '').trim();
      if (!stmt) continue;

      if (stmt.includes(';') && !stmt.toUpperCase().includes('BEGIN')) {
        const subStmts = stmt.split(';').map(s => s.trim()).filter(Boolean);
        for (const sub of subStmts) {
          try {
            await connection.query(sub);
          } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('Duplicate')) throw e;
          }
        }
      } else {
        try {
          await connection.query(stmt);
        } catch (e) {
          if (!e.message.includes('already exists') && !e.message.includes('Duplicate')) throw e;
        }
      }
    }
  } else {
    await connection.query(cleanedContent);
  }
}

async function main() {
  console.log('====================================================');
  console.log(` Connecting to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}...`);
  console.log('====================================================');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    multipleStatements: true
  });

  try {
    console.log('✓ Connected successfully.');

    const dbName = process.env.DB_NAME || 'blood_bank';
    console.log(`\n1. Initializing database "${dbName}"...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`✓ Using database "${dbName}"`);

    const dbDir = path.join(__dirname, '..', '..', 'database');

    // 2. Schema
    console.log('\n2. Executing schema.sql (tables & constraints)...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await executeSqlFile(connection, path.join(dbDir, 'schema.sql'));
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✓ Tables & constraints created successfully.');

    // 3. Seed data
    console.log('\n3. Executing seed.sql (sample data)...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await executeSqlFile(connection, path.join(dbDir, 'seed.sql'));
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✓ Sample data seeded successfully.');

    // 4. Views
    console.log('\n4. Executing views.sql...');
    await executeSqlFile(connection, path.join(dbDir, 'views.sql'));
    console.log('✓ Views created successfully.');

    // 5. Indexes
    console.log('\n5. Executing indexes.sql...');
    await executeSqlFile(connection, path.join(dbDir, 'indexes.sql'));
    console.log('✓ Indexes created successfully.');

    // 6. Procedures
    console.log('\n6. Executing procedures.sql...');
    await executeSqlFile(connection, path.join(dbDir, 'procedures.sql'));
    console.log('✓ Stored procedures created successfully.');

    // 7. Triggers
    console.log('\n7. Executing triggers.sql...');
    await executeSqlFile(connection, path.join(dbDir, 'triggers.sql'));
    console.log('✓ Triggers created successfully.');

    // 8. Verify tables
    const [tables] = await connection.query('SHOW TABLES;');
    console.log('\nVerified tables & views in database:', tables.map(r => Object.values(r)[0]));

    console.log('\n====================================================');
    console.log(' 🎉 ALL TABLES, DATA, VIEWS, PROCEDURES & TRIGGERS READY! ');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ Database initialization error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
