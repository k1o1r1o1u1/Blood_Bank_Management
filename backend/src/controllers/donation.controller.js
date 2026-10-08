const { pool } = require('../config/database');

// GET /api/donations - Get all donations with donor and blood group details
async function getAllDonations(req, res, next) {
  try {
    const [donations] = await pool.query(`
      SELECT 
        d.donation_id,
        d.donor_id,
        dn.name AS donor_name,
        d.blood_group_id,
        bg.group_name AS blood_group,
        d.donation_date,
        d.quantity,
        d.screening_status
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
      ORDER BY d.donation_id DESC
    `);
    res.json({
      success: true,
      data: donations
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/donations/:id - Get a single donation
async function getDonationById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        d.donation_id,
        d.donor_id,
        dn.name AS donor_name,
        d.blood_group_id,
        bg.group_name AS blood_group,
        d.donation_date,
        d.quantity,
        d.screening_status
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
      WHERE d.donation_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
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

// POST /api/donations - Record a new donation
async function createDonation(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { donor_id, blood_group_id, donation_date, quantity, screening_status } = req.body;

    if (!donor_id || !blood_group_id || !quantity) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'donor_id, blood_group_id, and quantity are required'
      });
    }

    const effectiveDate = donation_date || new Date().toISOString().slice(0, 10);
    const status = screening_status || 'Pending';

    // 1. Insert donation record
    const [donationResult] = await connection.query(
      `INSERT INTO donations (donor_id, blood_group_id, donation_date, quantity, screening_status)
       VALUES (?, ?, ?, ?, ?)`,
      [donor_id, blood_group_id, effectiveDate, quantity, status]
    );

    const donationId = donationResult.insertId;

    // 2. Update donor's last_donation_date
    await connection.query(
      `UPDATE donors SET last_donation_date = ? WHERE donor_id = ?`,
      [effectiveDate, donor_id]
    );

    // 3. If screening is already Approved upon entry, automatically generate blood_units
    if (status === 'Approved') {
      const unitsCount = parseInt(quantity, 10) || 1;
      const expiryDate = new Date(new Date(effectiveDate).getTime() + 42 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      for (let i = 0; i < unitsCount; i++) {
        await connection.query(
          `INSERT INTO blood_units (donation_id, blood_group_id, collection_date, expiry_date, status)
           VALUES (?, ?, ?, ?, 'Available')`,
          [donationId, blood_group_id, effectiveDate, expiryDate]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: {
        donation_id: donationId,
        donor_id,
        blood_group_id,
        donation_date: effectiveDate,
        quantity,
        screening_status: status
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// PUT /api/donations/:id/screening - Update screening status (Approve / Reject)
async function updateScreeningStatus(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { screening_status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(screening_status)) {
      return res.status(400).json({
        success: false,
        message: 'screening_status must be either "Approved", "Rejected", or "Pending"'
      });
    }

    await connection.beginTransaction();

    const [donationRows] = await connection.query(
      'SELECT * FROM donations WHERE donation_id = ? FOR UPDATE',
      [id]
    );

    if (donationRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
      });
    }

    const donation = donationRows[0];
    const previousStatus = donation.screening_status;

    await connection.query(
      'UPDATE donations SET screening_status = ? WHERE donation_id = ?',
      [screening_status, id]
    );

    // If changing from non-Approved to Approved, create blood_units if they do not exist
    if (screening_status === 'Approved' && previousStatus !== 'Approved') {
      const [existingUnits] = await connection.query(
        'SELECT unit_id FROM blood_units WHERE donation_id = ?',
        [id]
      );

      if (existingUnits.length === 0) {
        const unitsCount = donation.quantity || 1;
        const collectionDate = donation.donation_date;
        const expiryDate = new Date(new Date(collectionDate).getTime() + 42 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        for (let i = 0; i < unitsCount; i++) {
          await connection.query(
            `INSERT INTO blood_units (donation_id, blood_group_id, collection_date, expiry_date, status)
             VALUES (?, ?, ?, ?, 'Available')`,
            [id, donation.blood_group_id, collectionDate, expiryDate]
          );
        }
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Donation screening status updated to ${screening_status}`
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllDonations,
  getDonationById,
  createDonation,
  updateScreeningStatus
};
