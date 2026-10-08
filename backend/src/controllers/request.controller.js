const { pool } = require('../config/database');

// GET /api/requests - Retrieve blood requests with hospital and blood group details
async function getAllRequests(req, res, next) {
  try {
    const { status, urgency, hospital_id } = req.query;

    let query = `
      SELECT 
        br.request_id,
        br.hospital_id,
        h.name AS hospital_name,
        h.contact AS hospital_contact,
        br.blood_group_id,
        bg.group_name AS blood_group,
        br.quantity_required,
        br.request_date,
        br.urgency,
        br.status
      FROM blood_requests br
      JOIN hospitals h ON br.hospital_id = h.hospital_id
      JOIN blood_groups bg ON br.blood_group_id = bg.blood_group_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND br.status = ?`;
      params.push(status);
    }
    if (urgency) {
      query += ` AND br.urgency = ?`;
      params.push(urgency);
    }
    if (hospital_id) {
      query += ` AND br.hospital_id = ?`;
      params.push(hospital_id);
    }

    query += ` ORDER BY FIELD(br.urgency, 'Critical', 'Urgent', 'Normal'), br.request_date DESC`;

    const [requests] = await pool.query(query, params);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/requests/:id - Retrieve a single blood request
async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        br.request_id,
        br.hospital_id,
        h.name AS hospital_name,
        h.contact AS hospital_contact,
        h.email AS hospital_email,
        br.blood_group_id,
        bg.group_name AS blood_group,
        br.quantity_required,
        br.request_date,
        br.urgency,
        br.status
      FROM blood_requests br
      JOIN hospitals h ON br.hospital_id = h.hospital_id
      JOIN blood_groups bg ON br.blood_group_id = bg.blood_group_id
      WHERE br.request_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
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

// POST /api/requests - Create a new blood request
async function createRequest(req, res, next) {
  try {
    const { hospital_id, blood_group_id, quantity_required, urgency, request_date } = req.body;

    if (!hospital_id || !blood_group_id || !quantity_required) {
      return res.status(400).json({
        success: false,
        message: 'hospital_id, blood_group_id, and quantity_required are required'
      });
    }

    if (quantity_required <= 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity_required must be greater than 0'
      });
    }

    const validUrgencies = ['Normal', 'Urgent', 'Critical'];
    const selectedUrgency = validUrgencies.includes(urgency) ? urgency : 'Normal';
    const effectiveDate = request_date || new Date().toISOString().slice(0, 10);

    const [result] = await pool.query(
      `INSERT INTO blood_requests (hospital_id, blood_group_id, quantity_required, request_date, urgency, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [hospital_id, blood_group_id, quantity_required, effectiveDate, selectedUrgency]
    );

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: {
        request_id: result.insertId,
        hospital_id,
        blood_group_id,
        quantity_required,
        request_date: effectiveDate,
        urgency: selectedUrgency,
        status: 'Pending'
      }
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/requests/:id - Update blood request (e.g. approve/reject or edit)
async function updateRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { status, urgency, quantity_required } = req.body;

    const [rows] = await pool.query('SELECT status FROM blood_requests WHERE request_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (status && !['Pending', 'Approved', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    await pool.query(
      `UPDATE blood_requests 
       SET status = COALESCE(?, status),
           urgency = COALESCE(?, urgency),
           quantity_required = COALESCE(?, quantity_required)
       WHERE request_id = ?`,
      [status, urgency, quantity_required, id]
    );

    res.json({
      success: true,
      message: 'Blood request updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest
};
