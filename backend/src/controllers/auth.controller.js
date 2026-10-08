const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const [users] = await pool.query(
      'SELECT staff_id, name, role, phone, email, password FROM staff WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Support both plaintext (for initial demo/seeding) or bcrypt hash
    let passwordMatches = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      passwordMatches = (user.password === password);
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { staff_id: user.staff_id, name: user.name, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'blood_bank_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          staff_id: user.staff_id,
          name: user.name,
          role: user.role,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me
async function getProfile(req, res, next) {
  try {
    const [users] = await pool.query(
      'SELECT staff_id, name, role, phone, email FROM staff WHERE staff_id = ?',
      [req.user.staff_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/staff - List all staff members
async function getAllStaff(req, res, next) {
  try {
    const [staff] = await pool.query(
      'SELECT staff_id, name, role, phone, email FROM staff ORDER BY staff_id ASC'
    );

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getProfile,
  getAllStaff
};
