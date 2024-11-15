import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { adminRouter } from "./routers/admin";
import { categoryRouter } from "./routers/category";
import { productRouter } from "./routers/product";
import { transactionRouter } from "./routers/transaction";
import { employeeRouter } from "./routers/employee";
import { customerRouter } from "./routers/customer";
import { dashboardRouter } from "./routers/dashboard";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin:adminRouter,
  category:categoryRouter,
  product:productRouter,
  transaction:transactionRouter,
  employee:employeeRouter,
  customer:customerRouter,
  dashboard:dashboardRouter
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
