import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShippingMethods,
  getOrderTracking,
  updateDeliveryStatus,
} from "../core/shipping.service";
import { toast } from "sonner";

export function useShippingMethods() {
  return useQuery({ queryKey: ["shipping", "methods"], queryFn: () => getShippingMethods() });
}

export function useOrderTracking(orderNumber: string, email: string) {
  return useQuery({
    queryKey: ["shipping", "tracking", orderNumber, email],
    queryFn: () => getOrderTracking({ data: { orderNumber, email } }),
    enabled: !!orderNumber && !!email,
  });
}

export function useUpdateDeliveryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { orderId: string; status: string }) => updateDeliveryStatus({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Delivery status updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
