const pool = require('../db/pool');

// GET ALL
const getCommunications = async (req, res) => {
  try {
    const { company_id, contact_id, proposal_id, po_id, project_id } = req.query;

    let conditions = ['cm.tenant_id = $1'];
    let params = [req.user.tenantId];
    let i = 2;

    if (company_id)  { conditions.push(`cm.company_id = $${i++}`);  params.push(company_id); }
    if (proposal_id) { conditions.push(`cl.proposal_id = $${i++}`); params.push(proposal_id); }
    if (po_id)       { conditions.push(`cl.po_id = $${i++}`);       params.push(po_id); }
    if (project_id)  { conditions.push(`cl.project_id = $${i++}`);  params.push(project_id); }
    if (contact_id)  { conditions.push(`cc.contact_id = $${i++}`);  params.push(contact_id); }

    const result = await pool.query(
      `SELECT DISTINCT cm.*,
        u.first_name || ' ' || u.last_name as author,
        c.name as company_name,
        -- Contacts liés (array)
        (SELECT json_agg(jsonb_build_object(
          'id', ct.id,
          'name', ct.first_name || ' ' || ct.last_name,
          'role', ct.role
        ))
        FROM communication_contacts cc2
        JOIN contacts ct ON ct.id = cc2.contact_id
        WHERE cc2.communication_id = cm.id) as contacts,
        -- Liens (projets, proposals, PO)
        (SELECT json_agg(jsonb_build_object(
          'proposal_id', cl2.proposal_id,
          'proposal_ref', p.reference,
          'po_id', cl2.po_id,
          'po_ref', po.reference,
          'project_id', cl2.project_id,
          'project_ref', pj.reference
        ))
        FROM communication_links cl2
        LEFT JOIN proposals p ON p.id = cl2.proposal_id
        LEFT JOIN purchase_orders po ON po.id = cl2.po_id
        LEFT JOIN projects pj ON pj.id = cl2.project_id
        WHERE cl2.communication_id = cm.id) as links
       FROM communications cm
       LEFT JOIN users u ON u.id = cm.created_by
       LEFT JOIN companies c ON c.id = cm.company_id
       LEFT JOIN communication_contacts cc ON cc.communication_id = cm.id
       LEFT JOIN communication_links cl ON cl.communication_id = cm.id
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
  const {
    type, subject, body, comm_date,
    company_id, contact_ids,
    proposal_ids, po_ids, project_ids,
    next_action, next_action_date, duration_minutes
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert communication
    const result = await client.query(
      `INSERT INTO communications
        (tenant_id, type, subject, body, comm_date,
         company_id, next_action, next_action_date, duration_minutes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        req.user.tenantId, type, subject, body,
        comm_date || new Date(),
        company_id || null,
        next_action || null,
        next_action_date || null,
        duration_minutes || null,
        req.user.userId
      ]
    );
    const comm = result.rows[0];

    // Link contacts
    if (contact_ids && contact_ids.length > 0) {
      for (const contact_id of contact_ids) {
        await client.query(
          `INSERT INTO communication_contacts (communication_id, contact_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [comm.id, contact_id]
        );
      }
    }

    // Link proposals
    if (proposal_ids && proposal_ids.length > 0) {
      for (const proposal_id of proposal_ids) {
        await client.query(
          `INSERT INTO communication_links (communication_id, proposal_id) VALUES ($1, $2)`,
          [comm.id, proposal_id]
        );
      }
    }

    // Link POs
    if (po_ids && po_ids.length > 0) {
      for (const po_id of po_ids) {
        await client.query(
          `INSERT INTO communication_links (communication_id, po_id) VALUES ($1, $2)`,
          [comm.id, po_id]
        );
      }
    }

    // Link projects
    if (project_ids && project_ids.length > 0) {
      for (const project_id of project_ids) {
        await client.query(
          `INSERT INTO communication_links (communication_id, project_id) VALUES ($1, $2)`,
          [comm.id, project_id]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(comm);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
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