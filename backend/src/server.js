const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log('====================================================');
  console.log(` Blood Bank API Server running on port ${PORT}`);
  console.log(` Base URL: http://localhost:${PORT}/api`);
  console.log(` Health:   http://localhost:${PORT}/api/health`);
  console.log('====================================================');

  // Verify database connectivity
  await testConnection();
});
