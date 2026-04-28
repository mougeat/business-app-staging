import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)'
    }}>
      <div style={{
        background: 'white', borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        padding: 40, width: '100%', maxWidth: 400
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: 'var(--accent-dark)', fontSize: 28, fontWeight: 700 }}>
            ISPAG
          </h1>
          <p style={{ color: 'var(--text-light)', marginTop: 4 }}>
            Connectez-vous à votre compte
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FDEDEC', color: '#E74C3C',
            padding: '10px 14px', borderRadius: 6,
            marginBottom: 16, fontSize: 14
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid var(--border)', borderRadius: 6,
                fontSize: 14, outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              Mot de passe
            </label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid var(--border)', borderRadius: 6,
                fontSize: 14, outline: 'none'
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px',
            background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: 6,
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-light)' }}>
          Pas de compte ? <Link to="/register" style={{ color: 'var(--accent)' }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;