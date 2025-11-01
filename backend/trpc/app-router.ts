import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import gymsList from "./routes/gyms/list/route";
import gymsGetById from "./routes/gyms/getById/route";
import gymsGetCheckIns from "./routes/gyms/getCheckIns/route";
import gymsGetPayments from "./routes/gyms/getPayments/route";
import checkInsCreate from "./routes/checkIns/create/route";
import checkInsList from "./routes/checkIns/list/route";
import subscriptionsGetCurrent from "./routes/subscriptions/getCurrent/route";
import subscriptionsCreate from "./routes/subscriptions/create/route";
import usersGet from "./routes/users/get/route";
import usersUpdateWallet from "./routes/users/updateWallet/route";
import paymentsCreateIntent from "./routes/payments/createIntent/route";
import paymentsConfirm from "./routes/payments/confirm/route";
import adminGetAllUsers from "./routes/admin/getAllUsers/route";
import adminGetAllCheckIns from "./routes/admin/getAllCheckIns/route";
import adminGetAllGyms from "./routes/admin/getAllGyms/route";
import adminCreateGym from "./routes/admin/createGym/route";
import adminDeleteGym from "./routes/admin/deleteGym/route";
import adminGetStats from "./routes/admin/getStats/route";
import { sendOTPProcedure } from "./routes/auth/sendOTP/route";
import { verifyOTPProcedure } from "./routes/auth/verifyOTP/route";
import { registerProcedure } from "./routes/auth/register/route";
import { loginProcedure } from "./routes/auth/login/route";
import { googleLoginProcedure } from "./routes/auth/googleLogin/route";

const exampleRouter = createTRPCRouter({
  hi: hiRoute,
});

const gymsRouter = createTRPCRouter({
  list: gymsList,
  getById: gymsGetById,
  getCheckIns: gymsGetCheckIns,
  getPayments: gymsGetPayments,
});

const checkInsRouter = createTRPCRouter({
  create: checkInsCreate,
  list: checkInsList,
});

const subscriptionsRouter = createTRPCRouter({
  getCurrent: subscriptionsGetCurrent,
  create: subscriptionsCreate,
});

const usersRouter = createTRPCRouter({
  get: usersGet,
  updateWallet: usersUpdateWallet,
});

const paymentsRouter = createTRPCRouter({
  createIntent: paymentsCreateIntent,
  confirm: paymentsConfirm,
});

const adminRouter = createTRPCRouter({
  getAllUsers: adminGetAllUsers,
  getAllCheckIns: adminGetAllCheckIns,
  getAllGyms: adminGetAllGyms,
  createGym: adminCreateGym,
  deleteGym: adminDeleteGym,
  getStats: adminGetStats,
});

const authRouter = createTRPCRouter({
  sendOTP: sendOTPProcedure,
  verifyOTP: verifyOTPProcedure,
  register: registerProcedure,
  login: loginProcedure,
  googleLogin: googleLoginProcedure,
});

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  gyms: gymsRouter,
  checkIns: checkInsRouter,
  subscriptions: subscriptionsRouter,
  users: usersRouter,
  payments: paymentsRouter,
  admin: adminRouter,
  auth: authRouter,
});

console.log('[tRPC Router] Initialized with routes:', Object.keys(appRouter._def.procedures || appRouter));
console.log('[tRPC Router] Available routers:', {
  example: Object.keys(exampleRouter._def.procedures),
  gyms: Object.keys(gymsRouter._def.procedures),
  checkIns: Object.keys(checkInsRouter._def.procedures),
  subscriptions: Object.keys(subscriptionsRouter._def.procedures),
  users: Object.keys(usersRouter._def.procedures),
  payments: Object.keys(paymentsRouter._def.procedures),
  admin: Object.keys(adminRouter._def.procedures),
  auth: Object.keys(authRouter._def.procedures),
});

export type AppRouter = typeof appRouter;
