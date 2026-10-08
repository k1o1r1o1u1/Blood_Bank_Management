const { pool } = require('../config/database');

// GET /api/issues - Retrieve all issued blood records
async function getAllIssues(req, res, next) {
  try {
    const [issues] = await pool.query(`
      SELECT 
        i.issue_id,
        i.request_id,
        i.unit_id,
        i.issue_date,
        i.issued_by,
        s.name AS issued_by_name,
        h.name AS hospital_name,
        bg.group_name AS blood_group,
        bu.collection_date,
        bu.expiry_date
      FROM issues i
      JOIN blood_requests br ON i.request_id = br.request_id
      JOIN hospitals h ON br.hospital_id = h.hospital_id
      JOIN blood_units bu ON i.unit_id = bu.unit_id
      JOIN blood_groups bg ON bu.blood_group_id = bg.blood_group_id
      LEFT JOIN staff s ON i.issued_by = s.staff_id
      ORDER BY i.issue_id DESC
    `);

    res.json({
      success: true,
      data: issues
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/issues/:id - Retrieve a single issue record
async function getIssueById(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        i.issue_id,
        i.request_id,
        i.unit_id,
        i.issue_date,
        i.issued_by,
        s.name AS issued_by_name,
        h.name AS hospital_name,
        bg.group_name AS blood_group,
        bu.collection_date,
        bu.expiry_date
      FROM issues i
      JOIN blood_requests br ON i.request_id = br.request_id
      JOIN hospitals h ON br.hospital_id = h.hospital_id
      JOIN blood_units bu ON i.unit_id = bu.unit_id
      JOIN blood_groups bg ON bu.blood_group_id = bg.blood_group_id
      LEFT JOIN staff s ON i.issued_by = s.staff_id
      WHERE i.issue_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Issue record not found'
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

// POST /api/issues - Atomic Blood Issue Transaction
async function issueBlood(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const { request_id, unit_ids, issued_by } = req.body;

    if (!request_id || !Array.isArray(unit_ids) || unit_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'request_id and a non-empty array of unit_ids are required'
      });
    }

    // 1. BEGIN TRANSACTION
    await connection.beginTransaction();

    // 2. Lock & check the Blood Request
    const [requestRows] = await connection.query(
      'SELECT * FROM blood_requests WHERE request_id = ? FOR UPDATE',
      [request_id]
    );

    if (requestRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: `Blood request #${request_id} not found`
      });
    }

    const bloodRequest = requestRows[0];

    // Check request status
    if (bloodRequest.status === 'Completed') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'This blood request has already been completed'
      });
    }

    if (bloodRequest.status === 'Rejected') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot issue units for a rejected blood request'
      });
    }

    // Check quantity match
    if (unit_ids.length !== bloodRequest.quantity_required) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Quantity mismatch: Request requires ${bloodRequest.quantity_required} unit(s), but ${unit_ids.length} were selected`
      });
    }

    // 3. Lock & verify the selected Blood Units
    const placeholders = unit_ids.map(() => '?').join(',');
    const [unitRows] = await connection.query(
      `SELECT unit_id, blood_group_id, expiry_date, status 
       FROM blood_units 
       WHERE unit_id IN (${placeholders}) 
       FOR UPDATE`,
      unit_ids
    );

    if (unitRows.length !== unit_ids.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'One or more selected blood units do not exist in the database'
      });
    }

    const currentDate = new Date().toISOString().slice(0, 10);

    for (const unit of unitRows) {
      // Must match blood group
      if (unit.blood_group_id !== bloodRequest.blood_group_id) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Unit #${unit.unit_id} does not match the requested blood group`
        });
      }

      // Must be Available
      if (unit.status !== 'Available') {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Unit #${unit.unit_id} is not available (Current status: ${unit.status})`
        });
      }

      // Must not be expired
      if (unit.expiry_date < currentDate) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Unit #${unit.unit_id} has expired on ${unit.expiry_date}`
        });
      }
    }

    // 4. Perform Transaction: Create issue records & mark units as Issued
    const issueDate = currentDate;
    const staffId = issued_by || null;
    const createdIssues = [];

    for (const unitId of unit_ids) {
      const [issueInsert] = await connection.query(
        `INSERT INTO issues (request_id, unit_id, issue_date, issued_by)
         VALUES (?, ?, ?, ?)`,
        [request_id, unitId, issueDate, staffId]
      );
      createdIssues.push(issueInsert.insertId);

      await connection.query(
        `UPDATE blood_units SET status = 'Issued' WHERE unit_id = ?`,
        [unitId]
      );
    }

    // 5. Update request status to Completed
    await connection.query(
      `UPDATE blood_requests SET status = 'Completed' WHERE request_id = ?`,
      [request_id]
    );

    // 6. COMMIT TRANSACTION
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Blood units successfully issued to hospital',
      data: {
        request_id,
        issued_unit_ids: unit_ids,
        issue_ids: createdIssues,
        issue_date: issueDate
      }
    });
  } catch (error) {
    // If anything fails: ROLLBACK
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllIssues,
  getIssueById,
  issueBlood
};
