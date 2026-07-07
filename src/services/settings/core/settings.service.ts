import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SettingsRepository } from "../repositories/settings.repository";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const getGlobalSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    return SettingsRepository.findGlobal();
  });

export const updateGlobalSettings = createServerFn({ method: "POST" })
  .inputValidator((input: any) => z.object({
    company_name: z.string().min(1),
    company_logo: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    website: z.string().url().nullable().optional(),
    tagline: z.string().nullable().optional(),
    tax_registration_number: z.string().nullable().optional(),
    currency_default: z.string().default("KES"),
    paper_size: z.string().default("80mm"),
    return_policy: z.string().nullable().optional(),
    terms: z.string().nullable().optional(),
    footer_message: z.string().nullable().optional()
  }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    await SettingsRepository.upsertGlobal(data);
    return { success: true };
  });

export const getBranchSettings = createServerFn({ method: "POST" })
  .inputValidator((input: { branchId: string }) => z.object({ branchId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    return SettingsRepository.findByBranch(data.branchId);
  });

export const updateBranchSettings = createServerFn({ method: "POST" })
  .inputValidator((input: any) => z.object({
    branchId: z.string().uuid(),
    company_name: z.string().optional(),
    company_logo: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    website: z.string().url().nullable().optional(),
    tagline: z.string().nullable().optional(),
    tax_registration_number: z.string().nullable().optional(),
    currency_default: z.string().optional(),
    paper_size: z.string().optional()
  }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { branchId, ...settings } = data;
    await SettingsRepository.upsertBranch(branchId, settings);
    return { success: true };
  });

export const getFeatureFlags = createServerFn({ method: "GET" })
  .handler(async () => {
    return [
      { name: "loyalty-program", enabled: true, description: "Earn and redeem loyalty points on checkout." },
      { name: "returns-vouchers", enabled: true, description: "Generate digital refund vouchers automatically." },
      { name: "sms-notifications", enabled: false, description: "Send order status notifications via SMS." }
    ];
  });