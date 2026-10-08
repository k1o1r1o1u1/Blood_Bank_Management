const { pool } = require('../config/database');

// GET /api/donors - Retrieve all donors with their blood group name
async function getAllDonors(req, res, next) {
  try {
    const [donors] = await pool.query(`
      SELECT 
        d.donor_id,
        d.name,
        d.age,
        d.gender,
        d.phone,
        d.address,
        d.blood_group_id,
        bg.group_name AS blood_group,
        d.last_donation_date
      FROM donors d
      LEFT JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
      ORDER BY d.donor_id DESC
    `);
    res.json({
      success: true,
      data: donors
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/donors/:id - Retrieve a single donor by ID
async function getDonorById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        d.donor_id,
        d.name,
        d.age,
        d.gender,
        d.phone,
        d.address,
        d.blood_group_id,
        bg.group_name AS blood_group,
        d.last_donation_date
      FROM donors d
      LEFT JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
      WHERE d.donor_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/donors - Create a new donor
async function createDonor(req, res, next) {
  try {
    const { name, age, gender, phone, address, blood_group_id } = req.body;

    if (!name || !age || !blood_group_id || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, age, phone, and blood_group_id are required fields'
      });
    }

    if (age < 18 || age > 65) {
      return res.status(400).json({
        success: false,
        message: 'Donor age must be between 18 and 65'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO donors (name, age, gender, phone, address, blood_group_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, age, gender || null, phone, address || null, blood_group_id]
    );

    res.status(201).json({
      success: true,
      message: 'Donor created successfully',
      data: {
        donor_id: result.insertId,
        name,
        age,
        gender,
        phone,
        address,
        blood_group_id
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A donor with this phone number already exists'
      });
    }
    next(error);
  }
}

// PUT /api/donors/:id - Update donor information
async function updateDonor(req, res, next) {
  try {
    const { id } = req.params;
    const { name, age, gender, phone, address, blood_group_id } = req.body;

    const [existing] = await pool.query('SELECT donor_id FROM donors WHERE donor_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    await pool.query(
      `UPDATE donors 
       SET name = COALESCE(?, name),
           age = COALESCE(?, age),
           gender = COALESCE(?, gender),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           blood_group_id = COALESCE(?, blood_group_id)
       WHERE donor_id = ?`,
      [name, age, gender, phone, address, blood_group_id, id]
    );

    res.json({
      success: true,
      message: 'Donor updated successfully'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A donor with this phone number already exists'
      });
    }
    next(error);
  }
}

// DELETE /api/donors/:id - Delete a donor
async function deleteDonor(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM donors WHERE donor_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.json({
      success: true,
      message: 'Donor deleted successfully'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete donor because donation records exist for them'
      });
    }
    next(error);
  }
}

module.exports = {
  getAllDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor
};
