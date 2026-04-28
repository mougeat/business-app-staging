import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import api from '../api';
import { FiPlus, FiSearch, FiChevronRight } from 'react-icons/fi';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/companies').then(r => {
      setCompanies(r.data);
      setLoading(false);
    });
  }, []);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <PageHeader
        title="Entreprises"
        subtitle={`${companies.length} entreprise${companies.length !== 1 ? 's' : ''}`}
        action={
          <button
            onClick={() => navigate('/companies/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: 6, padding: '10px 18px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <FiPlus /> Nouvelle entreprise
          </button>
        }
      />

      <Card>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid var(--border)', borderRadius: 6,
          padding: '8px 14px', marginBottom: 20
        }}>
          <FiSearch color="var(--text-light)" />
          <input
            placeholder="Rechercher une entreprise..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 14, flex: 1 }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 40 }}>
            Chargement...
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 40 }}>
            Aucune entreprise trouvée
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Nom', 'Secteur', 'Ville', 'Pays', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    fontSize: 12, color: 'var(--text-light)',
                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/companies/${c.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '12px', color: 'var(--text-light)' }}>{c.industry || '—'}</td>
                  <td style={{ padding: '12px', color: 'var(--text-light)' }}>{c.city || '—'}</td>
                  <td style={{ padding: '12px', color: 'var(--text-light)' }}>{c.country || '—'}</td>
                  <td style={{ padding: '12px', color: 'var(--text-light)' }}>
                    <FiChevronRight />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </Layout>
  );
};

export default Companies;