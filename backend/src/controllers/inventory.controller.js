const { pool } = require('../config/database');

// GET /api/inventory - Get complete blood inventory summary for all blood groups
async function getInventorySummary(req, res, next) {
  try {
    const [summary] = await pool.query(`
      SELECT 
        bg.blood_group_id,
        bg.group_name AS blood_group,
        COUNT(CASE WHEN bu.status = 'Available' THEN 1 END) AS available_units,
        COUNT(CASE WHEN bu.status = 'Reserved' THEN 1 END) AS reserved_units,
        COUNT(CASE WHEN bu.status = 'Issued' THEN 1 END) AS issued_units,
        COUNT(CASE WHEN bu.status = 'Expired' OR (bu.expiry_date < CURDATE() AND bu.status = 'Available') THEN 1 END) AS expired_units,
        COUNT(bu.unit_id) AS total_units
      FROM blood_groups bg
      LEFT JOIN blood_units bu ON bg.blood_group_id = bu.blood_group_id
      GROUP BY bg.blood_group_id, bg.group_name
      ORDER BY bg.blood_group_id ASC
    `);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/inventory/:bloodGroup - Get inventory for a specific blood group (e.g. O+)
async function getInventoryByGroup(req, res, next) {
  try {
    const { bloodGroup } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        bg.blood_group_id,
        bg.group_name AS blood_group,
        COUNT(CASE WHEN bu.status = 'Available' AND bu.expiry_date >= CURDATE() THEN 1 END) AS available_units
      FROM blood_groups bg
      LEFT JOIN blood_units bu ON bg.blood_group_id = bu.blood_group_id
      WHERE bg.group_name = ?
      GROUP BY bg.blood_group_id, bg.group_name
    `, [bloodGroup]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Blood group ${bloodGroup} not found`
      });
    }

    res.json({
      success: true,
      data: {
        blood_group: rows[0].blood_group,
        blood_group_id: rows[0].blood_group_id,
        available_units: rows[0].available_units
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/inventory/units/available - Fetch list of available units for issuance
async function getAvailableUnits(req, res, next) {
  try {
    const { blood_group_id } = req.query;

    let query = `
      SELECT 
        bu.unit_id,
        bu.donation_id,
        bu.blood_group_id,
        bg.group_name AS blood_group,
        bu.collection_date,
        bu.expiry_date,
        bu.status
      FROM blood_units bu
      JOIN blood_groups bg ON bu.blood_group_id = bg.blood_group_id
      WHERE bu.status = 'Available' AND bu.expiry_date >= CURDATE()
    `;
    const params = [];

    if (blood_group_id) {
      query += ` AND bu.blood_group_id = ?`;
      params.push(blood_group_id);
    }

    query += ` ORDER BY bu.expiry_date ASC`;

    const [units] = await pool.query(query, params);

    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInventorySummary,
  getInventoryByGroup,
  getAvailableUnits
};
