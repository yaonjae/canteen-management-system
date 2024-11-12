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
    getCategories: publicProcedure.query(async ({ ctx }) => {
        const post = await ctx.db.category.findMany({
            orderBy: { name: "asc" },
        });
        return post ?? null;
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
