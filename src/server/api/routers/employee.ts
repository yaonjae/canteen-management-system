// router
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const employeeRouter = createTRPCRouter({
  getEmployees: publicProcedure.input(
    z.object({
      searchQuery: z.string().optional(),
      skip: z.number().optional(),
      take: z.number().optional(),
    })
  ).query(async ({ ctx, input }) => {
    const filters: any = {};

    if (input.searchQuery) {
      filters.last_name = {
        contains: input.searchQuery,
        mode: "insensitive",
      };
    }

    const employees = await ctx.db.cashier.findMany({
      where: filters,
      include: {
        Transaction: true,
      },
      orderBy: {
        last_name: "asc",
      },
      skip: input.skip,
      take: input.take,
    });

    const totalRecords = await ctx.db.cashier.count({
      where: filters,
    });

    return {
      employees,
      totalRecords,
    };
  }),
  create: publicProcedure
    .input(
      z.object({
        first_name: z.string(),
        last_name: z.string(),
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { last_name, first_name, username, password } = input;

      const newEmployee = await ctx.db.cashier.create({
        data: {
          last_name,
          first_name,
          username,
          password,
        },
      });

      return newEmployee;
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.cashier.delete({
        where: { id: input.id },
      });
    }),
  getEmployeeById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.cashier.findUnique({
        where: { id: input.id },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        first_name: z.string(),
        last_name: z.string(),
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, last_name, first_name, username, password } = input;
      return await ctx.db.cashier.update({
        where: { id },
        data: {
          last_name,
          first_name,
          username,
          password,
        },
      });
    }),
});
