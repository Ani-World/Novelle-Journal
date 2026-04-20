const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// Middleware
app.use(helmet());
const allowedOrigin = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:5173';

app.use(cors({
  origin: function(origin, callback) {
    // Basic validation: allow local dev or the configured frontend URL (ignoring trailing slash)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
    
    if (normalizedOrigin === normalizedAllowed || normalizedOrigin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: { error: 'Too many authentication attempts.' }
});

// Auth Middleware Verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

/* --- DIAGNOSTICS --- */
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await db.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      frontend_url: process.env.FRONTEND_URL,
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: err.message,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString() 
    });
  }
});

/* --- AUTH ROUTES --- */
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    // Check if user exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) return res.status(409).json({ error: 'User already exists.' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
      [email, password_hash, full_name]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials.' });

    const expiresIn = rememberMe ? '7d' : '24h';
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn });

    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, avatar_url: user.avatar_url }});
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, full_name, avatar_url FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/* --- GOALS ROUTES --- */
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const goals = await db.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(goals.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, image_url, link_url, why_matters } = req.body;
    
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    const newGoal = await db.query(
      `INSERT INTO goals (user_id, title, description, category, image_url, link_url, why_matters) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, title, description, category, image_url, link_url, why_matters]
    );

    res.status(201).json(newGoal.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, image_url, link_url, why_matters } = req.body;

    const result = await db.query(
      `UPDATE goals 
       SET title = $1, description = $2, category = $3, image_url = $4, link_url = $5, why_matters = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title, description, category, image_url, link_url, why_matters, id, req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Goal not found or unauthorized.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Goal not found or unauthorized.' });
    res.json({ message: 'Goal deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/* --- COMPLETION LOGIC --- */
app.post('/api/goals/:id/complete', authenticateToken, async (req, res) => {
  try {
    // 1. Fetch the goal
    const goalRes = await db.query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (goalRes.rows.length === 0) return res.status(404).json({ error: 'Goal not found.' });
    const goal = goalRes.rows[0];

    // 2. Insert into completed_goals
    const completeRes = await db.query(
      `INSERT INTO completed_goals (user_id, original_goal_id, title, description, category, image_url, why_matters)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, goal.id, goal.title, goal.description, goal.category, goal.image_url, goal.why_matters]
    );

    // 3. Delete from active goals
    await db.query('DELETE FROM goals WHERE id = $1', [goal.id]);

    res.status(201).json(completeRes.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/completed', authenticateToken, async (req, res) => {
  try {
    const completed = await db.query('SELECT * FROM completed_goals WHERE user_id = $1 ORDER BY completed_at DESC', [req.user.id]);
    res.json(completed.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/completed/:id', authenticateToken, async (req, res) => {
  try {
    const { memory_note } = req.body;
    const result = await db.query(
      'UPDATE completed_goals SET memory_note = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [memory_note, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Memories not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/completed/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM completed_goals WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Goal not found.' });
    res.json({ message: 'Completed goal deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Novelle backend listening on port ${PORT}`);
});
