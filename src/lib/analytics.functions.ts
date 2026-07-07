// ============================================================
// COMPATIBILITY SHIM â€” analytics.functions.ts
// This file is now a re-export bridge to the Reporting Service.
// New code should import directly from "@/services/reporting"
// ============================================================

export {
  getDashboardMetrics,
  getRevenueChart,
  getBranchPerformance,
  getTopProducts,
} from "@/services/reporting";