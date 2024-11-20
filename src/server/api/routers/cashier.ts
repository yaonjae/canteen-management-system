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
        }),

    getProducts: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.product.findMany({
            where: {
                status: 'AVAILABLE',
            },
            include: {
                Category: true,
            },
            orderBy: {
                name: 'asc',
            }
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
