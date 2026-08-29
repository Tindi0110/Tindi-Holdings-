import { useQuery } from "@tanstack/react-query";
import {
  getDashboardMetrics,
  getRevenueChart,
  getBranchPerformance,
  getTopProducts,
} from "../core/reporting.service";

export function useDashboardMetrics(isAdmin: boolean) {
  return useQuery({
    queryKey: ["reporting", "dashboard"],
    queryFn: () => getDashboardMetrics(),
    enabled: isAdmin,
  });
}

export function useRevenueChart(isAdmin: boolean) {
  return useQuery({
    queryKey: ["reporting", "revenue"],
    queryFn: () => getRevenueChart(),
    enabled: isAdmin,
  });
}

export function useBranchPerformance(isAdmin: boolean) {
  return useQuery({
    queryKey: ["reporting", "branches"],
    queryFn: () => getBranchPerformance(),
    enabled: isAdmin,
  });
}

export function useTopProducts(isAdmin: boolean) {
  return useQuery({
    queryKey: ["reporting", "products"],
    queryFn: () => getTopProducts(),
    enabled: isAdmin,
  });
}
