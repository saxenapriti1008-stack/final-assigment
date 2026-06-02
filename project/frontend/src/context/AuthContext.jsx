import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase.js';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function syncSession(firebaseUser) {
    if (!firebaseUser) {
      setUser(null);
      return;
    }
    const idToken = await firebaseUser.getIdToken();
    await api.createSession(idToken);
    const me = await api.me();
    setUser(me);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await syncSession(firebaseUser);
        } else {
          setUser(null);
        }
      } catch (e) {
        setError(e.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  async function login(email, password) {
    setError(null);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await syncSession(cred.user);
  }

  async function register(email, password) {
    setError(null);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await syncSession(cred.user);
  }

  async function logout() {
    await api.logout();
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
