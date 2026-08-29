import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SupplierRepository } from "../repositories/supplier.repository";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const listSuppliers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await requireAdmin(context.userId);
    return SupplierRepository.getSuppliers();
  });

export const listPurchaseOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: any) => {
    await requireAdmin(context.userId);
    return SupplierRepository.getPurchaseOrders();
  });

export const createSupplier = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        name: z.string().min(1),
        contact_name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    return {
      id: `sup-${Math.floor(Math.random() * 1000)}`,
      ...data,
      status: "active",
      created_at: new Date().toISOString(),
    };
  });

export const createPurchaseOrder = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        supplierId: z.string(),
        items: z.array(
          z.object({ productName: z.string(), quantity: z.number(), unitCost: z.number() }),
        ),
        notes: z.string().optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const total_amount = data.items.reduce(
      (sum: number, it: any) => sum + it.quantity * it.unitCost,
      0,
    );
    return {
      id: `po-${Math.floor(Math.random() * 1000)}`,
      po_number: `PO-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier_id: data.supplierId,
      status: "draft",
      total_amount,
      expected_delivery: null,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
    };
  });
