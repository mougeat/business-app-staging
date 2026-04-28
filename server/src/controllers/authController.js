const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// REGISTER
const register = async (req, res) => {
  const { email, password, first_name, last_name, tenant_name } = req.body;
  try {
    // Create tenant first
    const tenantSlug = tenant_name.toLowerCase().replace(/\s+/g, '-');
    const tenantResult = await pool.query(
      `INSERT INTO tenants (name, slug) VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = $1
       RETURNING id`,
      [tenant_name, tenantSlug]
    );
    const tenant_id = tenantResult.rows[0].id;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, 'admin') RETURNING id, email, first_name, last_name, role`,
      [tenant_id, email, password_hash, first_name, last_name]
    );

    const user = userResult.rows[0];
    const token = jwt.sign(
      { userId: user.id, tenantId: tenant_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT u.*, t.name as tenant_name FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        tenant_name: user.tenant_name
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ME
const me = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, t.name as tenant_name
       FROM users u JOIN tenants t ON t.id = u.tenant_id
       WHERE u.id = $1`,
      [req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, me };