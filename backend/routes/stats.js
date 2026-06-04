import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { upsertUserStatistics, getWeeklyProgress } from '../services/stats.js';

const router = Router();

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const stats = await upsertUserStatistics(req.user.id);

    const insightsResult = await pool.query(
      `SELECT feedback FROM reviews WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );

    const commonMistakes = new Set();
    const suggestions = new Set();
    const topics = new Set();

    for (const row of insightsResult.rows) {
      const fb = typeof row.feedback === 'string' ? JSON.parse(row.feedback) : row.feedback;
      const li = fb?.learningInsights;
      if (!li) continue;
      li.commonMistakes?.forEach((m) => commonMistakes.add(m));
      li.learningSuggestions?.forEach((s) => suggestions.add(s));
      li.topicsToImprove?.forEach((t) => topics.add(t));
    }

    res.json({
      totalReviews: stats.total_reviews,
      averageScore: Math.round(stats.average_score * 10) / 10,
      bugsFound: stats.bugs_found,
      languagesUsed: stats.languages_used,
      learningInsights: {
        commonMistakes: [...commonMistakes].slice(0, 8),
        learningSuggestions: [...suggestions].slice(0, 8),
        topicsToImprove: [...topics].slice(0, 8),
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
});

router.get('/weekly', authenticate, async (req, res) => {
  try {
    const weeks = await getWeeklyProgress(req.user.id);
    res.json({ weeks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load weekly progress' });
  }
});

export default router;
