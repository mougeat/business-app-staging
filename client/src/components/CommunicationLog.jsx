import { useState, useEffect } from 'react';
import api from '../api';
import {
  FiPhone, FiMail, FiUsers, FiMessageSquare,
  FiFileText, FiPlus, FiTrash2, FiChevronDown, FiChevronUp,
  FiCalendar, FiClock, FiAlertCircle
} from 'react-icons/fi';

const COMM_TYPES = [
  { value: 'meeting', label: 'Réunion', icon: <FiUsers /> },
  { value: 'phone_call', label: 'Appel téléphonique', icon: <FiPhone /> },
  { value: 'email', label: 'Email', icon: <FiMail /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <FiMessageSquare /> },
  { value: 'sms', label: 'SMS', icon: <FiMessageSquare /> },
  { value: 'note', label: 'Note interne', icon: <FiFileText /> },
];

const typeColor = {
  meeting: '#8E44AD', phone_call: '#2E86C1', email: '#27AE60',
  whatsapp: '#25D366', sms: '#F39C12', note: '#7F8C9A'
};

const CommunicationLog = ({ companyId, contactId, proposalId, poId, projectId }) => {
  const [comms, setComms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState({
    type: 'meeting',
    subject: '',
    body: '',
    comm_date: new Date().toISOString().slice(0, 16),
    duration_minutes: '',
    company_id: companyId || '',
    contact_ids: contactId ? [contactId] : [],
    proposal_ids: proposalId ? [proposalId] : [],
    po_ids: poId ? [poId] : [],
    project_ids: projectId ? [projectId] : [],
    next_action: '',
    next_action_date: '',
  });

  useEffect(() => {
    fetchComms();
    api.get('/api/companies').then(r => setCompanies(r.data));
    api.get('/api/proposals').then(r => setProposals(r.data));
    api.get('/api/projects').then(r => setProjects(r.data));
    api.get('/api/purchases').then(r => setPurchases(r.data));
  }, []);

  useEffect(() => {
    if (form.company_id) {
      api.get(`/api/contacts?company_id=${form.company_id}`).then(r => setContacts(r.data));
    } else {
      api.get('/api/contacts').then(r => setContacts(r.data));
    }
  }, [form.company_id]);

  const fetchComms = async () => {
    const params = new URLSearchParams();
    if (companyId)  params.append('company_id', companyId);
    if (contactId)  params.append('contact_id', contactId);
    if (proposalId) params.append('proposal_id', proposalId);
    if (poId)       params.append('po_id', poId);
    if (projectId)  params.append('project_id', projectId);
    const r = await api.get(`/api/communications?${params}`);
    setComms(r.data);
  };

  const toggleMulti = (field, value) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value]
    }));
  };

  const handleSubmit = async () => {
    if (!form.subject) return alert('Le sujet est obligatoire');
    await api.post('/api/communications', form);
    await fetchComms();
    setShowForm(false);
    setForm(f => ({
      ...f,
      subject: '', body: '', next_action: '',
      next_action_date: '', duration_minutes: '',
      contact_ids: contactId ? [contactId] : [],
      proposal_ids: proposalId ? [proposalId] : [],
      po_ids: poId ? [poId] : [],
      project_ids: projectId ? [projectId] : [],
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette entrée ?')) return;
    await api.delete(`/api/communications/${id}`);
    fetchComms();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ color: 'var(--accent-dark)', fontSize: 16 }}>
          Journal de communication ({comms.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: 6, padding: '7px 14px',
          fontSize: 13, cursor: 'pointer', fontWeight: 600
        }}>
          <FiPlus /> Ajouter
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: '#F0F4F8', borderRadius: 10,
          padding: 20, marginBottom: 20,
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ marginBottom: 16, color: 'var(--accent-dark)' }}>Nouvelle entrée</h4>

          {/* Type selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {COMM_TYPES.map(t => (
              <button key={t.value} type="button"
                onClick={() => setForm(f => ({ ...f, type: t.value }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 20,
                  border: form.type === t.value ? `2px solid ${typeColor[t.value]}` : '2px solid var(--border)',
                  background: form.type === t.value ? typeColor[t.value] + '18' : 'white',
                  color: form.type === t.value ? typeColor[t.value] : 'var(--text-light)',
                  cursor: 'pointer', fontSize: 13, fontWeight: form.type === t.value ? 600 : 400
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Subject */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Sujet *</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Ex: Meeting présentation produits"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
            </div>

            {/* Date */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                <FiCalendar style={{ marginRight: 4 }} />Date et heure
              </label>
              <input type="datetime-local" value={form.comm_date}
                onChange={e => setForm(f => ({ ...f, comm_date: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
            </div>

            {/* Duration */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                <FiClock style={{ marginRight: 4 }} />Durée (minutes)
              </label>
              <input type="number" value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                placeholder="Ex: 60"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
            </div>

            {/* Company */}
            {!companyId && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Entreprise</label>
                <select value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value, contact_ids: [] }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
                  <option value="">— Sélectionner —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Contacts multi-select */}
          {contacts.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Contacts participants
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {contacts.map(c => (
                  <button key={c.id} type="button"
                    onClick={() => toggleMulti('contact_ids', c.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 13,
                      border: form.contact_ids.includes(c.id) ? '2px solid var(--accent)' : '2px solid var(--border)',
                      background: form.contact_ids.includes(c.id) ? '#EBF5FB' : 'white',
                      color: form.contact_ids.includes(c.id) ? 'var(--accent)' : 'var(--text)',
                      cursor: 'pointer', fontWeight: form.contact_ids.includes(c.id) ? 600 : 400
                    }}>
                    {c.first_name} {c.last_name}
                    {c.role && <span style={{ color: 'var(--text-light)', marginLeft: 4 }}>({c.role})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects multi-select */}
          {projects.length > 0 && !projectId && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Projets liés
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {projects.map(p => (
                  <button key={p.id} type="button"
                    onClick={() => toggleMulti('project_ids', p.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 13,
                      border: form.project_ids.includes(p.id) ? '2px solid #8E44AD' : '2px solid var(--border)',
                      background: form.project_ids.includes(p.id) ? '#F5EEF8' : 'white',
                      color: form.project_ids.includes(p.id) ? '#8E44AD' : 'var(--text)',
                      cursor: 'pointer', fontWeight: form.project_ids.includes(p.id) ? 600 : 400
                    }}>
                    {p.reference} {p.title ? `— ${p.title}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Proposals multi-select */}
          {proposals.length > 0 && !proposalId && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Propositions liées
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {proposals.map(p => (
                  <button key={p.id} type="button"
                    onClick={() => toggleMulti('proposal_ids', p.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 13,
                      border: form.proposal_ids.includes(p.id) ? '2px solid var(--accent)' : '2px solid var(--border)',
                      background: form.proposal_ids.includes(p.id) ? '#EBF5FB' : 'white',
                      color: form.proposal_ids.includes(p.id) ? 'var(--accent)' : 'var(--text)',
                      cursor: 'pointer', fontWeight: form.proposal_ids.includes(p.id) ? 600 : 400
                    }}>
                    {p.reference} {p.company_name ? `— ${p.company_name}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>
              Compte rendu
            </label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Détails de la communication, points discutés..."
              rows={4} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, resize: 'vertical' }} />
          </div>

          {/* Next action */}
          <div style={{ background: '#FEF9E7', borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
              <FiAlertCircle style={{ marginRight: 4, color: '#F39C12' }} />
              Prochaine action
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <input value={form.next_action} onChange={e => setForm(f => ({ ...f, next_action: e.target.value }))}
                placeholder="Ex: Envoyer la proposition révisée"
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
              <input type="date" value={form.next_action_date} onChange={e => setForm(f => ({ ...f, next_action_date: e.target.value }))}
                style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSubmit} style={{
              background: 'var(--accent)', color: 'white', border: 'none',
              borderRadius: 6, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>Enregistrer</button>
            <button onClick={() => setShowForm(false)} style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 6, padding: '9px 20px', fontSize: 14, cursor: 'pointer'
            }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {comms.length === 0 ? (
        <p style={{ color: 'var(--text-light)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>
          Aucune communication enregistrée
        </p>
      ) : (
        <div style={{ position: 'relative' }}>
          {comms.map((c, idx) => {
            const type = COMM_TYPES.find(t => t.value === c.type);
            const color = typeColor[c.type] || '#7F8C9A';
            const isExpanded = expanded === c.id;

            return (
              <div key={c.id} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 2
                }}>
                  {type?.icon}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1, background: 'white', borderRadius: 8,
                  border: '1px solid var(--border)', overflow: 'hidden'
                }}>
                  {/* Header */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : c.id)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{c.subject}</span>
                      <span style={{
                        marginLeft: 10, fontSize: 12, color: color,
                        background: color + '18', padding: '2px 8px', borderRadius: 10
                      }}>
                        {type?.label}
                      </span>
                      {c.duration_minutes && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-light)' }}>
                          <FiClock style={{ marginRight: 3 }} />{c.duration_minutes} min
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        {new Date(c.comm_date).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
                      {/* Contacts */}
                      {c.contacts && c.contacts.length > 0 && (
                        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {c.contacts.map(ct => (
                            <span key={ct.id} style={{
                              background: '#EBF5FB', color: 'var(--accent)',
                              padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600
                            }}>
                              {ct.name} {ct.role ? `(${ct.role})` : ''}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Links */}
                      {c.links && c.links.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {c.links.map((l, i) => (
                            <span key={i} style={{
                              background: '#F5EEF8', color: '#8E44AD',
                              padding: '3px 10px', borderRadius: 12, fontSize: 12
                            }}>
                              {l.project_ref && `Projet: ${l.project_ref}`}
                              {l.proposal_ref && `Proposition: ${l.proposal_ref}`}
                              {l.po_ref && `Achat: ${l.po_ref}`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Body */}
                      {c.body && (
                        <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
                          {c.body}
                        </p>
                      )}

                      {/* Next action */}
                      {c.next_action && (
                        <div style={{
                          marginTop: 12, background: '#FEF9E7',
                          borderRadius: 6, padding: '8px 12px',
                          display: 'flex', alignItems: 'center', gap: 8
                        }}>
                          <FiAlertCircle color="#F39C12" />
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Prochaine action : </span>
                            <span style={{ fontSize: 13 }}>{c.next_action}</span>
                            {c.next_action_date && (
                              <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 8 }}>
                                → {new Date(c.next_action_date).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Author + delete */}
                      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                          Par {c.author}
                        </span>
                        <button onClick={() => handleDelete(c.id)} style={{
                          background: 'transparent', border: 'none',
                          color: 'var(--danger)', cursor: 'pointer', fontSize: 12,
                          display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          <FiTrash2 size={13} /> Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunicationLog;