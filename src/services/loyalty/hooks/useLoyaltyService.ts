import { useQuery } from "@tanstack/react-query";
import { getMyLoyaltyAccount, getRedemptionRules } from "../core/loyalty.service";

export function useLoyaltyAccount() {
  return useQuery({ queryKey: ["loyalty", "account"], queryFn: () => getMyLoyaltyAccount() });
}

export function useRedemptionRules() {
  return useQuery({ queryKey: ["loyalty", "rules"], queryFn: () => getRedemptionRules() });
}
