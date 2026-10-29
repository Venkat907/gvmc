const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
const Admin = require('./src/models/Admin');

async function main() {
  const action = process.argv[2] || 'list';
  const targetEmail = process.argv[3];

  await mongoose.connect(process.env.MONGODB_URI);

  if (action === 'list') {
    const list = await Admin.find({}, 'email username name role createdAt');
    console.log('ADMIN_LIST:', JSON.stringify(list, null, 2));
  } else if (action === 'delete') {
    if (!targetEmail) {
      console.log('Provide email to delete: node manage_admin.js delete <email>');
      process.exit(1);
    }
    const res = await Admin.deleteOne({ email: targetEmail.toLowerCase().trim() });
    console.log(`Deleted ${targetEmail}: count = ${res.deletedCount}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
