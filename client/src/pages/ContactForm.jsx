import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import api from '../api';
import { FiArrowLeft } from 'react-icons/fi';

const ContactForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    company_id: searchParams.get('company_id') || '',
    first_name: '', last_name: '', role: '',
    email: '', phone: '', whatsapp: '', notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/companies').then(r => setCompanies(r.data));
    if (isEdit) {
      api.get(`/api/contacts/${id}`).then(r => setForm(r.data));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/api/contacts/${id}`, form);
      } else {
        await api.post('/api/contacts', form);
      }
      navigate('/contacts');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title={isEdit ? 'Modifier le contact' : 'Nouveau contact'}
        action={
          <button onClick={() => navigate('/contacts')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 14
          }}>
            <FiArrowLeft /> Retour
          </button>
        }
      />
      <Card style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Entreprise</label>
              <select value={form.company_id || ''} onChange={e => setForm({ ...form, company_id: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
                <option value="">— Sélectionner une entreprise —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {[
              { key: 'first_name', label: 'Prénom *', required: true },
              { key: 'last_name', label: 'Nom' },
              { key: 'role', label: 'Rôle / Fonction' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Téléphone' },
              { key: 'whatsapp', label: 'WhatsApp' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>{f.label}</label>
                <input
                  type="text" required={f.required}
                  value={form[f.key] || ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}
                />
              </div>
            ))}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Notes</label>
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading} style={{
              background: 'var(--accent)', color: 'white', border: 'none',
              borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>
              {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
            </button>
            <button type="button" onClick={() => navigate('/contacts')} style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 6, padding: '10px 24px', fontSize: 14, cursor: 'pointer'
            }}>Annuler</button>
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default ContactForm;