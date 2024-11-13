// router
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const customerRouter = createTRPCRouter({
    getCustomers: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.customer.findMany({
            include: {
                Transaction: true,
                PaymentRecord: true,
            },
            orderBy: {
                last_name: 'asc',
            }
        });
    }),
});
