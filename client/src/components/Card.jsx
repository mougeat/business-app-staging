const Card = ({ children, style }) => (
  <div style={{
    background: 'var(--white)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    padding: 24,
    ...style
  }}>
    {children}
  </div>
);

export default Card;