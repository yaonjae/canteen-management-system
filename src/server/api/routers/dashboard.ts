import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { startOfMonth, endOfMonth } from "date-fns";

export const dashboardRouter = createTRPCRouter({
    getDashboardData: publicProcedure.query(async ({ ctx }) => {
        const [transactions, orders, customerCount, productCount, overallSalesResult, monthlySalesResult] = await Promise.all([
            ctx.db.transaction.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: 10,
                include: {
                    Cashier: true,
                    Customer: true,
                    Orders: true,
                    PaymentRecordList: true,
                },
            }),
            ctx.db.orders.findMany({
                orderBy: {
                    Transaction: {
                        createdAt: 'desc'
                    }
                },
                take: 5,
                include: {
                    Transaction: true,
                    Product: true
                },
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

        return {
            transactions,
            orders,
            customerCount,
            productCount,
            overallSales,
            monthlySales,
        };
    }),
});

