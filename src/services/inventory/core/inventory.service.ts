import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { InventoryRepository } from "../repositories/inventory.repository";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const getStockLevels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await requireAdmin(context.userId);
    return InventoryRepository.findAll();
  });

export const getLowStockAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await requireAdmin(context.userId);
    return InventoryRepository.findLowStock();
  });

export const adjustStock = createServerFn({ method: "POST" })
  .inputValidator((input: any) => z.object({
    productId: z.string().uuid(),
    quantityDelta: z.number(),
    reason: z.string().min(1),
  }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const newStock = await InventoryRepository.updateStock(data.productId, data.quantityDelta);
    return { success: true, newStock };
  });

export const bulkAdjust = createServerFn({ method: "POST" })
  .inputValidator((input: any) => z.object({
    adjustments: z.array(z.object({ productId: z.string().uuid(), quantityDelta: z.number(), reason: z.string() })),
  }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const results = await Promise.all(
      data.adjustments.map((adj: any) => InventoryRepository.updateStock(adj.productId, adj.quantityDelta))
    );
    return { success: true, updated: results.length };
  });