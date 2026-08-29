import { useQuery } from "@tanstack/react-query";
import { getSimilarProducts, getNewArrivalRecommendations } from "../core/recommendation.service";

export function useSimilarProducts(categoryId: string, productId: string) {
  return useQuery({
    queryKey: ["recommendation", "similar", categoryId, productId],
    queryFn: () => getSimilarProducts({ data: { categoryId, productId } }),
    enabled: !!categoryId && !!productId,
  });
}

export function useNewArrivalRecommendations() {
  return useQuery({
    queryKey: ["recommendation", "new-arrivals"],
    queryFn: () => getNewArrivalRecommendations(),
  });
}
