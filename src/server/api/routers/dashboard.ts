import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { startOfMonth, endOfMonth } from "date-fns";

export const dashboardRouter = createTRPCRouter({
    getDashboardData: publicProcedure.query(async ({ ctx }) => {
        const [transactions, customerCount, productCount, overallSalesResult, monthlySalesResult] = await Promise.all([
            ctx.db.transaction.groupBy({
                by: ['customer_id'],
                where: {
                    is_fully_paid: false,
                    transaction_type: 'CREDIT',
                    customer_id: {
                        not: null,
                    },
                },
                _sum: {
                    total_cost: true,
                    total_paid: true,
                },
                orderBy: {
                    _sum: { 
                        total_cost: 'desc' 
                    },
                },
                take: 5,
            }),
            ctx.db.customer.count(),
            ctx.db.product.count({
                where: {
                    status: 'AVAILABLE',
                },
            }),
            ctx.db.transaction.aggregate({
                where: {
                    is_fully_paid: true,
                },
                _sum: {
                    total_cost: true,
                },
            }),
            ctx.db.transaction.aggregate({
                where: {
                    is_fully_paid: true,
                    createdAt: {
                        gte: startOfMonth(new Date()),
                        lte: endOfMonth(new Date()),
                    },
                },
                _sum: {
                    total_cost: true,
                },
            }),
        ]);

        const overallSales = overallSalesResult?._sum?.total_cost || 0;
        const monthlySales = monthlySalesResult?._sum?.total_cost || 0;

        const customerTransaction = await Promise.all(
            transactions.map(async (transaction) => {
                if (!transaction.customer_id) {
                    return { ...transaction, customer: null };
                }
                const customer = await ctx.db.customer.findUnique({
                    where: { id: transaction.customer_id },
                });
                return {
                    ...transaction,
                    customer,
                };
            })
        );

        return {
            transactions: customerTransaction,
            customerCount,
            productCount,
            overallSales,
            monthlySales,
        };
    }),
});

