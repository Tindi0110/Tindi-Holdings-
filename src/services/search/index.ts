export { searchProducts, getSearchSuggestions, getTrendingSearches } from "./core/search.service";
export { SearchRepository } from "./repositories/search.repository";
export { useSearch, useSearchSuggestions, useTrendingSearches } from "./hooks/useSearchService";
export type { SearchQuery, SearchResult, SearchSuggestion } from "./interfaces/types";
