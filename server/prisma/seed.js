const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // Clear existing data safely in reverse relation order
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing records.');

  const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);
  const ownerPasswordHash = await bcrypt.hash('Owner@1234', 10);
  const userPasswordHash = await bcrypt.hash('User@1234', 10);

  // 1. Create System Administrator
  // Name length: 28 characters (Constraint: 20 - 60 chars)
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Roxiler',
      email: 'admin@demo.com',
      passwordHash: adminPasswordHash,
      address: 'Suite 100, Corporate Plaza, Innovation Way, Tech Park 560100',
      role: 'ADMIN',
    },
  });
  console.log(`Created Admin: ${admin.name} (${admin.email})`);

  // 2. Create Store Owners
  // Names: 25-26 characters
  const owner1 = await prisma.user.create({
    data: {
      name: 'Eleanor Vance Store Owner',
      email: 'owner@demo.com',
      passwordHash: ownerPasswordHash,
      address: 'Shop 12, Westside Galleria, Commercial Street, City 560001',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Marcus Thorne Store Owner',
      email: 'owner2@demo.com',
      passwordHash: ownerPasswordHash,
      address: 'Building 45, North Park Boulevard, Silicon Corridor 560066',
      role: 'STORE_OWNER',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Sophia Bennett Store Owner',
      email: 'owner3@demo.com',
      passwordHash: ownerPasswordHash,
      address: 'Unit 8, High Street Promenade, Downtown Avenue 560025',
      role: 'STORE_OWNER',
    },
  });

  // Eligible store owner without a store (for testing Admin Add Store)
  const owner4 = await prisma.user.create({
    data: {
      name: 'Julian Montgomery Owner',
      email: 'owner4@demo.com',
      passwordHash: ownerPasswordHash,
      address: 'Suite 204, Nexus Mall, Eastern Expressway, City 560048',
      role: 'STORE_OWNER',
    },
  });

  console.log('Created Store Owners.');

  // 3. Create Normal Users
  // Names: 25-27 characters
  const user1 = await prisma.user.create({
    data: {
      name: 'David Jonathan Miller User',
      email: 'user@demo.com',
      passwordHash: userPasswordHash,
      address: 'Flat 402, Oakwood Residences, Green Lake Road 560034',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Catherine Elizabeth Davis',
      email: 'user2@demo.com',
      passwordHash: userPasswordHash,
      address: 'House 18, Sunset Valley Enclave, Heritage District 560078',
      role: 'USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Benjamin Arthur Wilson User',
      email: 'user3@demo.com',
      passwordHash: userPasswordHash,
      address: 'Apartment 3B, Silver Palms, Riverside Boulevard 560008',
      role: 'USER',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Samantha Grace Taylor User',
      email: 'user4@demo.com',
      passwordHash: userPasswordHash,
      address: 'Villa 7, Jasmine Meadows, Orchid Avenue, City 560095',
      role: 'USER',
    },
  });

  console.log('Created Normal Users.');

  // 4. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Apex Electronics & Smart Devices',
      email: 'contact@apexelectronics.com',
      address: 'Level 1, Westside Galleria, Commercial Street, City 560001',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Bluebird Organic Gourmet Market',
      email: 'support@bluebirdmarket.com',
      address: 'Building 45, North Park Boulevard, Silicon Corridor 560066',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Starlight Luxury Fashion Boutique',
      email: 'concierge@starlightboutique.com',
      address: 'Unit 8, High Street Promenade, Downtown Avenue 560025',
      ownerId: owner3.id,
    },
  });

  console.log('Created Stores.');

  // 5. Create Ratings
  // Store 1: Rated by User1 (5), User2 (4), User3 (4) -> avg 4.33
  await prisma.rating.create({
    data: { userId: user1.id, storeId: store1.id, rating: 5 },
  });
  await prisma.rating.create({
    data: { userId: user2.id, storeId: store1.id, rating: 4 },
  });
  await prisma.rating.create({
    data: { userId: user3.id, storeId: store1.id, rating: 4 },
  });

  // Store 2: Rated by User1 (4), User3 (5), User4 (5) -> avg 4.67
  await prisma.rating.create({
    data: { userId: user1.id, storeId: store2.id, rating: 4 },
  });
  await prisma.rating.create({
    data: { userId: user3.id, storeId: store2.id, rating: 5 },
  });
  await prisma.rating.create({
    data: { userId: user4.id, storeId: store2.id, rating: 5 },
  });

  // Store 3: Rated by User2 (3), User4 (4) -> avg 3.50
  await prisma.rating.create({
    data: { userId: user2.id, storeId: store3.id, rating: 3 },
  });
  await prisma.rating.create({
    data: { userId: user4.id, storeId: store3.id, rating: 4 },
  });

  console.log('Created Initial Ratings.');
  console.log('--- Database Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
