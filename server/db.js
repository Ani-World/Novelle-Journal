const { Pool } = require('pg');
require('dotenv').config();

// Parse the DATABASE_URL to ensure it has SSL parameters
let connectionString = process.env.DATABASE_URL;

// Add SSL parameters if not present
if (connectionString && !connectionString.includes('sslmode')) {
  connectionString += '?sslmode=require';
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
  connectionTimeoutMillis: 30000, // Increased timeout
  idleTimeoutMillis: 60000,
  max: 10, // Reduced from 20 to avoid connection limits
  keepAlive: true,
});

// Test the connection immediately
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Full error:', err);
    console.error('Connection string (hidden password):',
      connectionString.replace(/:[^:@]+@/, ':****@'));
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Event listeners for debugging
pool.on('connect', () => {
  console.log('📡 New database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
});

module.exports = {
  query: (text, params) => {
    console.log('📝 Executing query:', text.substring(0, 100)); // Log first 100 chars
    return pool.query(text, params);
  },
};