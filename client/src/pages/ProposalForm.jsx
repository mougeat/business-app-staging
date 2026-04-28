import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import api from '../api';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';

const ProposalForm = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    reference: '', company_id: '', contact_id: '',
    title: '', description: '', tax_rate: 20, currency: 'EUR',
    date_sent: '', date_expected: ''
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/api/companies').then(r => setCompanies(r.data));
    // Auto-generate reference
    const ref = `PROP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    setForm(f => ({ ...f, reference: ref }));
  }, []);

  useEffect(() => {
    if (form.company_id) {
      api.get(`/api/contacts?company_id=${form.company_id}`).then(r => setContacts(r.data));
    }
  }, [form.company_id]);

  const addItem = () => setItems([...items, {
    type: 'tank', diameter_mm: '', volume_liters: '', pressure_bar: '',
    fittings_count: '', quantity: 1, unit_price: '', notes: ''
  }]);

  const updateItem = (i, key, val) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [key]: val };
    updated[i].line_total = (updated[i].quantity || 1) * (updated[i].unit_price || 0);
    setItems(updated);
  };

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((sum, i) => sum + (Number(i.line_total) || 0), 0);
  const total = subtotal * (1 + (form.tax_rate || 0) / 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/proposals', { ...form, subtotal, total, items });
      navigate('/proposals');
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Nouvelle proposition"
        action={
          <button onClick={() => navigate('/proposals')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 14
          }}>
            <FiArrowLeft /> Retour
          </button>
        }
      />

      <form onSubmit={handleSubmit}>
        {/* General info */}
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, color: 'var(--accent-dark)' }}>Informations générales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { key: 'reference', label: 'Référence *', required: true },
              { key: 'title', label: 'Titre' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>{f.label}</label>
                <input type="text" required={f.required} value={form[f.key] || ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Client</label>
              <select value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value, contact_id: '' })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
                <option value="">— Sélectionner —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Contact</label>
              <select value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
                <option value="">— Sélectionner —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Date d'envoi</label>
              <input type="date" value={form.date_sent} onChange={e => setForm({ ...form, date_sent: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Date de réponse attendue</label>
              <input type="date" value={form.date_expected} onChange={e => setForm({ ...form, date_expected: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Description</label>
              <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, resize: 'vertical' }} />
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: 'var(--accent-dark)' }}>Équipements</h3>
            <button type="button" onClick={addItem} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: 6, padding: '6px 12px',
              fontSize: 13, cursor: 'pointer'
            }}>
              <FiPlus /> Ajouter équipement
            </button>
          </div>

          {items.length === 0 && (
            <p style={{ color: 'var(--text-light)', fontSize: 13, textAlign: 'center', padding: 20 }}>
              Aucun équipement — cliquez sur "Ajouter équipement"
            </p>
          )}

          {items.map((item, i) => (
            <div key={i} style={{
              border: '1px solid var(--border)', borderRadius: 8,
              padding: 16, marginBottom: 12, background: 'var(--bg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <select value={item.type} onChange={e => updateItem(i, 'type', e.target.value)}
                  style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}>
                  <option value="tank">Réservoir / Chauffe-eau</option>
                  <option value="heat_exchanger">Échangeur de chaleur</option>
                  <option value="other">Autre</option>
                </select>
                <button type="button" onClick={() => removeItem(i)} style={{
                  background: '#FDEDEC', color: 'var(--danger)',
                  border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer'
                }}>
                  <FiTrash2 />
                </button>
              </div>

              {item.type === 'tank' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
                  {[
                    { key: 'diameter_mm', label: 'Diamètre (mm)' },
                    { key: 'volume_liters', label: 'Volume (L)' },
                    { key: 'pressure_bar', label: 'Pression (bar)' },
                    { key: 'fittings_count', label: 'Nb raccords' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                      <input type="number" value={item[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }} />
                    </div>
                  ))}
                </div>
              )}

              {item.type === 'heat_exchanger' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Type</label>
                    <input type="text" value={item.exchanger_type || ''} onChange={e => updateItem(i, 'exchanger_type', e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Spécifications</label>
                    <input type="text" value={item.exchanger_spec || ''} onChange={e => updateItem(i, 'exchanger_spec', e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Quantité</label>
                  <input type="number" min="1" value={item.quantity || 1} onChange={e => updateItem(i, 'quantity', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Prix unitaire</label>
                  <input type="number" value={item.unit_price || ''} onChange={e => updateItem(i, 'unit_price', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Total ligne</label>
                  <input type="number" readOnly value={item.line_total || 0}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, background: 'var(--bg)' }} />
                </div>
              </div>
            </div>
          ))}

          {/* Totals */}
          {items.length > 0 && (
            <div style={{ marginTop: 16, borderTop: '2px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ minWidth: 240 }}>
                  {[
                    ['Sous-total', `${subtotal.toLocaleString('fr-FR')} ${form.currency}`],
                    [`TVA (${form.tax_rate}%)`, `${(subtotal * form.tax_rate / 100).toLocaleString('fr-FR')} ${form.currency}`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                      <span style={{ color: 'var(--text-light)' }}>{label}</span>
                      <span>{val}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--accent)' }}>{total.toLocaleString('fr-FR')} {form.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={loading} style={{
            background: 'var(--accent)', color: 'white', border: 'none',
            borderRadius: 6, padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>
            {loading ? 'Enregistrement...' : 'Créer la proposition'}
          </button>
          <button type="button" onClick={() => navigate('/proposals')} style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 6, padding: '10px 24px', fontSize: 14, cursor: 'pointer'
          }}>Annuler</button>
        </div>
      </form>
    </Layout>
  );
};

export default ProposalForm;