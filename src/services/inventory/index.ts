export {
  getStockLevels,
  getLowStockAlerts,
  adjustStock,
  bulkAdjust,
} from "./core/inventory.service";
export { InventoryRepository } from "./repositories/inventory.repository";
export {
  useStockLevels,
  useLowStockAlerts,
  useAdjustStock,
  useBulkAdjust,
} from "./hooks/useInventoryService";
export type { StockLevel, InventoryAdjustment, LowStockAlert } from "./interfaces/types";
