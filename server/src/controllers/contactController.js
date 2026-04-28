const pool = require('../db/pool');

// GET ALL
const getContacts = async (req, res) => {
  try {
    const { company_id } = req.query;
    let query = `
      SELECT ct.*, c.name as company_name
      FROM contacts ct
      LEFT JOIN companies c ON c.id = ct.company_id
      WHERE ct.tenant_id = $1
    `;
    const params = [req.user.tenantId];

    if (company_id) {
      query += ` AND ct.company_id = $2`;
      params.push(company_id);
    }

    query += ` ORDER BY ct.last_name ASC, ct.first_name ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
const getContact = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ct.*, c.name as company_name,
        json_agg(DISTINCT jsonb_build_object(
          'id', cm.id,
          'type', cm.type,
          'subject', cm.subject,
          'body', cm.body,
          'comm_date', cm.comm_date
        )) FILTER (WHERE cm.id IS NOT NULL) as communications
       FROM contacts ct
       LEFT JOIN companies c ON c.id = ct.company_id
       LEFT JOIN communications cm ON cm.contact_id = ct.id
       WHERE ct.id = $1 AND ct.tenant_id = $2
       GROUP BY ct.id, c.name`,
      [req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
const createContact = async (req, res) => {
  const { company_id, first_name, last_name, role, email, phone, whatsapp, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO contacts
        (tenant_id, company_id, first_name, last_name, role, email, phone, whatsapp, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.tenantId, company_id, first_name, last_name, role, email, phone, whatsapp, notes, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
const updateContact = async (req, res) => {
  const { company_id, first_name, last_name, role, email, phone, whatsapp, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE contacts SET
        company_id = COALESCE($1, company_id),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        role = COALESCE($4, role),
        email = COALESCE($5, email),
        phone = COALESCE($6, phone),
        whatsapp = COALESCE($7, whatsapp),
        notes = COALESCE($8, notes),
        updated_at = NOW()
       WHERE id = $9 AND tenant_id = $10
       RETURNING *`,
      [company_id, first_name, last_name, role, email, phone, whatsapp, notes, req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
const deleteContact = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM contacts WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getContacts, getContact, createContact, updateContact, deleteContact };