import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FiUsers, FiFileText, FiShoppingCart, FiBriefcase } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ companies: 0, proposals: 0, purchases: 0, projects: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [c, p, pu, pr] = await Promise.all([
          api.get('/api/companies'),
          api.get('/api/proposals'),
          api.get('/api/purchases'),
          api.get('/api/projects'),
        ]);
        setStats({
          companies: c.data.length,
          proposals: p.data.length,
          purchases: pu.data.length,
          projects: pr.data.length,
        });
      } catch (err) {}
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Entreprises', value: stats.companies, icon: <FiUsers size={24} />, color: '#2E86C1' },
    { label: 'Propositions', value: stats.proposals, icon: <FiFileText size={24} />, color: '#27AE60' },
    { label: 'Achats', value: stats.purchases, icon: <FiShoppingCart size={24} />, color: '#F39C12' },
    { label: 'Projets', value: stats.projects, icon: <FiBriefcase size={24} />, color: '#8E44AD' },
  ];

  return (
    <Layout>
      <PageHeader
        title={`Bonjour, ${user?.first_name} 👋`}
        subtitle="Voici un résumé de votre activité"
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20, marginBottom: 32
      }}>
        {cards.map(card => (
          <Card key={card.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>
                  {card.value}
                </div>
                <div style={{ color: 'var(--text-light)', fontSize: 14, marginTop: 4 }}>
                  {card.label}
                </div>
              </div>
              <div style={{
                background: card.color + '18',
                borderRadius: 12, padding: 12,
                color: card.color
              }}>
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Dashboard;