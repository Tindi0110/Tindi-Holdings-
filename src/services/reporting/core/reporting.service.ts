import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ReportingRepository } from "../repositories/reporting.repository";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await requireAdmin(context.userId);
    return ReportingRepository.fetchAllMetrics();
  });

export const getRevenueChart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await requireAdmin(context.userId);
    return ReportingRepository.fetchDailyRevenue();
  });

export const getBranchPerformance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await requireAdmin(context.userId);
    return ReportingRepository.fetchBranchRevenue();
  });

export const getTopProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await requireAdmin(context.userId);
    return ReportingRepository.fetchTopProducts();
  });
