// router
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                name: z.string().min(1),
                amount: z.number().positive(),
                image: z.string().url(),
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
        });
    }),
});
