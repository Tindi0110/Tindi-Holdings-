import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { AuditRepository } from "../repositories/audit.repository";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const logAction = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        receiptId: z.string().uuid(),
        action: z.string(),
        userId: z.string().uuid().nullable().optional(),
        ipAddress: z.string().optional(),
        device: z.string().optional(),
        browser: z.string().optional(),
        os: z.string().optional(),
        details: z.record(z.any()).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await AuditRepository.insert(data);
    return { success: true };
  });

export const getAuditLog = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        receiptId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    return AuditRepository.findByFilter(data);
  });
