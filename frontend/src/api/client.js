const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateProfile: (body) =>
    request('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) =>
    request('/users/password', { method: 'PUT', body: JSON.stringify(body) }),
  deleteAccount: (body) =>
    request('/users/account', { method: 'DELETE', body: JSON.stringify(body) }),
  dashboardStats: () => request('/stats/dashboard'),
  weeklyProgress: () => request('/stats/weekly'),
  analyzeCode: (body) =>
    request('/reviews/analyze', { method: 'POST', body: JSON.stringify(body) }),
  getReviews: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reviews${q ? `?${q}` : ''}`);
  },
  getRecentReviews: () => request('/reviews/recent'),
  getReview: (id) => request(`/reviews/${id}`),
  downloadPdf: async (id) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/reviews/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('PDF download failed');
    return res.blob();
  },
  leaderboard: () => request('/leaderboard'),
};

export function setAuthToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
