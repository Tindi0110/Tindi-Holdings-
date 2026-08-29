import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { UserRepository } from "../repositories/user.repository";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    return UserRepository.findById(context.userId);
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        full_name: z.string().optional(),
        avatar_url: z.string().optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await UserRepository.update(context.userId, data);
    return { success: true };
  });

export const listAdminUsers = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        search: z.string().optional(),
        branchId: z.string().uuid().optional(),
        role: z.string().optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    return UserRepository.findAll(data);
  });

export const assignRole = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z.object({ userId: z.string().uuid(), role: z.string() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    await UserRepository.upsertRole(data.userId, data.role);
    return { success: true };
  });
