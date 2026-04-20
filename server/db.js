const { Pool } = require('pg');
require('dotenv').config();

// Direct connection parameters - bypasses URL parsing issues
const pool = new Pool({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.choenirythoiehzbabvc',
  password: 'Anikulal@20',
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 30000,
  // These help with connection stability
  keepAlive: true,
  idleTimeoutMillis: 30000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your password and host configuration');
  } else {
    console.log('✅ Database connected successfully!');
    console.log('📡 Connected to Supabase on port 6543');
    release();
  }
});

module.exports = {
  query: (text, params) => {
    console.log('📝 Query:', text.substring(0, 60));
    return pool.query(text, params);
  },
};