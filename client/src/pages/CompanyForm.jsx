import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import api from '../api';
import { FiArrowLeft } from 'react-icons/fi';

const CompanyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({
    name: '', industry: '', website: '', address: '', city: '', country: '', notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/companies/${id}`).then(r => setForm(r.data));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/api/companies/${id}`, form);
      } else {
        await api.post('/api/companies', form);
      }
      navigate('/companies');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Nom *', type: 'text', required: true },
    { key: 'industry', label: 'Secteur', type: 'text' },
    { key: 'website', label: 'Site web', type: 'text' },
    { key: 'address', label: 'Adresse', type: 'text' },
    { key: 'city', label: 'Ville', type: 'text' },
    { key: 'country', label: 'Pays', type: 'text' },
  ];

  return (
    <Layout>
      <PageHeader
        title={isEdit ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
        action={
          <button onClick={() => navigate('/companies')} style={{
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
            {fields.map(f => (
              <div key={f.key} style={{ gridColumn: f.key === 'address' || f.key === 'name' ? 'span 2' : 'span 1' }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  required={f.required}
                  value={form[f.key] || ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: '1px solid var(--border)', borderRadius: 6, fontSize: 14
                  }}
                />
              </div>
            ))}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Notes</label>
              <textarea
                value={form.notes || ''}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, resize: 'vertical' }}
              />
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading} style={{
              background: 'var(--accent)', color: 'white', border: 'none',
              borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>
              {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
            </button>
            <button type="button" onClick={() => navigate('/companies')} style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 6, padding: '10px 24px', fontSize: 14, cursor: 'pointer'
            }}>
              Annuler
            </button>
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default CompanyForm;