const { pool } = require('../config/database');

// GET /api/hospitals - Retrieve all registered hospitals
async function getAllHospitals(req, res, next) {
  try {
    const [hospitals] = await pool.query(`
      SELECT 
        hospital_id,
        name,
        address,
        contact,
        email
      FROM hospitals
      ORDER BY hospital_id DESC
    `);

    res.json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/hospitals/:id - Retrieve a single hospital with its blood requests
async function getHospitalById(req, res, next) {
  try {
    const { id } = req.params;
    const [hospitals] = await pool.query(
      'SELECT hospital_id, name, address, contact, email FROM hospitals WHERE hospital_id = ?',
      [id]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    const [requests] = await pool.query(
      `SELECT 
        br.request_id,
        br.blood_group_id,
        bg.group_name AS blood_group,
        br.quantity_required,
        br.request_date,
        br.urgency,
        br.status
       FROM blood_requests br
       JOIN blood_groups bg ON br.blood_group_id = bg.blood_group_id
       WHERE br.hospital_id = ?
       ORDER BY br.request_id DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...hospitals[0],
        requests
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/hospitals - Register a new hospital
async function createHospital(req, res, next) {
  try {
    const { name, address, contact, email } = req.body;

    if (!name || !contact) {
      return res.status(400).json({
        success: false,
        message: 'Hospital name and contact number are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO hospitals (name, address, contact, email) VALUES (?, ?, ?, ?)',
      [name, address || null, contact, email || null]
    );

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully',
      data: {
        hospital_id: result.insertId,
        name,
        address,
        contact,
        email
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A hospital with this email already exists'
      });
    }
    next(error);
  }
}

// PUT /api/hospitals/:id - Update hospital details
async function updateHospital(req, res, next) {
  try {
    const { id } = req.params;
    const { name, address, contact, email } = req.body;

    const [result] = await pool.query(
      `UPDATE hospitals 
       SET name = COALESCE(?, name),
           address = COALESCE(?, address),
           contact = COALESCE(?, contact),
           email = COALESCE(?, email)
       WHERE hospital_id = ?`,
      [name, address, contact, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      message: 'Hospital details updated successfully'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A hospital with this email already exists'
      });
    }
    next(error);
  }
}

// DELETE /api/hospitals/:id - Delete hospital
async function deleteHospital(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM hospitals WHERE hospital_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      message: 'Hospital deleted successfully'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete hospital because associated blood requests exist'
      });
    }
    next(error);
  }
}

module.exports = {
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital
};
