import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import api from '../api';
import { FiPlus, FiSearch, FiChevronRight } from 'react-icons/fi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/projects').then(r => {
      setProjects(r.data);
      setLoading(false);
    });
  }, []);

  const filtered = projects.filter(p =>
    (p.reference || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <PageHeader
        title="Projets"
        subtitle={`${projects.length} projet${projects.length !== 1 ? 's' : ''}`}
        action={
          <button onClick={() => navigate('/projects/new')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: 6, padding: '10px 18px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>
            <FiPlus /> Nouveau projet
          </button>
        }
      />
      <Card>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid var(--border)', borderRadius: 6,
          padding: '8px 14px', marginBottom: 20
        }}>
          <FiSearch color="var(--text-light)" />
          <input placeholder="Rechercher un projet..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 14, flex: 1 }} />
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 40 }}>Chargement...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 40 }}>Aucun projet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Référence', 'Titre', 'Client', 'Contact', 'Phase', 'Date', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    fontSize: 12, color: 'var(--text-light)',
                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--accent)' }}>{p.reference}</td>
                  <td style={{ padding: '12px' }}>{p.title || '—'}</td>
                  <td style={{ padding: '12px', color: 'var(--text-light)' }}>{p.company_name || '—'}</td>
                  <td style={{ padding: '12px', color: 'var(--text-light)' }}>{p.contact_name || '—'}</td>
                  <td style={{ padding: '12px' }}><StatusBadge status={p.phase} /></td>
                  <td style={{ padding: '12px', color: 'var(--text-light)', fontSize: 13 }}>
                    {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-light)' }}><FiChevronRight /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </Layout>
  );
};

export default Projects;