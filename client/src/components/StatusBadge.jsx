const colors = {
  draft:          { bg: '#EEF2F7', text: '#5D7A9A' },
  sent:           { bg: '#EBF5FB', text: '#2E86C1' },
  under_review:   { bg: '#FEF9E7', text: '#D4AC0D' },
  approved:       { bg: '#EAFAF1', text: '#27AE60' },
  rejected:       { bg: '#FDEDEC', text: '#E74C3C' },
  expired:        { bg: '#F2F3F4', text: '#95A5A6' },
  rfq_sent:       { bg: '#EBF5FB', text: '#2E86C1' },
  order_placed:   { bg: '#EBF5FB', text: '#1A5276' },
  delivered:      { bg: '#EAFAF1', text: '#27AE60' },
  invoiced:       { bg: '#F5EEF8', text: '#8E44AD' },
  closed:         { bg: '#F2F3F4', text: '#95A5A6' },
  proposal:       { bg: '#EBF5FB', text: '#2E86C1' },
  purchase:       { bg: '#FEF9E7', text: '#D4AC0D' },
  delivery:       { bg: '#EAFAF1', text: '#27AE60' },
};

const labels = {
  draft: 'Brouillon', sent: 'Envoyé', under_review: 'En révision',
  approved: 'Approuvé', rejected: 'Rejeté', expired: 'Expiré',
  rfq_sent: 'Appel d\'offres', order_placed: 'Commandé',
  delivered: 'Livré', invoiced: 'Facturé', closed: 'Clôturé',
  proposal: 'Proposition', purchase: 'Achat', delivery: 'Livraison',
};

const StatusBadge = ({ status }) => {
  const color = colors[status] || { bg: '#F2F3F4', text: '#95A5A6' };
  return (
    <span style={{
      background: color.bg, color: color.text,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600
    }}>
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;