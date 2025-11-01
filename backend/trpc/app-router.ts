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

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  gyms: createTRPCRouter({
    list: gymsList,
    getById: gymsGetById,
    getCheckIns: gymsGetCheckIns,
    getPayments: gymsGetPayments,
  }),
  checkIns: createTRPCRouter({
    create: checkInsCreate,
    list: checkInsList,
  }),
  subscriptions: createTRPCRouter({
    getCurrent: subscriptionsGetCurrent,
    create: subscriptionsCreate,
  }),
  users: createTRPCRouter({
    get: usersGet,
    updateWallet: usersUpdateWallet,
  }),
  payments: createTRPCRouter({
    createIntent: paymentsCreateIntent,
    confirm: paymentsConfirm,
  }),
  admin: createTRPCRouter({
    getAllUsers: adminGetAllUsers,
    getAllCheckIns: adminGetAllCheckIns,
    getAllGyms: adminGetAllGyms,
    createGym: adminCreateGym,
    deleteGym: adminDeleteGym,
    getStats: adminGetStats,
  }),
  auth: createTRPCRouter({
    sendOTP: sendOTPProcedure,
    verifyOTP: verifyOTPProcedure,
    register: registerProcedure,
    login: loginProcedure,
    googleLogin: googleLoginProcedure,
  }),
});

export type AppRouter = typeof appRouter;
