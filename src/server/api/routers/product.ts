// router
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                name: z.string().min(1),
                amount: z.number().positive(),
                image: z.string(),
                category: z.number().int().positive(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { name, amount, image, category } = input;

            const newProduct = await ctx.db.product.create({
                data: {
                    name,
                    amount,
                    image_url: image,
                    category_id: category,
                    status: "AVAILABLE",
                },
            });

            return newProduct;
        }),

    getProducts: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.product.findMany({
            include: {
                Category: true,
            },
            orderBy: {
                name: 'asc',
            }
        });
    }),

    update: publicProcedure
        .input(
            z.object({
                id: z.number().int(),
                name: z.string().min(1),
                amount: z.number().positive(),
                image: z.string().url(),
                category: z.number().int().positive(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, name, amount, image, category } = input;
            return await ctx.db.product.update({
                where: { id },
                data: {
                    name,
                    amount,
                    image_url: image,
                    category_id: category,
                },
            });
        }),

    delete: publicProcedure
        .input(z.object({ id: z.number().int() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.product.delete({
                where: { id: input.id },
            });
        }),

    updateStatus: publicProcedure
        .input(
            z.object({
                id: z.number().int(),
                status: z.enum(['AVAILABLE', 'NOT_AVAILABLE']),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, status } = input;
            return await ctx.db.product.update({
                where: { id },
                data: {
                    status,
                },
            });
        }),

    getProductById: publicProcedure
        .input(z.object({ id: z.number().int() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.product.findUnique({
                where: { id: input.id },
                include: { Category: true },
            });
        }),
});
