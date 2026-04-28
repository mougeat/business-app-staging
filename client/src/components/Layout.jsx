import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main style={{
      marginLeft: 'var(--sidebar-width)',
      flex: 1,
      padding: '32px',
      minHeight: '100vh',
      background: 'var(--bg)'
    }}>
      {children}
    </main>
  </div>
);

export default Layout;