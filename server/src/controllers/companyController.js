const pool = require('../db/pool');

// GET ALL
const getCompanies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM companies 
       WHERE tenant_id = $1 
       ORDER BY name ASC`,
      [req.user.tenantId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
const getCompany = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
        json_agg(DISTINCT jsonb_build_object(
          'id', ct.id,
          'first_name', ct.first_name,
          'last_name', ct.last_name,
          'role', ct.role,
          'email', ct.email,
          'phone', ct.phone
        )) FILTER (WHERE ct.id IS NOT NULL) as contacts,
        json_agg(DISTINCT jsonb_build_object(
          'id', cm.id,
          'type', cm.type,
          'subject', cm.subject,
          'body', cm.body,
          'comm_date', cm.comm_date
        )) FILTER (WHERE cm.id IS NOT NULL) as communications
       FROM companies c
       LEFT JOIN contacts ct ON ct.company_id = c.id
       LEFT JOIN communications cm ON cm.company_id = c.id
       WHERE c.id = $1 AND c.tenant_id = $2
       GROUP BY c.id`,
      [req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
const createCompany = async (req, res) => {
  const { name, industry, website, address, city, country, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO companies 
        (tenant_id, name, industry, website, address, city, country, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.tenantId, name, industry, website, address, city, country, notes, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
const updateCompany = async (req, res) => {
  const { name, industry, website, address, city, country, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE companies SET
        name = COALESCE($1, name),
        industry = COALESCE($2, industry),
        website = COALESCE($3, website),
        address = COALESCE($4, address),
        city = COALESCE($5, city),
        country = COALESCE($6, country),
        notes = COALESCE($7, notes),
        updated_at = NOW()
       WHERE id = $8 AND tenant_id = $9
       RETURNING *`,
      [name, industry, website, address, city, country, notes, req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
const deleteCompany = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM companies WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCompanies, getCompany, createCompany, updateCompany, deleteCompany };