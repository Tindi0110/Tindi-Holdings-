import { createStart, createMiddleware } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error("[Start Server Error]", error);

    // If the request expects JSON or is a TanStack Start serverFn RPC, return JSON error
    const accept = request?.headers?.get("accept") || "";
    const isJsonRpc = accept.includes("application/json") || request?.url?.includes("/_serverFn");
    if (isJsonRpc) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );
    }

    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
