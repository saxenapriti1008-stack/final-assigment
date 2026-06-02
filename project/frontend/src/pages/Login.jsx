import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login, register, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setLocalError('');
    try {
      if (isRegister) await register(email, password);
      else await login(email, password);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: '3rem' }}>
      <div className="card">
        <h1 style={{ marginBottom: '0.5rem' }}>
          {isRegister ? 'Create account' : 'Welcome back'}
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Sign in to add gyms and write reviews. Tokens are stored in httpOnly
          cookies — not localStorage.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>
          {(localError || error) && (
            <p className="error">{localError || error}</p>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Please wait…' : isRegister ? 'Register' : 'Log in'}
          </button>
        </form>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: '1rem' }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? 'Already have an account? Log in'
            : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}
