import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listMyOrders,
  getMyOrder,
  placeOrder,
  trackOrder,
  listAdminOrders,
  updateOrderStatus,
} from "../core/order.service";
import { toast } from "sonner";

export function useMyOrders() {
  return useQuery({ queryKey: ["orders", "my"], queryFn: () => listMyOrders() });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => getMyOrder({ data: { id } }),
    enabled: !!id,
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => placeOrder({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTrackOrder() {
  return useMutation({
    mutationFn: (data: { orderNumber: string; email: string }) => trackOrder({ data }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminOrders(filter?: any) {
  return useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: () => listAdminOrders({ data: filter ?? {} }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; status: string }) => updateOrderStatus({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order status updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
