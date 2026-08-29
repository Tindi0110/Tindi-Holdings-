import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logAction, getAuditLog } from "../core/audit.service";
import { AuditFilter } from "../interfaces/types";

export function useAuditLog(filter?: AuditFilter, isAdmin?: boolean) {
  return useQuery({
    queryKey: ["admin", "audit", filter],
    queryFn: () => getAuditLog({ data: filter ?? {} }),
    enabled: !!isAdmin,
  });
}

export function useLogAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => logAction({ data: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}
