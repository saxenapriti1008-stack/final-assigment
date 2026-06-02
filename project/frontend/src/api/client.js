const API_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  getGyms: () => request('/api/gyms'),
  getGym: (id) => request(`/api/gyms/${id}`),
  createGym: (body) =>
    request('/api/gyms', { method: 'POST', body: JSON.stringify(body) }),
  deleteGym: (id) => request(`/api/gyms/${id}`, { method: 'DELETE' }),
  getReviews: (gymId) => request(`/api/reviews/gym/${gymId}`),
  createReview: (gymId, body) =>
    request(`/api/reviews/gym/${gymId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteReview: (id) => request(`/api/reviews/${id}`, { method: 'DELETE' }),
  createSession: (idToken) =>
    request('/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
};
