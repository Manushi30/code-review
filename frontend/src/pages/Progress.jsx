import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';

export default function Progress() {
  const [weeks, setWeeks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.weeklyProgress(), api.dashboardStats()])
      .then(([w, s]) => {
        setWeeks(w.weeks || []);
        setStats(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading progress...</p>;

  return (
    <div className="dashboard-grid">
      <h1 className="page-title">Weekly Progress</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Track reviews done, score improvements, and languages practiced
      </p>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <span className="stat-label">Total Reviews</span>
          <span className="stat-value">{stats?.totalReviews ?? 0}</span>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-label">Current Avg Score</span>
          <span className="stat-value">{stats?.averageScore ?? 0}</span>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-label">Languages Practiced</span>
          <span className="stat-value" style={{ fontSize: '1.25rem' }}>
            {(stats?.languagesUsed || []).join(', ') || '—'}
          </span>
        </div>
      </div>

      <div className="section-card glass-card">
        <h3>Weekly Breakdown</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th>Reviews Done</th>
                <th>Avg Score</th>
                <th>Languages</th>
              </tr>
            </thead>
            <tbody>
              {weeks.length === 0 ? (
                <tr>
                  <td colSpan={4}>No weekly data yet — submit your first review!</td>
                </tr>
              ) : (
                weeks.map((w, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td>{new Date(w.week_start).toLocaleDateString()}</td>
                    <td>{w.reviews_done}</td>
                    <td>{Math.round(parseFloat(w.avg_score) * 10) / 10}</td>
                    <td>{(w.languages || []).join(', ') || '—'}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
