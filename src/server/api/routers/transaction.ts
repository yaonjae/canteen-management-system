import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const transactionRouter = createTRPCRouter({
    getTransactions: publicProcedure.input(
        z.object({
            last_name: z.string().optional(),
            transaction_type: z.string().optional(),
            is_fully_paid: z.string().optional(),
            date_range: z.object({
                from: z.date().nullable().optional(),
                to: z.date().nullable().optional(),
            }).optional(),
        })
    ).query(async ({ ctx, input }) => {
        const filters: any = {};

        if (input.transaction_type) {
            filters.transaction_type = input.transaction_type;
        }

        if (input.is_fully_paid) {
            filters.is_fully_paid = input.is_fully_paid === 'true';
        }

        if (input.date_range?.from && input.date_range?.to) {
            filters.createdAt = {
                gte: input.date_range.from,
                lte: input.date_range.to,
            };
        }

        return ctx.db.transaction.findMany({
            where: filters,
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
