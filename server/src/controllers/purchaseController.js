const pool = require('../db/pool');

const getPurchases = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT po.*,
        c.name as supplier_name,
        p.reference as proposal_reference
       FROM purchase_orders po
       LEFT JOIN companies c ON c.id = po.supplier_company_id
       LEFT JOIN proposals p ON p.id = po.proposal_id
       WHERE po.tenant_id = $1
       ORDER BY po.created_at DESC`,
      [req.user.tenantId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPurchase = async (req, res) => {
  try {
    const po = await pool.query(
      `SELECT po.*, c.name as supplier_name
       FROM purchase_orders po
       LEFT JOIN companies c ON c.id = po.supplier_company_id
       WHERE po.id = $1 AND po.tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    );
    if (po.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const drawings = await pool.query(
      `SELECT * FROM drawings WHERE po_id = $1 ORDER BY version DESC`,
      [req.params.id]
    );

    const communications = await pool.query(
      `SELECT cm.*, u.first_name || ' ' || u.last_name as author
       FROM communications cm
       LEFT JOIN users u ON u.id = cm.created_by
       WHERE cm.po_id = $1 ORDER BY cm.comm_date DESC`,
      [req.params.id]
    );

    res.json({
      ...po.rows[0],
      drawings: drawings.rows,
      communications: communications.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPurchase = async (req, res) => {
  const {
    proposal_id, reference, supplier_company_id, supplier_contact_id,
    date_delivery_expected, notes
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO purchase_orders
        (tenant_id, proposal_id, reference, supplier_company_id, supplier_contact_id,
         date_delivery_expected, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [req.user.tenantId, proposal_id, reference, supplier_company_id,
       supplier_contact_id, date_delivery_expected, notes, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePurchase = async (req, res) => {
  const {
    status, date_rfq_sent, date_prices_received, date_order_placed,
    date_delivery_expected, date_delivered, date_invoiced,
    invoice_number, invoice_amount, invoice_paid, date_paid, notes
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE purchase_orders SET
        status = COALESCE($1, status),
        date_rfq_sent = COALESCE($2, date_rfq_sent),
        date_prices_received = COALESCE($3, date_prices_received),
        date_order_placed = COALESCE($4, date_order_placed),
        date_delivery_expected = COALESCE($5, date_delivery_expected),
        date_delivered = COALESCE($6, date_delivered),
        date_invoiced = COALESCE($7, date_invoiced),
        invoice_number = COALESCE($8, invoice_number),
        invoice_amount = COALESCE($9, invoice_amount),
        invoice_paid = COALESCE($10, invoice_paid),
        date_paid = COALESCE($11, date_paid),
        notes = COALESCE($12, notes),
        updated_at = NOW()
       WHERE id = $13 AND tenant_id = $14
       RETURNING *`,
      [status, date_rfq_sent, date_prices_received, date_order_placed,
       date_delivery_expected, date_delivered, date_invoiced,
       invoice_number, invoice_amount, invoice_paid, date_paid, notes,
       req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM purchase_orders WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json({ message: 'Purchase order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPurchases, getPurchase, createPurchase, updatePurchase, deletePurchase };