import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LoyaltyRepository } from "../repositories/loyalty.repository";

export const getMyLoyaltyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    return LoyaltyRepository.computeAccountFromOrders(context.userId);
  });

export const getRedemptionRules = createServerFn({ method: "GET" })
  .handler(async () => {
    return LoyaltyRepository.getRedemptionRules();
  });