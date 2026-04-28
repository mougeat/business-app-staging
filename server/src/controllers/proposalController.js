const pool = require('../db/pool');

const getProposals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
        c.name as company_name,
        ct.first_name || ' ' || ct.last_name as contact_name
       FROM proposals p
       LEFT JOIN companies c ON c.id = p.company_id
       LEFT JOIN contacts ct ON ct.id = p.contact_id
       WHERE p.tenant_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.tenantId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProposal = async (req, res) => {
  try {
    const proposal = await pool.query(
      `SELECT p.*,
        c.name as company_name,
        ct.first_name || ' ' || ct.last_name as contact_name
       FROM proposals p
       LEFT JOIN companies c ON c.id = p.company_id
       LEFT JOIN contacts ct ON ct.id = p.contact_id
       WHERE p.id = $1 AND p.tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    );
    if (proposal.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const items = await pool.query(
      `SELECT * FROM proposal_items WHERE proposal_id = $1 ORDER BY sort_order`,
      [req.params.id]
    );

    const communications = await pool.query(
      `SELECT cm.*, u.first_name || ' ' || u.last_name as author
       FROM communications cm
       LEFT JOIN users u ON u.id = cm.created_by
       WHERE cm.proposal_id = $1 ORDER BY cm.comm_date DESC`,
      [req.params.id]
    );

    res.json({
      ...proposal.rows[0],
      items: items.rows,
      communications: communications.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createProposal = async (req, res) => {
  const {
    reference, company_id, contact_id, title, description,
    customer_doc_url, subtotal, tax_rate, total, currency,
    date_sent, date_expected, items
  } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO proposals
        (tenant_id, reference, company_id, contact_id, title, description,
         customer_doc_url, subtotal, tax_rate, total, currency,
         date_sent, date_expected, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [req.user.tenantId, reference, company_id, contact_id, title, description,
       customer_doc_url, subtotal, tax_rate || 20, total, currency || 'EUR',
       date_sent, date_expected, req.user.userId]
    );

    const proposal = result.rows[0];

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await client.query(
          `INSERT INTO proposal_items
            (proposal_id, product_id, diameter_mm, volume_liters, pressure_bar,
             fittings_count, exchanger_type, exchanger_spec, quantity, unit_price, line_total, notes, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [proposal.id, item.product_id, item.diameter_mm, item.volume_liters,
           item.pressure_bar, item.fittings_count, item.exchanger_type,
           item.exchanger_spec, item.quantity || 1, item.unit_price,
           item.line_total, item.notes, i]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(proposal);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

const updateProposal = async (req, res) => {
  const {
    status, title, description, subtotal, tax_rate, total,
    date_sent, date_expected, date_approved, date_expired
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE proposals SET
        status = COALESCE($1, status),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        subtotal = COALESCE($4, subtotal),
        tax_rate = COALESCE($5, tax_rate),
        total = COALESCE($6, total),
        date_sent = COALESCE($7, date_sent),
        date_expected = COALESCE($8, date_expected),
        date_approved = COALESCE($9, date_approved),
        date_expired = COALESCE($10, date_expired),
        updated_at = NOW()
       WHERE id = $11 AND tenant_id = $12
       RETURNING *`,
      [status, title, description, subtotal, tax_rate, total,
       date_sent, date_expected, date_approved, date_expired,
       req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProposal = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM proposals WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json({ message: 'Proposal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProposals, getProposal, createProposal, updateProposal, deleteProposal };