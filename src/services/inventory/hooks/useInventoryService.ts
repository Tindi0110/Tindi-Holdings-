import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStockLevels,
  getLowStockAlerts,
  adjustStock,
  bulkAdjust,
} from "../core/inventory.service";
import { toast } from "sonner";

export function useStockLevels() {
  return useQuery({ queryKey: ["inventory", "stock"], queryFn: () => getStockLevels() });
}

export function useLowStockAlerts() {
  return useQuery({ queryKey: ["inventory", "low-stock"], queryFn: () => getLowStockAlerts() });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; quantityDelta: number; reason: string }) =>
      adjustStock({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Stock adjusted!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBulkAdjust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      adjustments: Array<{ productId: string; quantityDelta: number; reason: string }>,
    ) => bulkAdjust({ data: { adjustments } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Bulk adjustment complete!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
