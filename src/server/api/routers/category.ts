import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const categoryRouter = createTRPCRouter({
    create: publicProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.category.create({
                data: {
                    name: input.name,
                },
            });
        }),
    getCategories: publicProcedure
        .input(z.object({
            page: z.number().min(1),
            itemsPerPage: z.number().min(1),
        }))
        .query(async ({ ctx, input }) => {
            const { page, itemsPerPage } = input;
            const skip = (page - 1) * itemsPerPage;

            const categories = await ctx.db.category.findMany({
                skip,
                take: itemsPerPage,
                orderBy: { name: "asc" },
            });

            const totalCount = await ctx.db.category.count();

            return {
                categories,
                totalCount,
            };
        }),
    updateCategory: publicProcedure
        .input(z.object({ id: z.number(), name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.category.update({
                where: { id: input.id },
                data: { name: input.name },
            });
        }),

    deleteCategory: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.category.delete({
                where: { id: input.id },
            });
        }),
});
