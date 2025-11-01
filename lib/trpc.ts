import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        try {
          console.log('[tRPC] Making request to:', url);
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('[tRPC] Response status:', response.status);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('[tRPC] Error response:', text);
            throw new Error(`HTTP ${response.status}: ${text}`);
          }
          
          return response;
        } catch (error) {
          console.error('[tRPC] Fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});
