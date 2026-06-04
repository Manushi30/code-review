import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { signToken, authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, skillLevel, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 12);
    const level = skillLevel || 'Beginner';

    const result = await pool.query(
      `INSERT INTO users (name, email, password, college, skill_level)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, college, skill_level, created_at`,
      [name, email.toLowerCase(), hash, college || '', level]
    );

    const user = result.rows[0];
    await pool.query(
      'INSERT INTO statistics (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [user.id]
    );

    const token = signToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, college, skill_level, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    skillLevel: user.skill_level,
    createdAt: user.created_at,
  };
}

export default router;
