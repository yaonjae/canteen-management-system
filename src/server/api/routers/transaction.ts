// router
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const transactionRouter = createTRPCRouter({
    getTransactions: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.transaction.findMany({
            include: {
                Cashier: true,
                Customer: true,
                Orders: true,
                PaymentRecordList: true
            },
            orderBy: {
                id: 'asc',
            }
        });
    }),
});
