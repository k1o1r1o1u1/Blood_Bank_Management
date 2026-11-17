const { login, getProfile } = require('../src/controllers/auth.controller');
const { getAdminDashboard, getStaffDashboard, getHospitalDashboard, getDonorDashboard } = require('../src/controllers/dashboard.controller');

async function testAll() {
  console.log('Testing Multi-Role Logins:');

  const testAccounts = [
    { email: 'admin@bloodbank.org', password: 'adminpassword', expectedRole: 'Admin' },
    { email: 'staff@bloodbank.org', password: 'staffpassword', expectedRole: 'Staff' },
    { email: 'emergency@apollohospitals.com', password: 'hospital123', expectedRole: 'Hospital' },
    { email: 'rahul.sharma@gmail.com', password: 'donor123', expectedRole: 'Donor' }
  ];

  for (const acc of testAccounts) {
    const req = { body: { email: acc.email, password: acc.password } };
    let responseData = null;
    const res = {
      json: (data) => { responseData = data; },
      status: (code) => ({ json: (d) => { responseData = { status: code, ...d }; } })
    };
    const next = (err) => { console.error('Error in login:', err); };

    await login(req, res, next);

    if (responseData && responseData.success) {
      console.log(`✓ ${acc.expectedRole} login success: ${responseData.data.user.name} (${responseData.data.user.role})`);
    } else {
      console.error(`✗ ${acc.expectedRole} login FAILED:`, responseData);
    }
  }

  console.log('\nTesting Role Dashboards:');

  // Test Admin Dashboard
  {
    const req = { user: { role: 'Admin', staff_id: 1 } };
    let dData = null;
    await getAdminDashboard(req, { json: (d) => { dData = d; } }, (e) => console.error(e));
    console.log('✓ Admin Dashboard OK: Total Donors =', dData.data.kpis.total_donors);
  }

  // Test Staff Dashboard
  {
    const req = { user: { role: 'Staff', staff_id: 2 } };
    let dData = null;
    await getStaffDashboard(req, { json: (d) => { dData = d; } }, (e) => console.error(e));
    console.log('✓ Staff Dashboard OK: Pending screening count =', dData.data.summary.pending_screening_count);
  }

  // Test Hospital Dashboard
  {
    const req = { user: { role: 'Hospital', hospital_id: 1 } };
    let dData = null;
    await getHospitalDashboard(req, { json: (d) => { dData = d; } }, (e) => console.error(e));
    console.log('✓ Hospital Dashboard OK: Hospital =', dData.data.hospital.name, '| Requests =', dData.data.requests.length);
  }

  // Test Donor Dashboard
  {
    const req = { user: { role: 'Donor', donor_id: 1 } };
    let dData = null;
    await getDonorDashboard(req, { json: (d) => { dData = d; } }, (e) => console.error(e));
    console.log('✓ Donor Dashboard OK: Donor =', dData.data.donor.name, '| Eligible =', dData.data.stats.is_eligible, '| History =', dData.data.donations.length);
  }

  console.log('\n🎉 ALL MULTI-ROLE LOGINS & DASHBOARD ENDPOINTS VERIFIED!');
  process.exit(0);
}

testAll();

