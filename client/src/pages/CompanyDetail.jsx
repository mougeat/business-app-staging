import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import CommunicationLog from '../components/CommunicationLog';
import api from '../api';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/companies/${id}`).then(r => {
      setCompany(r.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Layout><p style={{ padding: 40, color: 'var(--text-light)' }}>Chargement...</p></Layout>;

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

      {/* Communication Log */}
      <Card>
        <CommunicationLog companyId={id} />
      </Card>
    </Layout>
  );
};

export default CompanyDetail;