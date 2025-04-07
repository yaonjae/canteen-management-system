import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const cashierRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                cashierId: z.number(),
                customerId: z.string().optional().nullable(),
                transactionType: z.enum(["CASH", "CREDIT"]),
                totalCost: z.number(),
                totalPaid: z.number(),
                orders: z.array(
                    z.object({
                        productId: z.number(),
                        quantity: z.number(),
                        product_price_id: z.number(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { cashierId, customerId, transactionType, totalCost, totalPaid, orders } = input;

            const transaction = await ctx.db.transaction.create({
                data: {
                    cashier_id: cashierId,
                    customer_id: customerId,
                    transaction_type: transactionType,
                    total_cost: totalCost,
                    total_paid: transactionType === 'CASH' ? totalPaid : 0,
                    is_fully_paid: transactionType === 'CASH' ? true : false,
                    Orders: {
                        create: orders.map((order) => ({
                            product_id: order.productId,
                            product_price_id: order.product_price_id,
                            quantity: order.quantity
                        }))
                    }
                },
            });
            if (transactionType === 'CASH') {
                if (customerId) {
                    const paymentRecord = await ctx.db.paymentRecord.create({
                        data: {
                            customer_id: customerId,
                            amount: totalPaid,
                        }
                    })


                    if (transaction && paymentRecord) {
                        await ctx.db.paymentRecordList.create({
                            data: {
                                amount: totalCost,
                                transaction_id: transaction.id,
                                payment_record_id: paymentRecord.id,
                            }
                        })
                    }
                }
            }

            for (const order of orders) {
                await ctx.db.stockHistory.create({
                    data: {
                        product_id: order.productId,
                        quantity: -order.quantity,
                    }
                });
            }
        }),

    getProducts: publicProcedure.query(async ({ ctx }) => {
        const products = await ctx.db.product.findMany({
            where: {
                status: 'AVAILABLE',
            },
            include: {
                Category: true,
                ProductPriceHistory: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
                StockHistory: {
                    select: {
                        quantity: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        const sortedProducts = products.sort((a, b) => {
            const sumA = a.StockHistory.reduce((acc, curr) => acc + curr.quantity, 0);
            const sumB = b.StockHistory.reduce((acc, curr) => acc + curr.quantity, 0);
            return sumB - sumA; // descending by stock sum
          });

        return sortedProducts.map(product => {
            const quantity = product.StockHistory.reduce(
                (sum, stock) => sum + stock.quantity,
                0
            );
            return {
                ...product,
                quantity,
            };
        });
    }),

    getCustomer: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.customer.findMany({
            orderBy: {
                last_name: 'asc',
            }
        });
    }),
});
