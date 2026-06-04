import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Medal } from 'lucide-react';
import { api } from '../api/client';

export default function Leaderboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .leaderboard()
      .then((d) => setList(d.leaderboard || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-grid">
      <h1 className="page-title">Leaderboard</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Ranked by average score and reviews completed
      </p>

      <div className="section-card glass-card">
        {loading ? (
          <p>Loading...</p>
        ) : list.length === 0 ? (
          <p>Be the first to complete a review and claim the top spot!</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>College</th>
                  <th>Level</th>
                  <th>Reviews</th>
                  <th>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td>
                      {row.rank <= 3 ? (
                        <Medal size={18} color={row.rank === 1 ? '#d4af37' : row.rank === 2 ? '#aaa' : '#cd7f32'} />
                      ) : (
                        row.rank
                      )}
                    </td>
                    <td>{row.name}</td>
                    <td>{row.college || '—'}</td>
                    <td>{row.skillLevel}</td>
                    <td>{row.totalReviews}</td>
                    <td><strong>{row.averageScore}</strong></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
