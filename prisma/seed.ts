import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: 'admin@joyful.app' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin1234', 10);
    await prisma.adminUser.create({
      data: {
        email: 'admin@joyful.app',
        password: hashedPassword,
      },
    });
    console.log('✅ Default admin created: admin@joyful.app / admin1234');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // Seed members
  const members = [
    { name: '김하늘', phone: '01012345678', group: '보컬' },
    { name: '이가은', phone: '01023456789', group: '보컬' },
    { name: '박요한', phone: '01034567890', group: '악기' },
    { name: '최민수', phone: '01045678901', group: '악기' },
    { name: '정현우', phone: '01056789012', group: '음향' },
  ];

  for (const member of members) {
    const existing = await prisma.member.findFirst({
      where: { name: member.name },
    });

    if (!existing) {
      await prisma.member.create({ data: member });
      console.log(`✅ Member created: ${member.name} (${member.group}) - ${member.phone}`);
    } else {
      console.log(`ℹ️  Member already exists: ${member.name}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
