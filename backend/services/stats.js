import pool from '../config/db.js';

function countBugs(feedback) {
  const issues = feedback?.issues || [];
  return issues.filter((i) => ['High', 'Medium'].includes(i.severity)).length;
}

export async function upsertUserStatistics(userId) {
  const { rows } = await pool.query(
    'SELECT score, language, feedback FROM reviews WHERE user_id = $1',
    [userId]
  );

  const totalReviews = rows.length;
  const averageScore =
    totalReviews > 0
      ? rows.reduce((s, r) => s + (r.score || 0), 0) / totalReviews
      : 0;
  const bugsFound = rows.reduce((s, r) => s + countBugs(r.feedback), 0);
  const languagesUsed = [...new Set(rows.map((r) => r.language).filter(Boolean))];

  await pool.query(
    `INSERT INTO statistics (user_id, total_reviews, average_score, bugs_found, languages_used, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       total_reviews = EXCLUDED.total_reviews,
       average_score = EXCLUDED.average_score,
       bugs_found = EXCLUDED.bugs_found,
       languages_used = EXCLUDED.languages_used,
       updated_at = NOW()`,
    [userId, totalReviews, averageScore, bugsFound, JSON.stringify(languagesUsed)]
  );

  return {
    total_reviews: totalReviews,
    average_score: averageScore,
    bugs_found: bugsFound,
    languages_used: languagesUsed,
  };
}

export async function getWeeklyProgress(userId) {
  const result = await pool.query(
    `SELECT
      DATE_TRUNC('week', created_at) AS week_start,
      COUNT(*)::int AS reviews_done,
      COALESCE(AVG(score), 0)::decimal AS avg_score,
      COALESCE(array_agg(DISTINCT language), ARRAY[]::varchar[]) AS languages
    FROM reviews
    WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '8 weeks'
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY week_start DESC`,
    [userId]
  );
  return result.rows;
}
