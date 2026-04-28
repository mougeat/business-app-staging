const pool = require('./pool');
const fs = require('fs');
const path = require('path');

const initDB = async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  }
};

module.exports = initDB;
