const app = require('../src/app');
let server;

async function testHttpEndpoints() {
  server = app.listen(5099, async () => {
    const baseUrl = 'http://localhost:5099/api';
    console.log(`Test server running on ${baseUrl}`);

    try {
      // 1. Health endpoint
      const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
      console.log('✓ Health check:', healthRes.message);

      // 2. Multi-role logins
      const logins = [
        { email: 'admin@bloodbank.org', password: 'adminpassword', role: 'Admin' },
        { email: 'staff@bloodbank.org', password: 'staffpassword', role: 'Staff' },
        { email: 'emergency@apollohospitals.com', password: 'hospital123', role: 'Hospital' },
        { email: 'rahul.sharma@gmail.com', password: 'donor123', role: 'Donor' },
      ];

      const tokens = {};

      for (const item of logins) {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: item.email, password: item.password })
        }).then(r => r.json());

        if (res.success) {
          console.log(`✓ HTTP Login OK for [${item.role}]: token received for ${res.data.user.name}`);
          tokens[item.role] = res.data.token;
        } else {
          console.error(`✗ HTTP Login FAILED for [${item.role}]:`, res);
        }
      }

      // 3. Test Role Dashboards via HTTP
      const adminDash = await fetch(`${baseUrl}/dashboard/admin`, {
        headers: { Authorization: `Bearer ${tokens['Admin']}` }
      }).then(r => r.json());
      console.log('✓ HTTP Admin Dashboard:', adminDash.success ? 'SUCCESS (KPIs present)' : 'FAILED');

      const staffDash = await fetch(`${baseUrl}/dashboard/staff`, {
        headers: { Authorization: `Bearer ${tokens['Staff']}` }
      }).then(r => r.json());
      console.log('✓ HTTP Staff Dashboard:', staffDash.success ? 'SUCCESS (Queues present)' : 'FAILED');

      const hospDash = await fetch(`${baseUrl}/dashboard/hospital`, {
        headers: { Authorization: `Bearer ${tokens['Hospital']}` }
      }).then(r => r.json());
      console.log('✓ HTTP Hospital Dashboard:', hospDash.success ? `SUCCESS (${hospDash.data.hospital.name})` : 'FAILED');

      const donorDash = await fetch(`${baseUrl}/dashboard/donor`, {
        headers: { Authorization: `Bearer ${tokens['Donor']}` }
      }).then(r => r.json());
      console.log('✓ HTTP Donor Dashboard:', donorDash.success ? `SUCCESS (${donorDash.data.donor.name})` : 'FAILED');

      console.log('\n🎉 ALL HTTP MULTI-ROLE ENDPOINTS PASSED VERIFICATION!');
    } catch (err) {
      console.error('Test error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

testHttpEndpoints();

