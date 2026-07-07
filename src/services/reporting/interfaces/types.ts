export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  todayRevenue: number;
  todayOrders: number;
  avgOrderValue: number;
  refundRate: number;
  pendingOrders: number;
  lowStockCount: number;
}
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}
export interface BranchPerformance {
  branchName: string;
  revenue: number;
  orders: number;
}
export interface ProductPerformance {
  productName: string;
  totalSold: number;
  revenue: number;
}
export interface ReportFilter {
  branchId?: string;
  dateRange?: { from: string; to: string };
}