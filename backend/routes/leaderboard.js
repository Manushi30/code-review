import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.college,
        u.skill_level,
        COALESCE(s.total_reviews, 0)::int AS total_reviews,
        COALESCE(s.average_score, 0)::decimal AS average_score
       FROM users u
       LEFT JOIN statistics s ON s.user_id = u.id
       WHERE COALESCE(s.total_reviews, 0) > 0
       ORDER BY s.average_score DESC, s.total_reviews DESC
       LIMIT 50`
    );

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      college: row.college,
      skillLevel: row.skill_level,
      totalReviews: row.total_reviews,
      averageScore: Math.round(parseFloat(row.average_score) * 10) / 10,
    }));

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

export default router;
