import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { group } from "console";
import { transaction_type } from "@prisma/client";

export const transactionRouter = createTRPCRouter({
  getTransactions: publicProcedure
    .input(
      z.object({
        last_name: z.string().optional(),
        transaction_type: z.string().optional(),
        is_fully_paid: z.string().optional(),
        date_range: z
          .object({
            from: z.date().nullable().optional(),
            to: z.date().nullable().optional(),
          })
          .optional(),
        skip: z.number().optional(),
        take: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const filters: any = {};

      if (input.transaction_type) {
        filters.transaction_type = input.transaction_type;
      }

      if (input.is_fully_paid) {
        filters.is_fully_paid = input.is_fully_paid === "true";
      }

      if (input.date_range?.from && input.date_range?.to) {
        filters.createdAt = {
          gte: input.date_range.from,
          lte: input.date_range.to,
        };
      }

      const transactions = await ctx.db.transaction.findMany({
        where: filters,
        include: {
          Cashier: true,
          Customer: true,
          Orders: true,
          PaymentRecordList: true,
        },
        orderBy: {
          id: "asc",
        },
        skip: input.skip,
        take: input.take,
      });

      const totalRecords = await ctx.db.transaction.count({
        where: filters,
      });

      return {
        transactions,
        totalRecords,
      };
    }),

  getSales: publicProcedure
    .input(
      z.object({
        date_range: z
          .object({
            from: z.date().nullable(),
            to: z.date().nullable(),
          })
          .optional(),
        page: z.number().min(1),
        itemsPerPage: z.number().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, itemsPerPage, date_range } = input;
      const skip = (page - 1) * itemsPerPage;
      const filters: any = { is_fully_paid: true };

      if (date_range?.from && date_range?.to) {
        filters.createdAt = {
          gte: date_range.from,
          lte: date_range.to,
        };
      }

      const transaction = await ctx.db.transaction.findMany({
        where: filters,
        skip,
        take: itemsPerPage,
        orderBy: { id: "asc" },
      });

      const totalCount = await ctx.db.transaction.count({ where: filters });

      const totalcostResult = await ctx.db.transaction.aggregate({
        where: filters,
        _sum: { total_cost: true },
      });

      const totalcashResult = await ctx.db.transaction.aggregate({
        where: { ...filters, transaction_type: "CASH" },
        _count: { id: true },
      });

      const totalcreditResult = await ctx.db.transaction.aggregate({
        where: { ...filters, transaction_type: "CREDIT" },
        _count: { id: true },
      });

      return {
        transaction,
        totalcost: totalcostResult?._sum.total_cost || 0,
        totalcash: totalcashResult?._count.id || 0,
        totalcredit: totalcreditResult?._count.id || 0,
        totalCount,
      };
    }),

  getSalesByProductOverview: publicProcedure
    .input(
      z.object({
        productId: z.number(),
        date_range: z
          .object({
            from: z.date().nullable(),
            to: z.date().nullable(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { productId } = input;
      //   const filters: any = {
      //     "Orders.product_id": productId,
      //   };

      const transactions = await ctx.db.transaction.findMany({
        where: {
          Orders: {
            some: {
              product_id: productId, // Filter based on the product_id in the Orders relation
            },
          },
        },
        include: {
          Orders: true,
        },
      });

      const totalCount = transactions.length;

      const totalcostResult = await ctx.db.transaction.aggregate({
        where: {
          Orders: {
            some: {
              product_id: productId, // Filter based on the product_id in the Orders relation
            },
          },
        },
        _sum: { total_cost: true },
      });

      const totalcashResult = await ctx.db.transaction.aggregate({
        where: {
          Orders: {
            some: {
              product_id: productId, // Filter based on the product_id in the Orders relation
            },
          },
          transaction_type: "CASH",
        },
        _count: { id: true },
      });

      const totalcreditResult = await ctx.db.transaction.aggregate({
        where: {
          Orders: {
            some: {
              product_id: productId, // Filter based on the product_id in the Orders relation
            },
          },
          transaction_type: "CREDIT",
        },
        _count: { id: true },
      });

      return {
        totalCount,
        totalcash: totalcashResult?._count.id || 0,
        totalcredit: totalcreditResult?._count.id || 0,
        totalcost: totalcostResult?._sum.total_cost || 0,
      };
    }),

  getAllSales: publicProcedure
    .input(
      z.object({
        date_range: z
          .object({
            from: z.date().nullable(),
            to: z.date().nullable(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { date_range } = input;
      const filters: any = { is_fully_paid: true };

      if (date_range?.from && date_range?.to) {
        filters.createdAt = {
          gte: date_range.from,
          lte: date_range.to,
        };
      }

      const transaction = await ctx.db.transaction.findMany({
        where: filters,
        orderBy: { id: "asc" },
      });

      const totalCount = await ctx.db.transaction.count({ where: filters });

      const totalcostResult = await ctx.db.transaction.aggregate({
        where: filters,
        _sum: { total_cost: true },
      });

      const totalcashResult = await ctx.db.transaction.aggregate({
        where: { ...filters, transaction_type: "CASH" },
        _count: { id: true },
      });

      const totalcreditResult = await ctx.db.transaction.aggregate({
        where: { ...filters, transaction_type: "CREDIT" },
        _count: { id: true },
      });

      return {
        transaction,
        totalcost: totalcostResult?._sum.total_cost || 0,
        totalcash: totalcashResult?._count.id || 0,
        totalcredit: totalcreditResult?._count.id || 0,
        totalCount,
      };
    }),

  getSalesByProduct: publicProcedure
    .input(
      z.object({
        productId: z.number(),
        date_range: z
          .object({
            from: z.date().nullable(),
            to: z.date().nullable(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { productId, date_range } = input;
      const filters: any = { is_fully_paid: true };

      if (date_range?.from && date_range?.to) {
        filters.createdAt = {
          gte: date_range.from,
          lte: date_range.to,
        };
      }

      const transactions = await ctx.db.transaction.findMany({
        where: {
          ...filters,
          Orders: {
            some: {
              product_id: productId,
            },
          },
        },
        include: {
          Cashier: true,
          Customer: true,
          Orders: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      const totalCount = await ctx.db.transaction.count({
        where: {
          ...filters,
          Orders: {
            some: {
              product_id: productId,
            },
          },
        },
      });

      const totalcostResult = await ctx.db.transaction.aggregate({
        where: {
          ...filters,
          Orders: {
            some: {
              product_id: productId,
            },
          },
        },
        _sum: { total_cost: true },
      });

      return {
        transactions,
        totalcost: totalcostResult?._sum.total_cost || 0,
        totalCount,
      };
    }),

  getProducts: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      include: {
        Category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products;
  }),
});
