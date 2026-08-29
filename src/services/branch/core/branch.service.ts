import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { BranchRepository } from "../repositories/branch.repository";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const listBranches = createServerFn({ method: "GET" }).handler(async () =>
  BranchRepository.findAll(true),
);

export const listAdminBranches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await requireAdmin(context.userId);
    return BranchRepository.findAll(false);
  });

export const getBranchById = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => BranchRepository.findById(data.id));

export const createBranch = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        name: z.string().min(1),
        address: z.string().optional(),
        phone: z.string().optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const id = await BranchRepository.create(data);
    return { id };
  });

export const updateBranch = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        is_active: z.boolean().optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { id, ...payload } = data;
    await BranchRepository.update(id, payload);
    return { success: true };
  });
