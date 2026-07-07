import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listSuppliers, listPurchaseOrders, createSupplier, createPurchaseOrder } from "../core/supplier.service";
import { toast } from "sonner";

export function useSuppliers(isAdmin: boolean) {
  return useQuery({ queryKey: ["admin", "suppliers"], queryFn: () => listSuppliers(), enabled: isAdmin });
}

export function usePurchaseOrders(isAdmin: boolean) {
  return useQuery({ queryKey: ["admin", "purchase-orders"], queryFn: () => listPurchaseOrders(), enabled: isAdmin });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createSupplier({ data: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "suppliers"] });
      toast.success("Supplier registered successfully!");
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createPurchaseOrder({ data: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "purchase-orders"] });
      toast.success("Purchase order created as draft!");
    },
    onError: (e: Error) => toast.error(e.message)
  });
}