// router
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const employeeRouter = createTRPCRouter({
    getEmployees: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.cashier.findMany({
            include: {
                Transaction: true,
            },
            orderBy: {
                last_name: 'asc',
            }
        });
    }),
});
