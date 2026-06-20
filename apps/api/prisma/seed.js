const { PrismaClient, Role, ProductStatus } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const crypto = require('crypto');

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/p_ecommerce?schema=public', {
    schema: 'public',
  }),
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

async function main() {
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      name: 'Demo Seller',
      role: Role.SELLER,
      passwordHash: hashPassword('seller123'),
    },
  });

  await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      name: 'Demo Buyer',
      role: Role.BUYER,
      passwordHash: hashPassword('buyer123'),
    },
  });

  const categories = await Promise.all(
    ['Electronics', 'Lifestyle', 'Home'].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const productCount = await prisma.product.count();
  if (productCount > 0) {
    return;
  }

  await prisma.product.createMany({
    data: [
      {
        name: 'Portable Desk Lamp',
        description: 'Rechargeable lamp for workspaces and bedside use.',
        price: 24.99,
        stock: 18,
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'],
        sellerId: seller.id,
        categoryId: categories[2].id,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'Wireless Earbuds',
        description: 'Compact earbuds with charging case and touch controls.',
        price: 59.5,
        stock: 30,
        images: ['https://images.unsplash.com/photo-1588421357574-87938a86fa28?auto=format&fit=crop&w=900&q=80'],
        sellerId: seller.id,
        categoryId: categories[0].id,
        status: ProductStatus.ACTIVE,
      },
      {
        name: 'Minimalist Notebook',
        description: 'Hardcover notebook for daily planning and journaling.',
        price: 12.0,
        stock: 40,
        images: ['https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80'],
        sellerId: seller.id,
        categoryId: categories[1].id,
        status: ProductStatus.ACTIVE,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
