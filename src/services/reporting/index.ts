// ============================================================
// REPORTING & ANALYTICS SERVICE — Public Barrel
// Routes and components should import from here.
// Core report generation logic lives in src/lib/analytics.functions.ts
// ============================================================

export {
  getSalesReport,
  getInventoryReport,
  getCustomersReport,
  getBranchesReport,
  getFinancialReport,
  getSalesAnalytics,
  getCustomerAnalyticsDetailed,
  getProductAnalytics,
  getBranchAnalyticsDetailed,
  getRevenueAnalytics,
  getConversionAnalytics,
} from "@/lib/analytics.functions";

export {
  getDashboardMetrics,
  getRevenueChart,
  getBranchPerformance,
  getTopProducts,
} from "./core/reporting.service";

export { ReportingRepository } from "./repositories/reporting.repository";
export type {
  DashboardMetrics,
  RevenueDataPoint,
  BranchPerformance,
  ProductPerformance,
  ReportFilter,
} from "./interfaces/types";
