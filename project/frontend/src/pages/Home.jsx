import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getGyms()
      .then(setGyms)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1>Gyms</h1>
          <p style={{ color: 'var(--muted)' }}>
            Browse gyms and read community reviews.
          </p>
        </div>
        {user && (
          <Link to="/add-gym" className="btn btn-primary">
            + Add gym
          </Link>
        )}
      </div>

      {loading && <p>Loading gyms…</p>}
      {error && <p className="error">{error}</p>}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {gyms.map((gym) => (
          <Link key={gym.id} to={`/gym/${gym.id}`} className="card" style={{ display: 'block' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>{gym.name}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{gym.address}</p>
            <p style={{ marginTop: '0.5rem' }}>
              <span className="stars">★</span>{' '}
              {Number(gym.avg_rating).toFixed(1)} · {gym.review_count} reviews
            </p>
          </Link>
        ))}
        {!loading && gyms.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>No gyms yet. Be the first to add one!</p>
        )}
      </div>
    </div>
  );
}
