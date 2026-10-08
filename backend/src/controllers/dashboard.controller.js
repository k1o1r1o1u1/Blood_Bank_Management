const { pool } = require('../config/database');

// GET /api/dashboard/stats - Overview metrics for dashboard
async function getDashboardStats(req, res, next) {
  try {
    const [[donorCount]] = await pool.query('SELECT COUNT(*) AS total_donors FROM donors');
    const [[unitCount]] = await pool.query('SELECT COUNT(*) AS total_units FROM blood_units');
    const [[availableCount]] = await pool.query("SELECT COUNT(*) AS available_units FROM blood_units WHERE status = 'Available' AND expiry_date >= CURDATE()");
    const [[pendingRequestCount]] = await pool.query("SELECT COUNT(*) AS pending_requests FROM blood_requests WHERE status = 'Pending'");
    const [[hospitalCount]] = await pool.query('SELECT COUNT(*) AS total_hospitals FROM hospitals');

    // Recent donations
    const [recentDonations] = await pool.query(`
      SELECT 
        d.donation_id,
        dn.name AS donor_name,
        bg.group_name AS blood_group,
        d.donation_date,
        d.quantity,
        d.screening_status
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
      ORDER BY d.donation_id DESC
      LIMIT 5
    `);

    // Recent blood issues
    const [recentIssues] = await pool.query(`
      SELECT 
        i.issue_id,
        h.name AS hospital_name,
        bg.group_name AS blood_group,
        i.unit_id,
        i.issue_date
      FROM issues i
      JOIN blood_requests br ON i.request_id = br.request_id
      JOIN hospitals h ON br.hospital_id = h.hospital_id
      JOIN blood_units bu ON i.unit_id = bu.unit_id
      JOIN blood_groups bg ON bu.blood_group_id = bg.blood_group_id
      ORDER BY i.issue_id DESC
      LIMIT 5
    `);

    // Blood inventory summary
    const [inventory] = await pool.query(`
      SELECT 
        bg.group_name AS blood_group,
        COUNT(CASE WHEN bu.status = 'Available' AND bu.expiry_date >= CURDATE() THEN 1 END) AS available_units
      FROM blood_groups bg
      LEFT JOIN blood_units bu ON bg.blood_group_id = bu.blood_group_id
      GROUP BY bg.blood_group_id, bg.group_name
      ORDER BY bg.blood_group_id ASC
    `);

    res.json({
      success: true,
      data: {
        total_donors: donorCount.total_donors,
        total_units: unitCount.total_units,
        available_units: availableCount.available_units,
        pending_requests: pendingRequestCount.pending_requests,
        total_hospitals: hospitalCount.total_hospitals,
        inventory,
        recent_donations: recentDonations,
        recent_issues: recentIssues
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/blood-groups - Helper to get all 8 blood groups for frontend dropdowns
async function getAllBloodGroups(req, res, next) {
  try {
    const [groups] = await pool.query('SELECT blood_group_id, group_name FROM blood_groups ORDER BY blood_group_id ASC');
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAllBloodGroups
};
