// router
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const stockRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                product_id: z.number(),
                quantity: z.number(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { product_id, quantity } = input;

            return await ctx.db.stockHistory.create({
                data: {
                    product_id,
                    quantity
                },
            });
        }),

    getProducts: publicProcedure
        .input(z.object({ page: z.number().min(1), pageSize: z.number().min(1) }))
        .query(async ({ ctx, input }) => {
            const { page, pageSize } = input;
            const products = await ctx.db.product.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    StockHistory: true
                },
                orderBy: {
                    name: 'asc',
                },
            });

            const latestData = products.map(product => {
                const totalQuantity = product.StockHistory.reduce((sum, stock) => sum + stock.quantity, 0);
                return {
                    ...product,
                    quantity: totalQuantity,
                };
            });

            const totalProducts = await ctx.db.product.count();

            return { products: latestData, totalProducts };
        }),
});
