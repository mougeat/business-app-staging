const PageHeader = ({ title, subtitle, action }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 28
  }}>
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-dark)' }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: 'var(--text-light)', marginTop: 4, fontSize: 14 }}>
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default PageHeader;