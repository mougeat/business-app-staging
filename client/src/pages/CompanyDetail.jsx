import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import api from '../api';
import { FiArrowLeft, FiEdit2, FiPlus, FiPhone, FiMail, FiMessageSquare } from 'react-icons/fi';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommForm, setShowCommForm] = useState(false);
  const [comm, setComm] = useState({ type: 'phone_call', subject: '', body: '' });

  useEffect(() => {
    api.get(`/api/companies/${id}`).then(r => {
      setCompany(r.data);
      setLoading(false);
    });
  }, [id]);

  const addComm = async () => {
    await api.post('/api/communications', { ...comm, company_id: id });
    const r = await api.get(`/api/companies/${id}`);
    setCompany(r.data);
    setShowCommForm(false);
    setComm({ type: 'phone_call', subject: '', body: '' });
  };

  if (loading) return <Layout><p style={{ padding: 40, color: 'var(--text-light)' }}>Chargement...</p></Layout>;

  const commIcons = { phone_call: <FiPhone />, email: <FiMail />, meeting: <FiMessageSquare />, whatsapp: <FiMessageSquare />, sms: <FiMessageSquare />, note: <FiEdit2 /> };
  const commLabels = { phone_call: 'Appel', email: 'Email', meeting: 'Réunion', whatsapp: 'WhatsApp', sms: 'SMS', note: 'Note' };

  return (
    <Layout>
      <PageHeader
        title={company.name}
        subtitle={`${company.industry || ''} ${company.city ? '· ' + company.city : ''}`}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Info */}
        <Card>
          <h3 style={{ marginBottom: 16, color: 'var(--accent-dark)' }}>Informations</h3>
          {[
            ['Secteur', company.industry],
            ['Adresse', company.address],
            ['Ville', company.city],
            ['Pays', company.country],
            ['Site web', company.website],
          ].map(([label, value]) => value && (
            <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <span style={{ color: 'var(--text-light)', fontSize: 13, minWidth: 80 }}>{label}</span>
              <span style={{ fontSize: 13 }}>{value}</span>
            </div>
          ))}
          {company.notes && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg)', borderRadius: 6, fontSize: 13 }}>
              {company.notes}
            </div>
          )}
        </Card>

        {/* Contacts */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: 'var(--accent-dark)' }}>Contacts</h3>
            <button onClick={() => navigate(`/contacts/new?company_id=${id}`)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: 6, padding: '6px 12px',
              fontSize: 13, cursor: 'pointer'
            }}>
              <FiPlus /> Ajouter
            </button>
          </div>
          {!company.contacts || company.contacts.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: 13 }}>Aucun contact</p>
          ) : company.contacts.map(c => (
            <div key={c.id} onClick={() => navigate(`/contacts/${c.id}`)} style={{
              padding: '10px 12px', borderRadius: 6, marginBottom: 8,
              background: 'var(--bg)', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.first_name} {c.last_name}</div>
                <div style={{ color: 'var(--text-light)', fontSize: 12 }}>{c.role}</div>
              </div>
              <div style={{ color: 'var(--text-light)', fontSize: 12 }}>{c.email}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Communications */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--accent-dark)' }}>Journal de communication</h3>
          <button onClick={() => setShowCommForm(!showCommForm)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: 6, padding: '6px 12px',
            fontSize: 13, cursor: 'pointer'
          }}>
            <FiPlus /> Ajouter
          </button>
        </div>

        {showCommForm && (
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <select value={comm.type} onChange={e => setComm({ ...comm, type: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
                {['phone_call', 'email', 'meeting', 'whatsapp', 'sms', 'note'].map(t => (
                  <option key={t} value={t}>{commLabels[t]}</option>
                ))}
              </select>
              <input placeholder="Sujet" value={comm.subject}
                onChange={e => setComm({ ...comm, subject: e.target.value })}
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
            </div>
            <textarea placeholder="Notes..." value={comm.body}
              onChange={e => setComm({ ...comm, body: e.target.value })}
              rows={3} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={addComm} style={{
                background: 'var(--accent)', color: 'white', border: 'none',
                borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 14
              }}>Enregistrer</button>
              <button onClick={() => setShowCommForm(false)} style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 14
              }}>Annuler</button>
            </div>
          </div>
        )}

        {!company.communications || company.communications.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontSize: 13 }}>Aucune communication enregistrée</p>
        ) : company.communications.map(c => (
          <div key={c.id} style={{
            display: 'flex', gap: 14, padding: '12px 0',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{
              background: 'var(--accent)', color: 'white',
              borderRadius: 8, padding: 8, height: 'fit-content'
            }}>
              {commIcons[c.type] || <FiMessageSquare />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.subject}</span>
                <span style={{ color: 'var(--text-light)', fontSize: 12 }}>
                  {new Date(c.comm_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div style={{ color: 'var(--text-light)', fontSize: 12, marginTop: 2 }}>{commLabels[c.type]}</div>
              {c.body && <p style={{ fontSize: 13, marginTop: 6 }}>{c.body}</p>}
            </div>
          </div>
        ))}
      </Card>
    </Layout>
  );
};

export default CompanyDetail;