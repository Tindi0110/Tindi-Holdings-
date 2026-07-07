import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createStripeCheckout, getPaymentStatus, simulateCOD } from "../core/payment.service";
import { toast } from "sonner";

export function useCreateStripeCheckout() {
  return useMutation({
    mutationFn: (orderId: string) => createStripeCheckout({ data: { orderId } }),
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function usePaymentStatus(orderId: string) {
  return useQuery({
    queryKey: ["payment", "status", orderId],
    queryFn: () => getPaymentStatus({ data: { orderId } }),
    enabled: !!orderId
  });
}

export function useSimulateCOD() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => simulateCOD({ data: { orderId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Payment marked as paid via Cash on Delivery!");
    },
    onError: (e: Error) => toast.error(e.message)
  });
}