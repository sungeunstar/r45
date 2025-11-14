const bcrypt = require('bcryptjs');

async function createAdmin() {
  const email = 'admin@joyful.app';
  const password = 'admin1234';

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  console.log('\n=== SQL to insert admin user ===\n');
  console.log(`INSERT INTO "AdminUser" ("id", "email", "password", "createdAt")
VALUES ('${id}', '${email}', '${hashedPassword}', CURRENT_TIMESTAMP);`);
  console.log('\n=== Copy and run this in Supabase SQL Editor ===\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

createAdmin().catch(console.error);
