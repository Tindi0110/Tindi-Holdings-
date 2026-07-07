import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGlobalSettings, updateGlobalSettings, getBranchSettings, updateBranchSettings, getFeatureFlags } from "../core/settings.service";
import { toast } from "sonner";

export function useGlobalSettings() {
  return useQuery({ queryKey: ["settings", "global"], queryFn: () => getGlobalSettings() });
}

export function useBranchSettings(branchId: string) {
  return useQuery({
    queryKey: ["settings", "branch", branchId],
    queryFn: () => getBranchSettings({ data: { branchId } }),
    enabled: !!branchId
  });
}

export function useUpdateGlobalSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) => updateGlobalSettings({ data: settings }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("System configurations updated!");
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useFeatureFlags() {
  return useQuery({ queryKey: ["settings", "feature-flags"], queryFn: () => getFeatureFlags() });
}