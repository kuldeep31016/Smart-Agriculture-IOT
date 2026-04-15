require('dotenv').config();

const { createApp } = require('./app');

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n─────────────────────────────────────────');
  console.log('  🌾  AgriSense Backend');
  console.log(`  📡  http://localhost:${PORT}`);
  console.log('─────────────────────────────────────────\n');
});
