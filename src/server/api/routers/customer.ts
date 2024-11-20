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
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const order = await ctx.db.transaction.findMany({
                where: {
                    customer_id: input.id,
                    is_fully_paid: false,
                },
                include: {
                    Orders: true,
                    PaymentRecordList: true,
                    Customer: true,
                }
            });

            const total_cost = await ctx.db.transaction.aggregate({
                where: {
                    customer_id: input.id,
                    is_fully_paid: false,
                    transaction_type: 'CREDIT',
                },
                _sum: {
                    total_cost: true,
                    total_paid: true
                },
            })

            const history = await ctx.db.transaction.findMany({
                where: {
                    customer_id: input.id,
                    is_fully_paid: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            const total = (total_cost?._sum.total_cost || 0)-(total_cost?._sum.total_paid || 0)

            return {
                order,
                total_cost: total,
                history
            }
        }),
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.customer.delete({
                where: { id: input.id },
            });
        }),
});
