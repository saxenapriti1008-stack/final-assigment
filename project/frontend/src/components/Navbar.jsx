import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Link to="/" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
        Gym Review
      </Link>
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {user.email}
            </span>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}
