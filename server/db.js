const { Pool } = require('pg');
require('dotenv').config();

// Use individual parameters instead of connection string
const pool = new Pool({
  host: process.env.PGHOST || 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: parseInt(process.env.PGPORT) || 6543,
  database: process.env.PGDATABASE || 'postgres',
  user: process.env.PGUSER || 'postgres.choenirythoiehzbabvc',
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false, // Critical for Supabase
  },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000,
  max: 10,
  keepAlive: true,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Error details:', err);
  } else {
    console.log('✅ Database connected successfully');
    console.log(`📡 Connected to ${process.env.PGHOST}:${process.env.PGPORT}`);
    release();
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
});

module.exports = {
  query: (text, params) => {
    console.log('📝 Query:', text.substring(0, 100));
    return pool.query(text, params);
  },
};