const pool = require('../db/pool');

const getProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pj.*,
        c.name as company_name,
        ct.first_name || ' ' || ct.last_name as contact_name,
        p.reference as proposal_reference
       FROM projects pj
       LEFT JOIN companies c ON c.id = pj.company_id
       LEFT JOIN contacts ct ON ct.id = pj.contact_id
       LEFT JOIN proposals p ON p.id = pj.proposal_id
       WHERE pj.tenant_id = $1
       ORDER BY pj.created_at DESC`,
      [req.user.tenantId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pj.*,
        c.name as company_name,
        ct.first_name || ' ' || ct.last_name as contact_name
       FROM projects pj
       LEFT JOIN companies c ON c.id = pj.company_id
       LEFT JOIN contacts ct ON ct.id = pj.contact_id
       WHERE pj.id = $1 AND pj.tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createProject = async (req, res) => {
  const { reference, proposal_id, company_id, contact_id, title, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO projects
        (tenant_id, reference, proposal_id, company_id, contact_id, title, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [req.user.tenantId, reference, proposal_id, company_id, contact_id, title, notes, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProject = async (req, res) => {
  const { phase, title, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE projects SET
        phase = COALESCE($1, phase),
        title = COALESCE($2, title),
        notes = COALESCE($3, notes),
        updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [phase, title, notes, req.params.id, req.user.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject };