import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calculateTotals, getShippingOptions, validateCoupon, initiateCheckout } from "../core/checkout.service";
import { toast } from "sonner";

export function useCalculateTotals() {
  return useQuery({ queryKey: ["checkout", "totals"], queryFn: () => calculateTotals() });
}

export function useShippingOptions() {
  return useQuery({ queryKey: ["checkout", "shipping-options"], queryFn: () => getShippingOptions() });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (code: string) => validateCoupon({ data: { code } }),
    onSuccess: (data) => {
      if (data.valid) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    }
  });
}

export function useInitiateCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => initiateCheckout({ data: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order placed successfully!");
    },
    onError: (e: Error) => toast.error(e.message)
  });
}