import { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { api } from '../api/client';

export default function History() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (language) params.language = language;
    api
      .getReviews(params)
      .then((d) => setReviews(d.reviews || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handlePdf = async (id) => {
    try {
      const blob = await api.downloadPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codereview-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-grid">
      <h1 className="page-title">Review History</h1>

      <div className="review-toolbar glass-card" style={{ padding: '1rem' }}>
        <Search size={20} color="var(--text-muted)" />
        <input
          className="input-field"
          style={{ maxWidth: 240 }}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field"
          style={{ maxWidth: 160 }}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">All languages</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={load}>
          Filter
        </button>
      </div>

      <div className="section-card glass-card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Language</th>
                  <th>Score</th>
                  <th>Feedback</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No reviews found</td>
                  </tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td>{r.language}</td>
                      <td>{r.score}/100</td>
                      <td>{r.feedback?.summary?.slice(0, 80) || '—'}...</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem' }}
                          onClick={() => handlePdf(r.id)}
                        >
                          <Download size={16} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
