const pool = require('../db/pool');

// GET ALL - filtrable par company, contact, proposal, po
const getCommunications = async (req, res) => {
  try {
    const { company_id, contact_id, proposal_id, po_id } = req.query;

    let conditions = ['cm.tenant_id = $1'];
    let params = [req.user.tenantId];
    let i = 2;

    if (company_id)  { conditions.push(`cm.company_id = $${i++}`);  params.push(company_id); }
    if (contact_id)  { conditions.push(`cm.contact_id = $${i++}`);  params.push(contact_id); }
    if (proposal_id) { conditions.push(`cm.proposal_id = $${i++}`); params.push(proposal_id); }
    if (po_id)       { conditions.push(`cm.po_id = $${i++}`);       params.push(po_id); }

    const result = await pool.query(
      `SELECT cm.*,
        u.first_name || ' ' || u.last_name as author,
        c.name as company_name,
        ct.first_name || ' ' || ct.last_name as contact_name
       FROM communications cm
       LEFT JOIN users u ON u.id = cm.created_by
       LEFT JOIN companies c ON c.id = cm.company_id
       LEFT JOIN contacts ct ON ct.id = cm.contact_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY cm.comm_date DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
const createCommunication = async (req, res) => {
  const { type, subject, body, comm_date, company_id, contact_id, proposal_id, po_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO communications
        (tenant_id, type, subject, body, comm_date, company_id, contact_id, proposal_id, po_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.user.tenantId, type, subject, body,
        comm_date || new Date(),
        company_id || null,
        contact_id || null,
        proposal_id || null,
        po_id || null,
        req.user.userId
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
const deleteCommunication = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM communications WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Communication not found' });
    }
    res.json({ message: 'Communication deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCommunications, createCommunication, deleteCommunication };