// router
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const customerRouter = createTRPCRouter({
    getCustomers: publicProcedure
        .input(z.object({
            page: z.number().min(1),
            itemsPerPage: z.number().min(1),
        }))
        .query(async ({ ctx, input }) => {
            const { page, itemsPerPage } = input;
            const skip = (page - 1) * itemsPerPage;

            const customers = await ctx.db.customer.findMany({
                skip,
                take: itemsPerPage,
                include: {
                    Transaction: true,
                    PaymentRecord: true,
                },
                orderBy: {
                    last_name: 'asc',
                },
            });

            const totalCount = await ctx.db.customer.count();

            return {
                items: customers,
                totalCount: totalCount || 0,
            };
        }),

    create: publicProcedure
        .input(
            z.object({
                id: z.string(),
                first_name: z.string(),
                last_name: z.string(),
                contact_number: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, last_name, first_name, contact_number } = input;

            const newEmployee = await ctx.db.customer.create({
                data: {
                    id,
                    last_name,
                    first_name,
                    contact_number,
                },
            });

            return newEmployee;
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                first_name: z.string(),
                last_name: z.string(),
                contact_number: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, last_name, first_name, contact_number } = input;
            return await ctx.db.customer.update({
                where: { id },
                data: {
                    last_name,
                    first_name,
                    contact_number,
                },
            });
        }),
    getCustomerById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.customer.findUnique({
                where: { id: input.id },
            });
        }),
    getCustomerCredit: publicProcedure
        .input(z.object({
            id: z.string(),
            page: z.number().min(1).default(1),
            itemsPerPage: z.number().min(1).default(10),
            date_range: z
                .object({
                    from: z.date().nullable(),
                    to: z.date().nullable(),
                })
                .optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { id, page, itemsPerPage, date_range } = input;
            const skip = (page - 1) * itemsPerPage;
            const filters: any = {
                customer_id: id,
                is_fully_paid: false
            };

            if (date_range?.from || date_range?.to) {
                filters.createdAt = {};

                if (date_range.from) {
                    filters.createdAt.gte = date_range.from;
                }

                if (date_range.to) {
                    filters.createdAt.lte = date_range.to;
                }
            }

            const orders = await ctx.db.transaction.findMany({
                where: filters,
                include: {
                    Orders: {
                        include: {
                            Product: true,
                            ProductPrice: true
                        },
                    },
                    PaymentRecordList: true,
                    Customer: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: itemsPerPage,
            });


            const totalOrders = await ctx.db.transaction.count({
                where: filters,
            });

            const total_cost = await ctx.db.transaction.aggregate({
                where: {
                    ...filters,
                    transaction_type: 'CREDIT',
                },
                _sum: {
                    total_cost: true,
                    total_paid: true
                },
            });

            const total = (total_cost._sum?.total_cost ?? 0) - (total_cost._sum?.total_paid ?? 0);

            return {
                orders,
                totalOrders,
                total_cost: total,
            };
        }),

    getCustomerHistory: publicProcedure
        .input(z.object({
            id: z.string(),
            page: z.number().min(1).default(1),
            itemsPerPage: z.number().min(1).default(10),
            date_range: z
                .object({
                    from: z.date().nullable(),
                    to: z.date().nullable(),
                })
                .optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { id, page, itemsPerPage, date_range } = input;
            const skip = (page - 1) * itemsPerPage;
            const filters: any = {
                customer_id: id,
                is_fully_paid: true
            };

            if (date_range?.from || date_range?.to) {
                filters.createdAt = {};

                if (date_range.from) {
                    filters.createdAt.gte = date_range.from;
                }

                if (date_range.to) {
                    filters.createdAt.lte = date_range.to;
                }
            }

            const history = await ctx.db.transaction.findMany({
                where: filters,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: itemsPerPage,
            });

            const totalHistory = await ctx.db.transaction.count({
                where: filters
            });

            return {
                history,
                totalHistory,
            };
        }),
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.customer.delete({
                where: { id: input.id },
            });
        }),

    payCredits: publicProcedure
        .input(
            z.object({
                id: z.string(),
                payment: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, payment } = input;

            const transactions = await ctx.db.transaction.findMany({
                where: {
                    customer_id: id,
                    is_fully_paid: false,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

            let remainingPayment = payment;

            for (const transaction of transactions) {
                const outstandingBalance = transaction.total_cost - transaction.total_paid;

                if (remainingPayment <= 0) break;

                if (remainingPayment >= outstandingBalance) {
                    const transactionProcess = await ctx.db.transaction.update({
                        where: { id: transaction.id },
                        data: {
                            total_paid: transaction.total_cost,
                            is_fully_paid: true,
                        },
                    });

                    const paymentRecord = await ctx.db.paymentRecord.create({
                        data: {
                            customer_id: id,
                            amount: transaction.total_cost,
                        }
                    })

                    if (transactionProcess && paymentRecord) {
                        await ctx.db.paymentRecordList.create({
                            data: {
                                amount: transaction.total_cost,
                                transaction_id: transaction.id,
                                payment_record_id: paymentRecord.id,
                            }
                        })
                    }

                    remainingPayment -= transaction.total_cost;
                } else {
                    const transactionProcess = await ctx.db.transaction.update({
                        where: { id: transaction.id },
                        data: {
                            total_paid: transaction.total_paid + remainingPayment,
                        },
                    });

                    const paymentRecord = await ctx.db.paymentRecord.create({
                        data: {
                            customer_id: id,
                            amount: payment,
                        }
                    })

                    if (transactionProcess && paymentRecord) {
                        await ctx.db.paymentRecordList.create({
                            data: {
                                amount: payment,
                                transaction_id: transaction.id,
                                payment_record_id: paymentRecord.id,
                            }
                        })
                    }

                    remainingPayment = 0;
                    break;
                }
            }

            return {
                remainingPayment,
                updatedTransactions: transactions.map((t) => ({
                    id: t.id,
                    total_paid: t.total_paid,
                    is_fully_paid: t.is_fully_paid,
                })),
            };
        }),
});
