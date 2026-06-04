import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, college, skillLevel } = req.body;
    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        college = COALESCE($2, college),
        skill_level = COALESCE($3, skill_level)
       WHERE id = $4
       RETURNING id, name, email, college, skill_level, created_at`,
      [name, college, skillLevel, req.user.id]
    );
    const u = result.rows[0];
    res.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        college: u.college,
        skillLevel: u.skill_level,
        createdAt: u.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid current and new password (6+ chars) required' });
    }

    const result = await pool.query('SELECT password FROM users WHERE id = $1', [
      req.user.id,
    ]);
    const user = result.rows[0];
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [
      req.user.id,
    ]);
    if (!(await bcrypt.compare(password, result.rows[0].password))) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
