import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { analyzeCode, countBugsFromAnalysis } from '../services/gemini.js';
import { upsertUserStatistics } from '../services/stats.js';
import { buildReviewPdf } from '../services/pdfReport.js';

const router = Router();

router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code?.trim() || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const userResult = await pool.query(
      'SELECT skill_level FROM users WHERE id = $1',
      [req.user.id]
    );
    const skillLevel = userResult.rows[0]?.skill_level || 'Beginner';

    const analysis = await analyzeCode({ code, language, skillLevel });
    const score = Math.min(100, Math.max(0, Math.round(analysis.overallScore || 0)));
    const bugsFound = countBugsFromAnalysis(analysis);

    const insert = await pool.query(
      `INSERT INTO reviews (user_id, language, code, score, feedback, improved_code, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')
       RETURNING *`,
      [
        req.user.id,
        language,
        code,
        score,
        JSON.stringify(analysis),
        analysis.improvedCode || '',
      ]
    );

    await upsertUserStatistics(req.user.id);

    const review = formatReview(insert.rows[0]);
    res.json({ review, analysis, bugsFound });
  } catch (err) {
    console.error('Analyze error:', err);
    const msg = err.message?.includes('GEMINI')
      ? 'AI service not configured'
      : err.message?.includes('API key')
        ? 'Invalid Gemini API key'
        : 'Code analysis failed. Check your API key and try again.';
    res.status(500).json({ error: msg });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { search, language, minScore, maxScore, limit = 50, offset = 0 } = req.query;
    let query = `SELECT id, language, code, score, feedback, improved_code, status, created_at
                 FROM reviews WHERE user_id = $1`;
    const params = [req.user.id];
    let idx = 2;

    if (language) {
      query += ` AND language = $${idx++}`;
      params.push(language);
    }
    if (minScore) {
      query += ` AND score >= $${idx++}`;
      params.push(Number(minScore));
    }
    if (maxScore) {
      query += ` AND score <= $${idx++}`;
      params.push(Number(maxScore));
    }
    if (search) {
      query += ` AND (language ILIKE $${idx} OR feedback::text ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);
    res.json({ reviews: result.rows.map(formatReview) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.get('/recent', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, language, score, status, created_at
       FROM reviews WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [req.user.id]
    );
    res.json({ reviews: result.rows.map((r) => ({
      id: r.id,
      language: r.language,
      score: r.score,
      status: r.status,
      date: r.created_at,
    })) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent reviews' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ review: formatReview(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    const reviewResult = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!reviewResult.rows[0]) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const userResult = await pool.query(
      'SELECT name, email FROM users WHERE id = $1',
      [req.user.id]
    );

    const review = formatReview(reviewResult.rows[0]);
    const pdf = await buildReviewPdf({ review, user: userResult.rows[0] });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="codereview-${review.id}.pdf"`
    );
    res.send(pdf);
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

function formatReview(row) {
  const feedback =
    typeof row.feedback === 'string' ? JSON.parse(row.feedback) : row.feedback;
  return {
    id: row.id,
    userId: row.user_id,
    language: row.language,
    code: row.code,
    score: row.score,
    feedback,
    improvedCode: row.improved_code,
    status: row.status,
    createdAt: row.created_at,
  };
}

export default router;
