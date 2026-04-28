import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiUsers, FiUser, FiFileText,
  FiShoppingCart, FiBriefcase, FiLogOut,
  FiChevronDown, FiChevronRight, FiMenu, FiX
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [crmOpen, setCrmOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'none',
          position: 'fixed', top: 12, left: 12,
          zIndex: 1000, background: 'var(--accent)',
          border: 'none', borderRadius: 6, padding: '8px',
          color: 'white', cursor: 'pointer'
        }}
        className="mobile-toggle"
      >
        {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
      </button>

      <aside style={{
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        height: '100vh',
        position: 'fixed',
        left: 0, top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'transform 0.3s ease',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
            ISPAG
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
            {user?.tenant_name || 'Business App'}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          <NavItem to="/dashboard" icon={<FiHome />} label="Dashboard" />

          {/* CRM Group */}
          <div
            onClick={() => setCrmOpen(!crmOpen)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', fontSize: 11,
              textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600,
              userSelect: 'none'
            }}
          >
            <span>CRM</span>
            {crmOpen ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
          </div>
          {crmOpen && (
            <>
              <NavItem to="/companies" icon={<FiUsers />} label="Entreprises" indent />
              <NavItem to="/contacts" icon={<FiUser />} label="Contacts" indent />
            </>
          )}

          <div style={{
            padding: '10px 20px', marginTop: 8,
            color: 'rgba(255,255,255,0.5)', fontSize: 11,
            textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600
          }}>
            Activité
          </div>
          <NavItem to="/projects" icon={<FiBriefcase />} label="Projets" />
          <NavItem to="/proposals" icon={<FiFileText />} label="Propositions" />
          <NavItem to="/purchases" icon={<FiShoppingCart />} label="Achats" />
        </nav>

        {/* User */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 8 }}>
            {user?.first_name} {user?.last_name}
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.1)', border: 'none',
            borderRadius: 6, padding: '8px 12px', color: 'white',
            cursor: 'pointer', fontSize: 13, width: '100%'
          }}>
            <FiLogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ to, icon, label, indent }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: `10px 20px 10px ${indent ? '36px' : '20px'}`,
      color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
      background: isActive ? 'rgba(46,134,193,0.3)' : 'transparent',
      borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
      textDecoration: 'none', fontSize: 14,
      transition: 'all 0.2s'
    })}
  >
    {icon} {label}
  </NavLink>
);

export default Sidebar;