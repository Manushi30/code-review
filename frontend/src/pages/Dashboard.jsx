import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileCode, Bug, Languages, BarChart3, Lightbulb } from 'lucide-react';
import { api } from '../api/client';
import './Dashboard.css';

const statIcons = {
  reviews: FileCode,
  score: BarChart3,
  bugs: Bug,
  languages: Languages,
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.dashboardStats(), api.getRecentReviews()])
      .then(([s, r]) => {
        setStats(s);
        setRecent(r.reviews || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  const cards = [
    { key: 'reviews', label: 'Total Reviews', value: stats?.totalReviews ?? 0 },
    { key: 'score', label: 'Average Code Score', value: stats?.averageScore ?? 0 },
    { key: 'bugs', label: 'Bugs Found', value: stats?.bugsFound ?? 0 },
    { key: 'languages', label: 'Languages Used', value: (stats?.languagesUsed || []).length },
  ];

  return (
    <div className="dashboard-grid">
      <h1 className="page-title">Dashboard</h1>
      <div className="stats-grid">
        {cards.map(({ key, label, value }, i) => {
          const Icon = statIcons[key];
          return (
            <motion.div
              key={key}
              className="stat-card glass-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Icon size={22} color="var(--brown)" />
              <span className="stat-label">{label}</span>
              <span className="stat-value">{value}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="two-col">
        <div className="section-card glass-card">
          <h3>Recent Reviews</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Language</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No reviews yet. Start your first code review!</td>
                  </tr>
                ) : (
                  recent.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>{r.language}</td>
                      <td>{r.score}/100</td>
                      <td>{r.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card glass-card">
          <h3>
            <Lightbulb size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
            AI Learning Insights
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Common mistakes & topics to improve
          </p>
          <ul className="insights-list">
            {(stats?.learningInsights?.topicsToImprove || []).slice(0, 5).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
            {!(stats?.learningInsights?.topicsToImprove?.length) && (
              <li>Complete reviews to unlock personalized insights</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
