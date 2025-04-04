import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { adminRouter } from "./routers/admin";
import { categoryRouter } from "./routers/category";
import { productRouter } from "./routers/product";
import { transactionRouter } from "./routers/transaction";
import { employeeRouter } from "./routers/employee";
import { customerRouter } from "./routers/customer";
import { dashboardRouter } from "./routers/dashboard";
import { orderRouter } from "./routers/order";
import { cashierRouter } from "./routers/cashier";
import { stockRouter } from "./routers/stock";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin:adminRouter,
  category:categoryRouter,
  product:productRouter,
  stock:stockRouter,
  transaction:transactionRouter,
  employee:employeeRouter,
  customer:customerRouter,
  dashboard:dashboardRouter,
  order:orderRouter,
  cashier:cashierRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
