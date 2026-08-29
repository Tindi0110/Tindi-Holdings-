import { useQuery } from "@tanstack/react-query";
import { searchProducts, getSearchSuggestions, getTrendingSearches } from "../core/search.service";
import { SearchQuery } from "../interfaces/types";

export function useSearch(query: SearchQuery) {
  return useQuery({
    queryKey: ["search", "results", query],
    queryFn: () => searchProducts({ data: query }),
  });
}

export function useSearchSuggestions(prefix: string) {
  return useQuery({
    queryKey: ["search", "suggestions", prefix],
    queryFn: () => getSearchSuggestions({ data: { prefix } }),
    enabled: prefix.length >= 2,
  });
}

export function useTrendingSearches() {
  return useQuery({
    queryKey: ["search", "trending"],
    queryFn: () => getTrendingSearches(),
  });
}
