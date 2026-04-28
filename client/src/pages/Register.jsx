import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Register = () => {
  const [form, setForm] = useState({
    email: '', password: '', first_name: '',
    last_name: '', tenant_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur inscription');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'first_name', label: 'Prénom', type: 'text' },
    { key: 'last_name', label: 'Nom', type: 'text' },
    { key: 'tenant_name', label: 'Nom de l\'entreprise', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'password', label: 'Mot de passe', type: 'password' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)'
    }}>
      <div style={{
        background: 'white', borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        padding: 40, width: '100%', maxWidth: 420
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: 'var(--accent-dark)', fontSize: 28, fontWeight: 700 }}>ISPAG</h1>
          <p style={{ color: 'var(--text-light)', marginTop: 4 }}>Créer un compte</p>
        </div>

        {error && (
          <div style={{
            background: '#FDEDEC', color: '#E74C3C',
            padding: '10px 14px', borderRadius: 6,
            marginBottom: 16, fontSize: 14
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                {f.label}
              </label>
              <input
                type={f.type} required
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1px solid var(--border)', borderRadius: 6,
                  fontSize: 14, outline: 'none'
                }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', marginTop: 8,
            background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: 6,
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-light)' }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--accent)' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;