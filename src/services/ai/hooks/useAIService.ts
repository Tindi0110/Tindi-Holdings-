import { useQuery, useMutation } from "@tanstack/react-query";
import { askAssistant, getBusinessInsights } from "../core/ai.service";

export function useAskAssistant() {
  return useMutation({
    mutationFn: (payload: { prompt: string; context?: string }) => askAssistant({ data: payload })
  });
}

export function useBusinessInsights(isAdmin: boolean) {
  return useQuery({
    queryKey: ["ai", "insights"],
    queryFn: () => getBusinessInsights(),
    enabled: isAdmin
  });
}