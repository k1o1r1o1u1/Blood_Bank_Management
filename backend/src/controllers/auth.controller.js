const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// POST /api/auth/login - Multi-role Authentication (Admin, Staff, Hospital, Donor)
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    let user = null;
    let role = null;
    let entityData = {};

    // 1. Check Staff (Admin & Staff roles)
    const [staffUsers] = await pool.query(
      'SELECT staff_id, name, role, phone, email, password FROM staff WHERE LOWER(email) = ?',
      [trimmedEmail]
    );

    if (staffUsers.length > 0) {
      user = staffUsers[0];
      role = user.role; // 'Admin' or 'Staff'
      entityData = { staff_id: user.staff_id };
    } else {
      // 2. Check Hospitals
      const [hospitals] = await pool.query(
        'SELECT hospital_id, name, address, contact, email, password, role FROM hospitals WHERE LOWER(email) = ?',
        [trimmedEmail]
      );

      if (hospitals.length > 0) {
        user = hospitals[0];
        role = 'Hospital';
        entityData = { hospital_id: user.hospital_id, contact: user.contact };
      } else {
        // 3. Check Donors
        const [donors] = await pool.query(
          `SELECT d.donor_id, d.name, d.email, d.password, d.role, d.phone, d.blood_group_id, bg.group_name AS blood_group, d.last_donation_date 
           FROM donors d 
           LEFT JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id 
           WHERE LOWER(d.email) = ?`,
          [trimmedEmail]
        );

        if (donors.length > 0) {
          user = donors[0];
          role = 'Donor';
          entityData = {
            donor_id: user.donor_id,
            blood_group: user.blood_group,
            blood_group_id: user.blood_group_id,
            last_donation_date: user.last_donation_date
          };
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: User account not found'
      });
    }

    // Password verification: supports both bcrypt hashes and plaintext development passwords
    let passwordMatches = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      passwordMatches = (user.password === password);
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const payload = {
      ...entityData,
      name: user.name,
      role: role,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'blood_bank_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      success: true,
      message: `Logged in successfully as ${role}`,
      data: {
        token,
        user: {
          ...entityData,
          name: user.name,
          role: role,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me - Retrieve current authenticated user profile across all roles
async function getProfile(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const role = req.user.role;

    if (role === 'Admin' || role === 'Staff') {
      const [users] = await pool.query(
        'SELECT staff_id, name, role, phone, email FROM staff WHERE staff_id = ?',
        [req.user.staff_id]
      );
      if (users.length === 0) return res.status(404).json({ success: false, message: 'Staff member not found' });
      return res.json({ success: true, data: { ...users[0], role } });
    }

    if (role === 'Hospital') {
      const [hospitals] = await pool.query(
        'SELECT hospital_id, name, address, contact, email, role FROM hospitals WHERE hospital_id = ?',
        [req.user.hospital_id]
      );
      if (hospitals.length === 0) return res.status(404).json({ success: false, message: 'Hospital account not found' });
      return res.json({ success: true, data: { ...hospitals[0], role: 'Hospital' } });
    }

    if (role === 'Donor') {
      const [donors] = await pool.query(`
        SELECT d.donor_id, d.name, d.email, d.role, d.phone, d.address, d.age, d.gender, d.blood_group_id, bg.group_name AS blood_group, d.last_donation_date
        FROM donors d
        LEFT JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
        WHERE d.donor_id = ?
      `, [req.user.donor_id]);
      if (donors.length === 0) return res.status(404).json({ success: false, message: 'Donor account not found' });
      return res.json({ success: true, data: { ...donors[0], role: 'Donor' } });
    }

    res.status(400).json({ success: false, message: 'Unknown role' });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/staff - List staff members
async function getAllStaff(req, res, next) {
  try {
    const [staff] = await pool.query(
      'SELECT staff_id, name, role, phone, email FROM staff ORDER BY staff_id ASC'
    );
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getProfile,
  getAllStaff
};
