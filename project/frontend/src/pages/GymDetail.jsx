import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function GymDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [gym, setGym] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const [g, r] = await Promise.all([api.getGym(id), api.getReviews(id)]);
    setGym(g);
    setReviews(r);
  }

  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createReview(id, { rating: Number(rating), comment });
      setComment('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeReview(reviewId) {
    await api.deleteReview(reviewId);
    await load();
  }

  if (loading) return <div className="container">Loading…</div>;
  if (!gym) return <div className="container">Gym not found.</div>;

  return (
    <div className="container">
      <h1>{gym.name}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{gym.address}</p>

      <h2 style={{ marginBottom: '1rem' }}>Reviews</h2>
      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
        {reviews.map((r) => (
          <div key={r.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="stars">{'★'.repeat(r.rating)}</span>
              {user?.uid === r.user_id && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  onClick={() => removeReview(r.id)}
                >
                  Delete
                </button>
              )}
            </div>
            <p style={{ marginTop: '0.5rem' }}>{r.comment}</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
              {r.user_email || 'Anonymous'}
            </p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>No reviews yet.</p>
        )}
      </div>

      {user ? (
        <form className="card" onSubmit={submitReview}>
          <h3 style={{ marginBottom: '1rem' }}>Write a review</h3>
          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="comment">Comment</label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Submit review
          </button>
        </form>
      ) : (
        <p style={{ color: 'var(--muted)' }}>
          <a href="/login">Log in</a> to write a review.
        </p>
      )}
    </div>
  );
}
