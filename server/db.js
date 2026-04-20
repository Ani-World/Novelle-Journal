const { Pool } = require('pg');
require('dotenv').config();

// Log what environment variables are available (without exposing passwords)
console.log('Checking environment variables:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Get connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

// Create pool with explicit SSL configuration
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // This is the key for Supabase
  },
  connectionTimeoutMillis: 30000,
  keepAlive: true,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Full error details:', err);
  } else {
    console.log('✅ Database connected successfully');
    console.log('📡 Connected to Supabase pooler');
    release();
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
});

module.exports = {
  query: (text, params) => {
    console.log('📝 Executing query:', text.substring(0, 80));
    return pool.query(text, params);
  },
};