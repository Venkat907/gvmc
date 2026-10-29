const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Admin = require('./src/models/Admin');

async function updateCredentials() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  const name = process.argv[4] || 'GVMC Administrator';

  if (!email || !newPassword) {
    console.log('Usage: node change_credentials.js <email> <newPassword> [name]');
    console.log('Example: node change_credentials.js myemail@example.com MyNewPassword123 "My Name"');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI not found in backend/.env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB database...');
  await mongoose.connect(uri);

  const cleanEmail = email.toLowerCase().trim();
  const passwordHash = await Admin.hashPassword(newPassword);

  let admin = await Admin.findOne({ email: cleanEmail });

  if (admin) {
    admin.passwordHash = passwordHash;
    if (name) admin.name = name;
    await admin.save();
    console.log(`SUCCESS: Password updated for existing administrator: ${cleanEmail}`);
  } else {
    admin = await Admin.create({
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      passwordHash,
      name,
      role: 'superadmin',
    });
    console.log(`SUCCESS: Created new administrator account: ${cleanEmail}`);
  }

  console.log(`Email:    ${cleanEmail}`);
  console.log(`Password: ${newPassword}`);

  await mongoose.disconnect();
}

updateCredentials().catch((err) => {
  console.error('Error updating credentials:', err.message);
  process.exit(1);
});
