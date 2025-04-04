import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProductAmountToHistory() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        ProductPriceHistory: {
          take: 1
        }
      },
    });

    // for (const product of products) {
    //   if (product.amount !== null && product.amount !== undefined) {
    //     await prisma.productPriceHistory.create({
    //       data: {
    //         product_id: product.id,
    //         amount: product.amount,
    //       },
    //     });
    //     await prisma.stockHistory.create({
    //       data: {
    //         product_id: product.id,
    //         quantity: 0,
    //       },
    //     });
    //   }
    // }

    for (const product of products) {
        await prisma.orders.updateMany({
          where: {
            product_id: product.id
          },
          data: {
            product_price_id: product.ProductPriceHistory[0]?.id,
          },
        });
    }

    console.log('Data migration completed successfully.');
  } catch (error) {
    console.error('Error during data migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductAmountToHistory();
