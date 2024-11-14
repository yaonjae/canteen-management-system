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
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.customer.delete({
                where: { id: input.id },
            });
        }),
});
