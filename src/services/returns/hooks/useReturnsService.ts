import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestReturn, getMyReturns, getAdminReturns } from "../core/returns.service";
import { toast } from "sonner";

export function useMyReturns() {
  return useQuery({ queryKey: ["returns", "my"], queryFn: () => getMyReturns() });
}

export function useAdminReturns(isAdmin: boolean) {
  return useQuery({
    queryKey: ["admin", "returns"],
    queryFn: () => getAdminReturns(),
    enabled: isAdmin,
  });
}

export function useRequestReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => requestReturn({ data: payload }),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Return voucher and refund requested successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
