const { pool } = require('../config/database');

// GET /api/blood-groups - Helper to get all 8 blood groups
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
        bg.blood_group_id,
        bg.group_name AS blood_group,
        COUNT(CASE WHEN bu.status = 'Available' AND bu.expiry_date >= CURDATE() THEN 1 END) AS available_units,
        COUNT(CASE WHEN bu.status = 'Reserved' THEN 1 END) AS reserved_units,
        COUNT(CASE WHEN bu.status = 'Issued' THEN 1 END) AS issued_units,
        COUNT(CASE WHEN bu.status = 'Expired' OR bu.expiry_date < CURDATE() THEN 1 END) AS expired_units,
        COUNT(bu.unit_id) AS total_units
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
        recent_donations: recentDonations,
        recent_issues: recentIssues,
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/admin - Full executive administrative metrics
async function getAdminDashboard(req, res, next) {
  try {
    const [[donorCount]] = await pool.query('SELECT COUNT(*) AS total_donors FROM donors');
    const [[unitCount]] = await pool.query('SELECT COUNT(*) AS total_units FROM blood_units');
    const [[availableCount]] = await pool.query("SELECT COUNT(*) AS available_units FROM blood_units WHERE status = 'Available' AND expiry_date >= CURDATE()");
    const [[pendingRequestCount]] = await pool.query("SELECT COUNT(*) AS pending_requests FROM blood_requests WHERE status = 'Pending'");
    const [[hospitalCount]] = await pool.query('SELECT COUNT(*) AS total_hospitals FROM hospitals');
    const [[issuesCount]] = await pool.query('SELECT COUNT(*) AS total_issues FROM issues');
    const [[staffCount]] = await pool.query('SELECT COUNT(*) AS total_staff FROM staff');

    // Units expiring within 7 days
    const [expiringUnits] = await pool.query(`
      SELECT 
        bu.unit_id,
        bg.group_name AS blood_group,
        bu.collection_date,
        bu.expiry_date,
        DATEDIFF(bu.expiry_date, CURDATE()) AS days_left
      FROM blood_units bu
      JOIN blood_groups bg ON bu.blood_group_id = bg.blood_group_id
      WHERE bu.status = 'Available' 
        AND bu.expiry_date >= CURDATE()
        AND bu.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY bu.expiry_date ASC
      LIMIT 10
    `);

    // Group inventory matrix
    const [inventory] = await pool.query(`
      SELECT 
        bg.blood_group_id,
        bg.group_name AS blood_group,
        COUNT(CASE WHEN bu.status = 'Available' AND bu.expiry_date >= CURDATE() THEN 1 END) AS available_units,
        COUNT(CASE WHEN bu.status = 'Reserved' THEN 1 END) AS reserved_units,
        COUNT(CASE WHEN bu.status = 'Issued' THEN 1 END) AS issued_units,
        COUNT(CASE WHEN bu.status = 'Expired' OR bu.expiry_date < CURDATE() THEN 1 END) AS expired_units
      FROM blood_groups bg
      LEFT JOIN blood_units bu ON bg.blood_group_id = bu.blood_group_id
      GROUP BY bg.blood_group_id, bg.group_name
      ORDER BY bg.blood_group_id ASC
    `);

    // Staff accounts list
    const [staffList] = await pool.query('SELECT staff_id, name, role, phone, email FROM staff ORDER BY staff_id ASC');

    // Recent system audit transactions (issues)
    const [recentIssues] = await pool.query(`
      SELECT 
        i.issue_id,
        h.name AS hospital_name,
        bg.group_name AS blood_group,
        i.unit_id,
        i.issue_date,
        s.name AS issued_by_name
      FROM issues i
      JOIN blood_requests br ON i.request_id = br.request_id
      JOIN hospitals h ON br.hospital_id = h.hospital_id
      JOIN blood_units bu ON i.unit_id = bu.unit_id
      JOIN blood_groups bg ON bu.blood_group_id = bg.blood_group_id
      LEFT JOIN staff s ON i.issued_by = s.staff_id
      ORDER BY i.issue_id DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      data: {
        kpis: {
          total_donors: donorCount.total_donors,
          total_units: unitCount.total_units,
          available_units: availableCount.available_units,
          pending_requests: pendingRequestCount.pending_requests,
          total_hospitals: hospitalCount.total_hospitals,
          total_issues: issuesCount.total_issues,
          total_staff: staffCount.total_staff
        },
        expiring_units: expiringUnits,
        inventory,
        staff: staffList,
        recent_issues: recentIssues
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/staff - Operational queues for laboratory & phlebotomy staff
async function getStaffDashboard(req, res, next) {
  try {
    // 1. Pending Screening Queue
    const [pendingScreening] = await pool.query(`
      SELECT 
        d.donation_id,
        dn.name AS donor_name,
        dn.phone AS donor_phone,
        bg.group_name AS blood_group,
        d.donation_date,
        d.quantity,
        d.screening_status
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.donor_id
      JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
      WHERE d.screening_status = 'Pending'
      ORDER BY d.donation_date ASC
      LIMIT 10
    `);

    // 2. Active Hospital Requests Awaiting Fulfillment
    const [activeRequests] = await pool.query(`
      SELECT 
        br.request_id,
        h.name AS hospital_name,
        h.contact AS hospital_contact,
        bg.group_name AS blood_group,
        br.quantity_required,
        br.request_date,
        br.urgency,
        br.status
      FROM blood_requests br
      JOIN hospitals h ON br.hospital_id = h.hospital_id
      JOIN blood_groups bg ON br.blood_group_id = bg.blood_group_id
      WHERE br.status IN ('Pending', 'Approved')
      ORDER BY FIELD(br.urgency, 'Critical', 'Urgent', 'Normal'), br.request_date ASC
      LIMIT 10
    `);

    // 3. Quick counts
    const [[pendingScreeningCount]] = await pool.query("SELECT COUNT(*) AS count FROM donations WHERE screening_status = 'Pending'");
    const [[criticalReqCount]] = await pool.query("SELECT COUNT(*) AS count FROM blood_requests WHERE status = 'Pending' AND urgency = 'Critical'");
    const [[availableUnitsCount]] = await pool.query("SELECT COUNT(*) AS count FROM blood_units WHERE status = 'Available' AND expiry_date >= CURDATE()");

    // 4. Available stock breakdown
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
        summary: {
          pending_screening_count: pendingScreeningCount.count,
          critical_requests_count: criticalReqCount.count,
          available_units_count: availableUnitsCount.count
        },
        pending_screening_queue: pendingScreening,
        active_requests_queue: activeRequests,
        inventory
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/hospital - Scoped portal for authenticated hospital
async function getHospitalDashboard(req, res, next) {
  try {
    const hospitalId = req.user.hospital_id || req.query.hospital_id || 1;

    // Hospital profile
    const [hospitalRows] = await pool.query(
      'SELECT hospital_id, name, address, contact, email FROM hospitals WHERE hospital_id = ?',
      [hospitalId]
    );

    if (hospitalRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const hospital = hospitalRows[0];

    // Request metrics for this hospital
    const [[totalReq]] = await pool.query('SELECT COUNT(*) AS count FROM blood_requests WHERE hospital_id = ?', [hospitalId]);
    const [[pendingReq]] = await pool.query("SELECT COUNT(*) AS count FROM blood_requests WHERE hospital_id = ? AND status = 'Pending'", [hospitalId]);
    const [[completedReq]] = await pool.query("SELECT COUNT(*) AS count FROM blood_requests WHERE hospital_id = ? AND status = 'Completed'", [hospitalId]);

    // All requests submitted by this hospital
    const [requests] = await pool.query(`
      SELECT 
        br.request_id,
        bg.group_name AS blood_group,
        br.quantity_required,
        br.request_date,
        br.urgency,
        br.status
      FROM blood_requests br
      JOIN blood_groups bg ON br.blood_group_id = bg.blood_group_id
      WHERE br.hospital_id = ?
      ORDER BY br.request_date DESC, br.request_id DESC
      LIMIT 15
    `, [hospitalId]);

    // Issues dispatched to this hospital
    const [dispatches] = await pool.query(`
      SELECT 
        i.issue_id,
        i.request_id,
        i.unit_id,
        bg.group_name AS blood_group,
        i.issue_date,
        s.name AS issued_by_name
      FROM issues i
      JOIN blood_requests br ON i.request_id = br.request_id
      JOIN blood_units bu ON i.unit_id = bu.unit_id
      JOIN blood_groups bg ON bu.blood_group_id = bg.blood_group_id
      LEFT JOIN staff s ON i.issued_by = s.staff_id
      WHERE br.hospital_id = ?
      ORDER BY i.issue_id DESC
      LIMIT 10
    `, [hospitalId]);

    // General stock availability guide (so hospital knows what is in stock)
    const [stockAvailability] = await pool.query(`
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
        hospital,
        stats: {
          total_requests: totalReq.count,
          pending_requests: pendingReq.count,
          completed_requests: completedReq.count
        },
        requests,
        dispatches,
        stock_availability: stockAvailability
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/donor - Scoped portal for authenticated donor
async function getDonorDashboard(req, res, next) {
  try {
    const donorId = req.user.donor_id || req.query.donor_id || 1;

    // Donor profile
    const [donorRows] = await pool.query(`
      SELECT 
        d.donor_id,
        d.name,
        d.email,
        d.age,
        d.gender,
        d.phone,
        d.address,
        d.blood_group_id,
        bg.group_name AS blood_group,
        d.last_donation_date
      FROM donors d
      JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
      WHERE d.donor_id = ?
    `, [donorId]);

    if (donorRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor profile not found' });
    }

    const donor = donorRows[0];

    // Personal donation records
    const [donations] = await pool.query(`
      SELECT 
        d.donation_id,
        d.donation_date,
        d.quantity,
        d.screening_status,
        bg.group_name AS blood_group
      FROM donations d
      JOIN blood_groups bg ON d.blood_group_id = bg.blood_group_id
      WHERE d.donor_id = ?
      ORDER BY d.donation_date DESC, d.donation_id DESC
    `, [donorId]);

    const totalDonations = donations.length;
    const totalUnits = donations.reduce((sum, d) => sum + (d.quantity || 1), 0);

    // Compute Eligibility (standard 90-day cooldown between donations)
    let isEligible = true;
    let daysUntilEligible = 0;
    let nextEligibleDate = null;

    if (donor.last_donation_date) {
      const lastDate = new Date(donor.last_donation_date);
      const eligibleDate = new Date(lastDate);
      eligibleDate.setDate(eligibleDate.getDate() + 90);
      nextEligibleDate = eligibleDate.toISOString().slice(0, 10);

      const now = new Date();
      const diffTime = eligibleDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        isEligible = false;
        daysUntilEligible = diffDays;
      }
    }

    // Check if donor's blood group has a critical shortage in the blood bank
    const [[groupStock]] = await pool.query(`
      SELECT COUNT(*) AS available_count 
      FROM blood_units 
      WHERE blood_group_id = ? AND status = 'Available' AND expiry_date >= CURDATE()
    `, [donor.blood_group_id]);

    const isUrgentShortage = (groupStock.available_count < 5);

    res.json({
      success: true,
      data: {
        donor,
        stats: {
          total_donations: totalDonations,
          total_units_donated: totalUnits,
          is_eligible: isEligible,
          days_until_eligible: daysUntilEligible,
          next_eligible_date: nextEligibleDate,
          blood_group_available_stock: groupStock.available_count,
          is_urgent_shortage: isUrgentShortage
        },
        donations
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllBloodGroups,
  getDashboardStats,
  getAdminDashboard,
  getStaffDashboard,
  getHospitalDashboard,
  getDonorDashboard
};
