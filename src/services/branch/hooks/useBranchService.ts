import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listBranches, listAdminBranches, getBranchById, createBranch, updateBranch } from "../core/branch.service";
import { toast } from "sonner";

export function useBranches() {
  return useQuery({ queryKey: ["branches"], queryFn: () => listBranches() });
}

export function useAdminBranches() {
  return useQuery({ queryKey: ["admin", "branches"], queryFn: () => listAdminBranches() });
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: ["branches", id],
    queryFn: () => getBranchById({ data: { id } }),
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createBranch({ data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches"] }); toast.success("Branch created!"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => updateBranch({ data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches"] }); toast.success("Branch updated!"); },
    onError: (e: Error) => toast.error(e.message),
  });
}