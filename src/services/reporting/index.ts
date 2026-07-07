export { getDashboardMetrics, getRevenueChart, getBranchPerformance, getTopProducts } from "./core/reporting.service";
export { ReportingRepository } from "./repositories/reporting.repository";
export { useDashboardMetrics, useRevenueChart, useBranchPerformance, useTopProducts } from "./hooks/useReportingService";
export type { DashboardMetrics, RevenueDataPoint, BranchPerformance, ProductPerformance, ReportFilter } from "./interfaces/types";