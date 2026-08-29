// ============================================================
// ADMIN SERVICE â€” Public Barrel
// Routes and components should import from here.
// Internal logic lives in src/lib/admin.functions.ts which
// is preserved as the canonical admin server-function module.
// ============================================================

export {
  getDashboardMetrics,
  getBranchAnalytics,
  getCustomerAnalytics,
  getSystemActivity,
  updateProfile,
  deleteProfile,
  listAdminOrders,
  updateOrderStatus,
  listAdminProducts,
  upsertProduct,
  deleteProduct,
  listAdminBranches,
  upsertBranch,
  deleteBranch,
  getMyRole,
  getAdminConsoleState,
  grantSelfAdmin,
  updateProductStock,
  upsertCategory,
  deleteCategory,
} from "@/lib/admin.functions";
