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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, amount, image, category } = input;

      const existingProduct = await ctx.db.product.findFirst({
        where: {
          name: name,
        },
      });

      if (existingProduct) {
        throw new Error("A product with this name already exists.");
      }

      const newProduct = await ctx.db.product.create({
        data: {
          name,
          image_url: image,
          category_id: category,
          status: "NOT_AVAILABLE",
          ProductPriceHistory: {
            create: {
              amount,
            },
          },
        },
      });

      return newProduct;
    }),

  getCategories: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.category.findMany({
      orderBy: { name: "asc" },
    });
    return post ?? null;
  }),

  getProducts: publicProcedure
    .input(z.object({ page: z.number().min(1), pageSize: z.number().min(1) }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const products = await ctx.db.product.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          Category: true,
          ProductPriceHistory: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          StockHistory: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      const latestData = products.map((product) => {
        const latestPriceHistory = product.ProductPriceHistory[0];
        const totalQuantity = product.StockHistory.reduce(
          (sum, stock) => sum + stock.quantity,
          0,
        );
        return {
          ...product,
          amount: latestPriceHistory ? latestPriceHistory.amount : 0,
          quantity: totalQuantity,
        };
      });

      const totalProducts = await ctx.db.product.count();

      return { products: latestData, totalProducts };
    }),

  getArchivedProducts: publicProcedure
    .input(z.object({ page: z.number().min(1), pageSize: z.number().min(1) }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const [products, totalProducts, categories] = await ctx.db.$transaction([
        ctx.db.archivedProduct.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            name: true,
            image_url: true,
            category_id: true,
            status: true,
          },
        }),
        ctx.db.archivedProduct.count(),
        ctx.db.category.findMany({
          select: {
            id: true,
            name: true,
          },
        }),
      ]);

      const productsWithCategories = products.map(product => ({
        ...product,
        categoryName: categories.find(cat => cat.id === product.category_id)?.name || 'Unknown',
      }));

      return { products: productsWithCategories, totalProducts };
    }),

  getProductsHistory: publicProcedure
    .input(z.object({ product_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { product_id } = input;
      return await ctx.db.productPriceHistory.findMany({
        where: {
          product_id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1),
        amount: z.number().positive(),
        image: z.string().url().optional().or(z.literal("")),
        category: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, amount, image, category } = input;
      return await ctx.db.product.update({
        where: { id },
        data: {
          name,
          image_url: image,
          category_id: category,
          ProductPriceHistory: {
            create: {
              amount,
            },
          },
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
      });

      if (!product) throw new Error("Product not found");

      await ctx.db.archivedProduct.create({
        data: {
          original_product_id: product.id,
          name: product.name,
          image_url: product.image_url,
          category_id: product.category_id,
          status: product.status,
        },
      });

      await ctx.db.productPriceHistory.deleteMany({
        where: { product_id: input.id },
      });

      await ctx.db.stockHistory.deleteMany({
        where: { product_id: input.id },
      });

      return await ctx.db.product.delete({
        where: { id: input.id },
      });
    }),

  deleteArchive: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.archivedProduct.delete({
        where: { id: input.id },
      });
    }),

  restore: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.archivedProduct.findUnique({
        where: { id: input.id },
      });

      if (!product) throw new Error("Product not found");

      await ctx.db.product.create({
        data: {
          name: product.name ?? '',
          image_url: product.image_url ?? '',
          category_id: product.category_id ?? 0,
          status: "NOT_AVAILABLE",
          ProductPriceHistory: {
            create: {
              amount: 0,
            },
          },
        },
      });

      await ctx.db.archivedProduct.deleteMany({
        where: { id: input.id },
      });
    }),


  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(["AVAILABLE", "NOT_AVAILABLE"]),
      }),
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
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          Category: true,
          ProductPriceHistory: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          StockHistory: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (product) {
        const latestPriceHistory = product.ProductPriceHistory[0];
        const totalQuantity = product.StockHistory.reduce(
          (sum, stock) => sum + stock.quantity,
          0,
        );
        return {
          ...product,
          amount: latestPriceHistory ? latestPriceHistory.amount : 0,
          quantity: totalQuantity,
        };
      }

      return null;
    }),
});
