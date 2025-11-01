import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

console.log('[Hono] Server initializing...');

app.use("*", cors({
  origin: '*',
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error('[tRPC Server] Error on path', path, ':', error);
    },
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/api", (c) => {
  return c.json({ status: "ok", message: "API endpoint is accessible" });
});

app.all("*", (c) => {
  console.log('[Hono] Unmatched route:', c.req.method, c.req.url);
  return c.json({ error: "Not found", path: c.req.path }, 404);
});

console.log('[Hono] Server initialized and ready to handle requests');
console.log('[Hono] tRPC endpoint: /api/trpc/*');

export default app;
